import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import Restaurant from '@/models/Restaurant';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 });
    }

    const query: any = { restaurant: restaurantId, isAvailable: true };
    if (category) query.category = category;

    const items = await MenuItem.find(query).sort({ category: 1, name: 1 }).lean();

    // Group by category
    const grouped = items.reduce((acc: Record<string, any[]>, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    return NextResponse.json({ items, grouped, categories: Object.keys(grouped) });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // Verify ownership
    const restaurant = await Restaurant.findById(body.restaurant);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (restaurant.owner.toString() !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const item = await MenuItem.create(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
