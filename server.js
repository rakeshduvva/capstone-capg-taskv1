require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'shopzone-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// --- Database Connection ---
let db;
async function initDB() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'shopzone',
      waitForConnections: true,
      connectionLimit: 10
    });
    console.log('✅ MySQL connected successfully');

    // Create tables if not exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        old_price DECIMAL(10,2),
        badge VARCHAR(20),
        rating DECIMAL(2,1) DEFAULT 0,
        reviews INT DEFAULT 0,
        image_url VARCHAR(500),
        stock INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Seed products if table is empty
    const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      await db.query(`INSERT INTO products (name, category, price, old_price, badge, rating, reviews, image_url) VALUES
        ('Wireless Noise-Cancelling Headphones','Electronics',79.99,129.99,'SALE',4.8,342,'https://picsum.photos/seed/headphones/400/400'),
        ('Premium Leather Backpack','Fashion',59.99,NULL,NULL,4.6,218,'https://picsum.photos/seed/backpack/400/400'),
        ('Smart Fitness Watch Pro','Electronics',149.99,199.99,'SALE',4.9,567,'https://picsum.photos/seed/smartwatch/400/400'),
        ('Organic Cotton T-Shirt','Fashion',24.99,NULL,'NEW',4.4,89,'https://picsum.photos/seed/tshirt/400/400'),
        ('Portable Bluetooth Speaker','Electronics',39.99,59.99,'SALE',4.7,431,'https://picsum.photos/seed/speaker/400/400'),
        ('Stainless Steel Water Bottle','Home',19.99,NULL,NULL,4.5,156,'https://picsum.photos/seed/bottle/400/400'),
        ('Running Shoes Ultra Boost','Sports',89.99,119.99,'SALE',4.8,623,'https://picsum.photos/seed/shoes/400/400'),
        ('Ceramic Plant Pot Set','Home',34.99,NULL,'NEW',4.3,72,'https://picsum.photos/seed/plantpot/400/400'),
        ('USB-C Fast Charging Cable','Electronics',12.99,NULL,NULL,4.2,890,'https://picsum.photos/seed/cable/400/400'),
        ('Yoga Mat Premium','Sports',29.99,44.99,'SALE',4.6,234,'https://picsum.photos/seed/yogamat/400/400'),
        ('Scented Soy Candle Set','Home',22.99,NULL,'NEW',4.7,167,'https://picsum.photos/seed/candle/400/400'),
        ('Denim Jacket Classic Fit','Fashion',69.99,89.99,'SALE',4.5,198,'https://picsum.photos/seed/jacket/400/400')
      `);
      console.log('✅ Sample products seeded');
    }
  } catch (err) {
    console.error('❌ Database error:', err.message);
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
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, phone || null]
    );

    // Auto-login after signup
    req.session.user = { id: result.insertId, full_name, email };
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

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.user = { id: user.id, full_name: user.full_name, email: user.email };
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
    const [products] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
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

    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
      [userId, total]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.qty, item.price]
      );
    }

    res.status(201).json({ message: 'Order placed successfully', orderId });
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
