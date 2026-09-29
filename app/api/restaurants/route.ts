import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Restaurant from '@/models/Restaurant';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const cuisine = searchParams.get('cuisine');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const query: any = { isActive: true };
    if (search) {
      query.$text = { $search: search };
    }
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email')
      .sort({ rating: -1, reviewCount: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      restaurants,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
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

    const restaurant = await Restaurant.create({
      ...body,
      owner: (session.user as any).id,
    });

    return NextResponse.json({ restaurant }, { status: 201 });
  } catch (error) {
    console.error('Create restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
