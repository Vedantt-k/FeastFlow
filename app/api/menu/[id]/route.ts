import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import Restaurant from '@/models/Restaurant';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const item = await MenuItem.findById(params.id).lean();
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const item = await MenuItem.findById(params.id).populate('restaurant');
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const restaurant = item.restaurant as any;

    if (restaurant.owner.toString() !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await MenuItem.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ item: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const item = await MenuItem.findById(params.id).populate('restaurant');
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const restaurant = item.restaurant as any;

    if (restaurant.owner.toString() !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await MenuItem.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
