import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';
import User from '@/models/User';
import MenuItem from '@/models/MenuItem';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let restaurantFilter: any = {};

    if (userRole === 'restaurant_owner') {
      const restaurants = await Restaurant.find({ owner: userId }).select('_id');
      restaurantFilter = { restaurant: { $in: restaurants.map((r) => r._id) } };
    }

    // Core stats
    const [totalOrders, recentOrders, totalRevenue, statusBreakdown] = await Promise.all([
      Order.countDocuments(restaurantFilter),
      Order.countDocuments({ ...restaurantFilter, createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([
        { $match: { ...restaurantFilter, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: restaurantFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Monthly revenue chart (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          ...restaurantFilter,
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top menu items
    const topItems = await Order.aggregate([
      { $match: restaurantFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalOrdered: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          image: { $first: '$items.image' },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 },
    ]);

    // Extra stats for admin
    let adminStats = {};
    if (userRole === 'admin') {
      const [totalUsers, totalRestaurants, totalMenuItems] = await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments({ isActive: true }),
        MenuItem.countDocuments({ isAvailable: true }),
      ]);
      adminStats = { totalUsers, totalRestaurants, totalMenuItems };
    }

    const statusMap = statusBreakdown.reduce((acc: any, s: any) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    return NextResponse.json({
      stats: {
        totalOrders,
        recentOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        onDelivery: statusMap['out_for_delivery'] || 0,
        delivered: statusMap['delivered'] || 0,
        cancelled: statusMap['cancelled'] || 0,
        pending: statusMap['pending'] || 0,
        preparing: statusMap['preparing'] || 0,
        ...adminStats,
      },
      monthlyRevenue,
      topItems,
      statusBreakdown: statusMap,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
