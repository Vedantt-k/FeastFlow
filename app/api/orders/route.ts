import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    let query: any = {};

    if (userRole === 'customer') {
      query.user = userId;
    } else if (userRole === 'restaurant_owner') {
      const restaurants = await Restaurant.find({ owner: userId }).select('_id');
      query.restaurant = { $in: restaurants.map((r) => r._id) };
    }

    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('restaurant', 'name image')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const userId = (session.user as any).id;

    // Calculate totals
    const subtotal = body.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const restaurant = await Restaurant.findById(body.restaurantId);
    if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

    const deliveryFee = restaurant.deliveryFee;
    const tax = Math.round(subtotal * 0.05);
    const discount = body.discount || 0;
    const total = subtotal + deliveryFee + tax - discount;

    const estimatedDelivery = new Date(Date.now() + restaurant.deliveryTime * 60 * 1000);

    const order = await Order.create({
      user: userId,
      restaurant: body.restaurantId,
      items: body.items,
      deliveryAddress: body.deliveryAddress,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      paymentMethod: body.paymentMethod || 'cod',
      paymentStatus: body.paymentMethod === 'cod' ? 'pending' : 'paid',
      promoCode: body.promoCode,
      estimatedDelivery,
      notes: body.notes,
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
