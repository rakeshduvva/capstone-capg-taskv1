require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopzone';

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'shopzone-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// ==================== MONGOOSE SCHEMAS ====================

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  phone:     { type: String, default: null }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, required: true },
  price:     { type: Number, required: true },
  old_price: { type: Number, default: null },
  badge:     { type: String, default: null },
  rating:    { type: Number, default: 0 },
  reviews:   { type: Number, default: 0 },
  image_url: { type: String },
  stock:     { type: Number, default: 100 }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_amount: { type: Number, required: true },
  status:       { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity:   { type: Number, required: true },
    price:      { type: Number, required: true }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ==================== DATABASE CONNECTION ====================

async function initDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    // Seed products if collection is empty
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        { name:'Wireless Noise-Cancelling Headphones', category:'Electronics', price:79.99, old_price:129.99, badge:'SALE', rating:4.8, reviews:342, image_url:'https://picsum.photos/seed/headphones/400/400' },
        { name:'Premium Leather Backpack', category:'Fashion', price:59.99, rating:4.6, reviews:218, image_url:'https://picsum.photos/seed/backpack/400/400' },
        { name:'Smart Fitness Watch Pro', category:'Electronics', price:149.99, old_price:199.99, badge:'SALE', rating:4.9, reviews:567, image_url:'https://picsum.photos/seed/smartwatch/400/400' },
        { name:'Organic Cotton T-Shirt', category:'Fashion', price:24.99, badge:'NEW', rating:4.4, reviews:89, image_url:'https://picsum.photos/seed/tshirt/400/400' },
        { name:'Portable Bluetooth Speaker', category:'Electronics', price:39.99, old_price:59.99, badge:'SALE', rating:4.7, reviews:431, image_url:'https://picsum.photos/seed/speaker/400/400' },
        { name:'Stainless Steel Water Bottle', category:'Home', price:19.99, rating:4.5, reviews:156, image_url:'https://picsum.photos/seed/bottle/400/400' },
        { name:'Running Shoes Ultra Boost', category:'Sports', price:89.99, old_price:119.99, badge:'SALE', rating:4.8, reviews:623, image_url:'https://picsum.photos/seed/shoes/400/400' },
        { name:'Ceramic Plant Pot Set', category:'Home', price:34.99, badge:'NEW', rating:4.3, reviews:72, image_url:'https://picsum.photos/seed/plantpot/400/400' },
        { name:'USB-C Fast Charging Cable', category:'Electronics', price:12.99, rating:4.2, reviews:890, image_url:'https://picsum.photos/seed/cable/400/400' },
        { name:'Yoga Mat Premium', category:'Sports', price:29.99, old_price:44.99, badge:'SALE', rating:4.6, reviews:234, image_url:'https://picsum.photos/seed/yogamat/400/400' },
        { name:'Scented Soy Candle Set', category:'Home', price:22.99, badge:'NEW', rating:4.7, reviews:167, image_url:'https://picsum.photos/seed/candle/400/400' },
        { name:'Denim Jacket Classic Fit', category:'Fashion', price:69.99, old_price:89.99, badge:'SALE', rating:4.5, reviews:198, image_url:'https://picsum.photos/seed/jacket/400/400' }
      ]);
      console.log('✅ Sample products seeded');
    }
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    console.log('⚠️  Server running without database. Using in-memory data.');
  }
}

// --- Auth Middleware ---
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'Please login first' });
}

// ==================== AUTH ROUTES ====================

// POST /api/signup
app.post('/api/signup', async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null
    });

    // Auto-login after signup
    req.session.user = { id: user._id, full_name: user.full_name, email: user.email };
    res.status(201).json({ message: 'Account created successfully', user: req.session.user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.user = { id: user._id, full_name: user.full_name, email: user.email };
    res.json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// GET /api/me — get current user
app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// ==================== PRODUCT ROUTES ====================

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ==================== ORDER ROUTES ====================

// POST /api/orders
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { items, total } = req.body;
    const userId = req.session.user.id;

    const order = await Order.create({
      user_id: userId,
      total_amount: total,
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.qty,
        price: item.price
      }))
    });

    res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// ==================== PAGE ROUTES ====================
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// --- Start Server ---
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🛍️  ShopZone server running at http://localhost:${PORT}`);
  });
});
