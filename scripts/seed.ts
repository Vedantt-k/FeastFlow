/**
 * Run this script to seed the database with sample data:
 * npx tsx scripts/seed.ts
 * OR
 * node -e "require('./scripts/seed.js')"
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery';

const RestaurantSchema = new mongoose.Schema({
  name: String, description: String, cuisine: [String], owner: mongoose.Schema.Types.ObjectId,
  image: String, coverImage: String, rating: Number, reviewCount: Number,
  address: { street: String, city: String, state: String, pincode: String },
  phone: String, email: String, isOpen: Boolean, isActive: Boolean,
  deliveryTime: Number, deliveryFee: Number, minOrder: Number, tags: [String], openingHours: [],
});

const MenuItemSchema = new mongoose.Schema({
  restaurant: mongoose.Schema.Types.ObjectId, name: String, description: String, price: Number,
  image: String, category: String, isVeg: Boolean, isAvailable: Boolean, rating: Number, reviewCount: Number,
});

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String, provider: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin + owner
  const pw = await bcrypt.hash('password123', 12);

  const admin = await User.findOneAndUpdate(
    { email: 'admin@feastflow.com' },
    { name: 'Admin User', email: 'admin@feastflow.com', password: pw, role: 'admin', provider: 'credentials' },
    { upsert: true, new: true }
  );

  const owner = await User.findOneAndUpdate(
    { email: 'owner@feastflow.com' },
    { name: 'Restaurant Owner', email: 'owner@feastflow.com', password: pw, role: 'restaurant_owner', provider: 'credentials' },
    { upsert: true, new: true }
  );

  const customer = await User.findOneAndUpdate(
    { email: 'customer@feastflow.com' },
    { name: 'Test Customer', email: 'customer@feastflow.com', password: pw, role: 'customer', provider: 'credentials' },
    { upsert: true, new: true }
  );

  console.log('✅ Users created');

  const restaurants = [
    {
      name: 'The Spice Garden', description: 'Authentic North Indian cuisine with aromatic spices',
      cuisine: ['Indian', 'Mughlai'], owner: owner._id,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
      rating: 4.5, reviewCount: 1240,
      address: { street: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      phone: '+91 9876543210', email: 'spicegarden@email.com',
      isOpen: true, isActive: true, deliveryTime: 35, deliveryFee: 40, minOrder: 150,
      tags: ['Biryani', 'Butter Chicken', 'Naan'],
      openingHours: [{ day: 'Monday', open: '10:00', close: '22:00', isClosed: false }],
    },
    {
      name: 'Pizza Paradiso', description: 'Wood-fired Italian pizzas made with imported ingredients',
      cuisine: ['Italian', 'Pizza'], owner: owner._id,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=1200&q=80',
      rating: 4.7, reviewCount: 890,
      address: { street: '45 Church Street', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      phone: '+91 9876543211', email: 'pizzaparadiso@email.com',
      isOpen: true, isActive: true, deliveryTime: 25, deliveryFee: 30, minOrder: 200,
      tags: ['Pizza', 'Pasta', 'Tiramisu'],
      openingHours: [{ day: 'Monday', open: '11:00', close: '23:00', isClosed: false }],
    },
    {
      name: 'Dragon Palace', description: 'Authentic Chinese and Pan-Asian cuisine',
      cuisine: ['Chinese', 'Thai', 'Asian'], owner: owner._id,
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
      rating: 4.3, reviewCount: 567,
      address: { street: '78 Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
      phone: '+91 9876543212', email: 'dragonpalace@email.com',
      isOpen: true, isActive: true, deliveryTime: 30, deliveryFee: 35, minOrder: 150,
      tags: ['Dim Sum', 'Noodles', 'Fried Rice'],
      openingHours: [{ day: 'Monday', open: '12:00', close: '22:00', isClosed: false }],
    },
    {
      name: 'Green Bowl', description: 'Healthy salads, bowls and smoothies for mindful eating',
      cuisine: ['Healthy', 'Salads', 'Vegan'], owner: owner._id,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
      rating: 4.6, reviewCount: 423,
      address: { street: '23 Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
      phone: '+91 9876543213', email: 'greenbowl@email.com',
      isOpen: true, isActive: true, deliveryTime: 20, deliveryFee: 25, minOrder: 150,
      tags: ['Salad', 'Smoothie', 'Vegan'],
      openingHours: [{ day: 'Monday', open: '08:00', close: '20:00', isClosed: false }],
    },
  ];

  const createdRestaurants: any[] = [];
  for (const r of restaurants) {
    const created = await Restaurant.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    createdRestaurants.push(created);
  }
  console.log('✅ Restaurants created');

  // Menu items
  const menuItems = [
    // Spice Garden
    { restaurant: createdRestaurants[0]._id, name: 'Butter Chicken', description: 'Tender chicken in rich tomato-butter gravy', price: 320, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80', category: 'Main Course', isVeg: false, isAvailable: true, rating: 4.8, reviewCount: 320 },
    { restaurant: createdRestaurants[0]._id, name: 'Paneer Tikka Masala', description: 'Marinated paneer in spiced tomato gravy', price: 280, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=300&q=80', category: 'Main Course', isVeg: true, isAvailable: true, rating: 4.6, reviewCount: 210 },
    { restaurant: createdRestaurants[0]._id, name: 'Veg Biryani', description: 'Fragrant basmati rice with mixed vegetables and whole spices', price: 240, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=300&q=80', category: 'Rice & Biryani', isVeg: true, isAvailable: true, rating: 4.5, reviewCount: 180 },
    { restaurant: createdRestaurants[0]._id, name: 'Chicken Biryani', description: 'Aromatic basmati rice slow-cooked with spiced chicken', price: 350, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=300&q=80', category: 'Rice & Biryani', isVeg: false, isAvailable: true, rating: 4.9, reviewCount: 450 },
    { restaurant: createdRestaurants[0]._id, name: 'Garlic Naan', description: 'Soft leavened bread with garlic butter', price: 60, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80', category: 'Breads', isVeg: true, isAvailable: true, rating: 4.4, reviewCount: 120 },
    { restaurant: createdRestaurants[0]._id, name: 'Dal Makhani', description: 'Slow-cooked black lentils in creamy tomato gravy', price: 220, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80', category: 'Main Course', isVeg: true, isAvailable: true, rating: 4.7, reviewCount: 290 },
    // Pizza Paradiso
    { restaurant: createdRestaurants[1]._id, name: 'Margherita Pizza', description: 'Classic tomato sauce, fresh mozzarella and basil', price: 380, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80', category: 'Pizzas', isVeg: true, isAvailable: true, rating: 4.8, reviewCount: 230 },
    { restaurant: createdRestaurants[1]._id, name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella and tomato', price: 460, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80', category: 'Pizzas', isVeg: false, isAvailable: true, rating: 4.9, reviewCount: 310 },
    { restaurant: createdRestaurants[1]._id, name: 'Pasta Arrabbiata', description: 'Penne in spicy tomato and garlic sauce', price: 320, image: 'https://images.unsplash.com/photo-1551183053-bf91798d92c2?w=300&q=80', category: 'Pasta', isVeg: true, isAvailable: true, rating: 4.5, reviewCount: 145 },
    { restaurant: createdRestaurants[1]._id, name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 180, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&q=80', category: 'Desserts', isVeg: true, isAvailable: true, rating: 4.9, reviewCount: 198 },
    // Dragon Palace
    { restaurant: createdRestaurants[2]._id, name: 'Dim Sum Basket', description: 'Steamed dumplings with prawn and chicken filling', price: 280, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&q=80', category: 'Starters', isVeg: false, isAvailable: true, rating: 4.7, reviewCount: 165 },
    { restaurant: createdRestaurants[2]._id, name: 'Veg Fried Rice', description: 'Wok-tossed rice with mixed vegetables', price: 220, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=80', category: 'Rice', isVeg: true, isAvailable: true, rating: 4.4, reviewCount: 98 },
    { restaurant: createdRestaurants[2]._id, name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 340, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&q=80', category: 'Main Course', isVeg: false, isAvailable: true, rating: 4.6, reviewCount: 143 },
    // Green Bowl
    { restaurant: createdRestaurants[3]._id, name: 'Avocado Bowl', description: 'Fresh avocado, quinoa, cherry tomatoes, cucumber', price: 320, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80', category: 'Bowls', isVeg: true, isAvailable: true, rating: 4.8, reviewCount: 178 },
    { restaurant: createdRestaurants[3]._id, name: 'Green Detox Smoothie', description: 'Spinach, banana, mango, ginger, coconut water', price: 180, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=300&q=80', category: 'Drinks', isVeg: true, isAvailable: true, rating: 4.7, reviewCount: 134 },
    { restaurant: createdRestaurants[3]._id, name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan, Caesar dressing', price: 260, image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=300&q=80', category: 'Salads', isVeg: true, isAvailable: true, rating: 4.5, reviewCount: 89 },
  ];

  for (const item of menuItems) {
    await MenuItem.findOneAndUpdate(
      { restaurant: item.restaurant, name: item.name },
      item,
      { upsert: true, new: true }
    );
  }

  console.log('✅ Menu items created');
  console.log('\n🎉 Seed complete!');
  console.log('\nTest accounts:');
  console.log('  Admin:    admin@feastflow.com / password123');
  console.log('  Owner:    owner@feastflow.com / password123');
  console.log('  Customer: customer@feastflow.com / password123');

  await mongoose.disconnect();
}

seed().catch(console.error);
