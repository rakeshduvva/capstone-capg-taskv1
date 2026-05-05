// ===== ShopZone E-Commerce — Main App Logic =====

// --- Product Data ---
const products = [
  { id:1, name:'Wireless Noise-Cancelling Headphones', category:'Electronics', price:79.99, oldPrice:129.99, badge:'SALE', rating:4.8, reviews:342, img:'https://picsum.photos/seed/headphones/400/400' },
  { id:2, name:'Premium Leather Backpack', category:'Fashion', price:59.99, oldPrice:null, badge:null, rating:4.6, reviews:218, img:'https://picsum.photos/seed/backpack/400/400' },
  { id:3, name:'Smart Fitness Watch Pro', category:'Electronics', price:149.99, oldPrice:199.99, badge:'SALE', rating:4.9, reviews:567, img:'https://picsum.photos/seed/smartwatch/400/400' },
  { id:4, name:'Organic Cotton T-Shirt', category:'Fashion', price:24.99, oldPrice:null, badge:'NEW', rating:4.4, reviews:89, img:'https://picsum.photos/seed/tshirt/400/400' },
  { id:5, name:'Portable Bluetooth Speaker', category:'Electronics', price:39.99, oldPrice:59.99, badge:'SALE', rating:4.7, reviews:431, img:'https://picsum.photos/seed/speaker/400/400' },
  { id:6, name:'Stainless Steel Water Bottle', category:'Home', price:19.99, oldPrice:null, badge:null, rating:4.5, reviews:156, img:'https://picsum.photos/seed/bottle/400/400' },
  { id:7, name:'Running Shoes Ultra Boost', category:'Sports', price:89.99, oldPrice:119.99, badge:'SALE', rating:4.8, reviews:623, img:'https://picsum.photos/seed/shoes/400/400' },
  { id:8, name:'Ceramic Plant Pot Set', category:'Home', price:34.99, oldPrice:null, badge:'NEW', rating:4.3, reviews:72, img:'https://picsum.photos/seed/plantpot/400/400' },
  { id:9, name:'USB-C Fast Charging Cable', category:'Electronics', price:12.99, oldPrice:null, badge:null, rating:4.2, reviews:890, img:'https://picsum.photos/seed/cable/400/400' },
  { id:10, name:'Yoga Mat Premium', category:'Sports', price:29.99, oldPrice:44.99, badge:'SALE', rating:4.6, reviews:234, img:'https://picsum.photos/seed/yogamat/400/400' },
  { id:11, name:'Scented Soy Candle Set', category:'Home', price:22.99, oldPrice:null, badge:'NEW', rating:4.7, reviews:167, img:'https://picsum.photos/seed/candle/400/400' },
  { id:12, name:'Denim Jacket Classic Fit', category:'Fashion', price:69.99, oldPrice:89.99, badge:'SALE', rating:4.5, reviews:198, img:'https://picsum.photos/seed/jacket/400/400' }
];

let cart = [];
let activeCategory = 'All';

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts(products);
});

// --- Categories ---
function renderCategories() {
  const cats = ['All', ...new Set(products.map(p => p.category))];
  const grid = document.getElementById('catGrid');
  grid.innerHTML = cats.map(c =>
    `<button class="cat-chip ${c === 'All' ? 'active' : ''}" onclick="selectCategory('${c}')">${c}</button>`
  ).join('');
}

function selectCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
  renderProducts(filtered);
}

// --- Products ---
function renderProducts(list) {
  const grid = document.getElementById('productGrid');
  document.getElementById('productCount').textContent = `${list.length} products`;
  grid.innerHTML = list.map(p => `
    <div class="product-card" id="product-${p.id}">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <button class="product-wishlist" title="Add to Wishlist">♡</button>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
          <span class="count">(${p.reviews})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            $${p.price.toFixed(2)}
            ${p.oldPrice ? `<span class="old">$${p.oldPrice.toFixed(2)}</span>` : ''}
          </div>
          <button class="add-to-cart-btn" onclick="addToCart(${p.id})" title="Add to Cart">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Search ---
function filterProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
  );
  if (activeCategory !== 'All') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }
  renderProducts(filtered);
}

// --- Cart ---
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
  showToast(`✓ ${product.name} added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  updateCart();
}

function updateCart() {
  const countEl = document.getElementById('cartCount');
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalItems;
  countEl.classList.toggle('hidden', totalItems === 0);

  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const footerEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="empty-icon">🛒</div><p>Your cart is empty</p></div>`;
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'block';
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.textContent = `$${total.toFixed(2)}`;

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartSidebar').classList.toggle('open');
}

// --- Toast ---
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Init cart display
updateCart();
