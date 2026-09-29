import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  tags: string[];
  customizations?: {
    name: string;
    options: { name: string; price: number }[];
    required: boolean;
    multiple: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    tags: [{ type: String }],
    customizations: [
      {
        name: String,
        options: [{ name: String, price: Number }],
        required: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

MenuItemSchema.index({ restaurant: 1, category: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
