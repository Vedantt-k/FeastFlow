# 🍽️ FeastFlow — Food Delivery & Restaurant Ordering System

A full-stack food delivery app built with **Next.js 14**, **Tailwind CSS**, and **MongoDB**.

## ✨ Features

### 🔐 Authentication
- Email/password sign-up and sign-in
- **Google OAuth** sign-in
- Role-based access control (Customer, Restaurant Owner, Admin)
- JWT sessions via NextAuth.js

### 🏪 Restaurant Module
- Browse and search restaurants
- Filter by cuisine type
- Restaurant detail page with cover image, stats
- Open/Closed status toggle

### 🍕 Menu Module
- Menu grouped by category
- Veg/Non-Veg filter toggle
- Add/Edit/Delete menu items (owners)
- Item availability toggle

### 🛒 Cart Module
- Persistent cart (Zustand + localStorage)
- Add/remove/update quantities
- Cart sidebar on restaurant page
- Full cart page

### 📦 Order Module
- Place orders with delivery address
- Payment method selection (COD / Online)
- Real-time order tracking with status stepper
- Order history with filters
- Cancel orders

### 📊 Dashboard & Analytics
- Revenue + order charts (Recharts)
- Order status donut chart
- Top selling items
- Manage restaurants, menus, orders
- Settings page

---

## 🚀 Getting Started

### 1. Clone / Download
```bash
# Unzip the project, then:
cd food-delivery
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# MongoDB Atlas URI
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/food-delivery

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (from console.cloud.google.com)
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-secret
```

### 3. Set Up MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Add your IP to the allowlist (or use `0.0.0.0/0` for dev)
5. Copy the connection string to `MONGODB_URI`

### 4. Set Up Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API** / **Google Identity**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 5. Seed the Database (Optional)
```bash
npx tsx scripts/seed.ts
```

This creates:
- Admin: `admin@feastflow.com` / `password123`
- Owner: `owner@feastflow.com` / `password123`
- Customer: `customer@feastflow.com` / `password123`
- 4 sample restaurants with menu items

### 6. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
food-delivery/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Register page
│   ├── (dashboard)/
│   │   └── dashboard/      # Dashboard pages
│   │       ├── page.tsx    # Overview
│   │       ├── orders/     # Order management
│   │       ├── menu/       # Menu management
│   │       ├── restaurants/# Restaurant management
│   │       ├── analytics/  # Analytics charts
│   │       └── settings/   # Settings
│   ├── api/
│   │   ├── auth/           # NextAuth + Register
│   │   ├── restaurants/    # Restaurant CRUD
│   │   ├── menu/           # Menu CRUD
│   │   ├── orders/         # Order CRUD
│   │   └── dashboard/      # Analytics API
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout page
│   ├── orders/             # Orders list + detail
│   ├── restaurant/[id]/    # Restaurant detail + menu
│   ├── restaurants/        # Restaurants listing
│   └── page.tsx            # Homepage
├── components/
│   ├── layout/             # Navbar
│   ├── restaurant/         # RestaurantCard
│   ├── menu/               # MenuItemCard
│   └── cart/               # CartSidebar
├── hooks/
│   └── useCart.ts          # Zustand cart store
├── lib/
│   ├── auth.ts             # NextAuth options
│   ├── db.ts               # MongoDB connection
│   └── utils.ts            # Utility functions
├── models/
│   ├── User.ts
│   ├── Restaurant.ts
│   ├── MenuItem.ts
│   ├── Order.ts
│   └── Review.ts
└── scripts/
    └── seed.ts             # Database seeder
```

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v4 |
| State | Zustand |
| Charts | Recharts |
| Forms | React Hook Form |
| HTTP | Axios |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Fonts | Playfair Display + DM Sans |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET/POST | `/api/restaurants` | List / Create restaurant |
| GET/PUT/DELETE | `/api/restaurants/:id` | Restaurant operations |
| GET/POST | `/api/menu` | List / Create menu item |
| GET/PUT/DELETE | `/api/menu/:id` | Menu item operations |
| GET/POST | `/api/orders` | List / Create order |
| GET/PATCH | `/api/orders/:id` | Order detail / Update status |
| GET | `/api/dashboard` | Dashboard analytics |

---

## 🔮 Possible Enhancements
- Real-time updates with WebSockets/Socket.io
- Image upload with Cloudinary
- Stripe/Razorpay payment integration
- Push notifications
- Live order tracking map
- Reviews and ratings
- Promo code system
- Multi-language support
