import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  items: {
    menuItem: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
    customizations?: { name: string; option: string; price: number }[];
  }[];
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: Date; note?: string }[];
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'online' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  promoCode?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  notes?: string;
  orderNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        customizations: [{ name: String, option: String, price: Number }],
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'online', 'wallet'], default: 'cod' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    promoCode: { type: String },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String },
    orderNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now().toString().slice(-8).toUpperCase();
  }
  next();
});

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
