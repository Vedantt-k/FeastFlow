import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  description: string;
  cuisine: string[];
  owner: mongoose.Types.ObjectId;
  image: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  phone: string;
  email: string;
  openingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  isOpen: boolean;
  isActive: boolean;
  deliveryTime: number;
  deliveryFee: number;
  minOrder: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    cuisine: [{ type: String }],
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    coverImage: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: { lat: Number, lng: Number },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    isOpen: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    deliveryTime: { type: Number, default: 30 },
    deliveryFee: { type: Number, default: 40 },
    minOrder: { type: Number, default: 100 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

RestaurantSchema.index({ name: 'text', cuisine: 'text' });

export default mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
