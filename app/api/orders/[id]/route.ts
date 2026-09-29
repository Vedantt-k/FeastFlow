import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const order = await Order.findById(params.id)
      .populate('restaurant', 'name image address phone')
      .populate('user', 'name email phone')
      .lean();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { status, note } = await req.json();
    await dbConnect();

    const order = await Order.findById(params.id).populate('restaurant');
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const restaurant = order.restaurant as any;

    // Only restaurant owner or admin can update status (customer can only cancel)
    if (
      userRole === 'customer' &&
      order.user.toString() !== userId &&
      status !== 'cancelled'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      userRole === 'restaurant_owner' &&
      restaurant.owner.toString() !== userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });

    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
