import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';

// GET - fetch tracking data for an order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findById(params.id)
      .populate('restaurant', 'name address phone image')
      .lean() as any;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Build tracking data
    // Restaurant location (real geocoding would use an API; we use approximate city coords)
    const cityCoords: Record<string, [number, number]> = {
      'bangalore': [12.9716, 77.5946],
      'mumbai': [19.0760, 72.8777],
      'delhi': [28.7041, 77.1025],
      'chennai': [13.0827, 80.2707],
      'hyderabad': [17.3850, 78.4867],
      'pune': [18.5204, 73.8567],
      'kolkata': [22.5726, 88.3639],
      'default': [12.9716, 77.5946],
    };

    const restaurantCity = (order.restaurant as any)?.address?.city?.toLowerCase() || 'default';
    const baseCoords = cityCoords[restaurantCity] || cityCoords['default'];

    // Simulate restaurant coords (slight offset from city center)
    const restaurantCoords: [number, number] = [
      baseCoords[0] + (Math.random() * 0.02 - 0.01),
      baseCoords[1] + (Math.random() * 0.02 - 0.01),
    ];

    // Simulate delivery address coords (another offset)
    const deliveryCoords: [number, number] = [
      baseCoords[0] + (Math.random() * 0.04 - 0.02),
      baseCoords[1] + (Math.random() * 0.04 - 0.02),
    ];

    // If order has stored coordinates use them, otherwise use simulated
    const tracking = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      restaurant: {
        name: (order.restaurant as any)?.name,
        address: (order.restaurant as any)?.address,
        phone: (order.restaurant as any)?.phone,
        image: (order.restaurant as any)?.image,
        coords: (order as any).restaurantCoords || restaurantCoords,
      },
      delivery: {
        address: order.deliveryAddress,
        coords: (order as any).deliveryCoords || deliveryCoords,
      },
      // Rider position: interpolated based on status
      rider: getRiderPosition(
        (order as any).restaurantCoords || restaurantCoords,
        (order as any).deliveryCoords || deliveryCoords,
        order.status,
        order.createdAt,
        order.estimatedDelivery
      ),
      estimatedDelivery: order.estimatedDelivery,
      statusHistory: order.statusHistory,
    };

    return NextResponse.json({ tracking });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - update delivery coordinates (called by restaurant owner/admin to update rider position)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { riderLat, riderLng, restaurantCoords, deliveryCoords } = await req.json();
    await dbConnect();

    const updateData: any = {};
    if (riderLat !== undefined) updateData.riderLat = riderLat;
    if (riderLng !== undefined) updateData.riderLng = riderLng;
    if (restaurantCoords) updateData.restaurantCoords = restaurantCoords;
    if (deliveryCoords) updateData.deliveryCoords = deliveryCoords;

    await Order.findByIdAndUpdate(params.id, { $set: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper: calculate rider position based on order status and time
function getRiderPosition(
  restaurant: [number, number],
  delivery: [number, number],
  status: string,
  createdAt: Date,
  estimatedDelivery?: Date
): [number, number] | null {
  if (!['out_for_delivery', 'confirmed', 'preparing'].includes(status)) {
    return null;
  }

  if (status !== 'out_for_delivery') {
    // Rider is still at restaurant
    return [
      restaurant[0] + (Math.random() * 0.002 - 0.001),
      restaurant[1] + (Math.random() * 0.002 - 0.001),
    ];
  }

  // Interpolate position along route
  const now = Date.now();
  const start = new Date(createdAt).getTime();
  const end = estimatedDelivery
    ? new Date(estimatedDelivery).getTime()
    : start + 45 * 60 * 1000;

  const progress = Math.min(Math.max((now - start) / (end - start), 0.1), 0.95);

  // Simple linear interpolation with slight randomness for realism
  const lat = restaurant[0] + (delivery[0] - restaurant[0]) * progress + (Math.random() * 0.002 - 0.001);
  const lng = restaurant[1] + (delivery[1] - restaurant[1]) * progress + (Math.random() * 0.002 - 0.001);

  return [lat, lng];
}
