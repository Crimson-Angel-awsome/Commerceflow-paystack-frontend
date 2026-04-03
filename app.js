/* ═══════════════════════════════════════════
   PStark Ecommerce — app.js
   ═══════════════════════════════════════════ */

// ─────────────────────────────────────────────
//  CONFIG — Replace with your real endpoint
// ─────────────────────────────────────────────
const PRODUCTS_ENDPOINT = ''; // e.g. 'https://your-api.com/products'

// Paystack public key (for inline JS popup if needed later)
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxx';

// ─────────────────────────────────────────────
//  DEMO PRODUCTS (used when no endpoint is set)
// ─────────────────────────────────────────────
const DEMO_PRODUCTS = [
  { id: 1,  name: 'Wireless Earbuds Pro',   category: 'gadgets',   price: 15999,  rating: 4.5, reviews: 128, emoji: '🎧', badge: 'New',  description: 'Active noise-cancelling with 30hr battery life.' },
  { id: 2,  name: 'Smart 4K TV 55"',        category: 'gadgets',   price: 189999, rating: 4.7, reviews: 94,  emoji: '📺', badge: 'Hot',  description: 'Crystal clear 4K display with built-in Android TV.' },
  { id: 3,  name: 'Ergonomic Office Chair', category: 'furniture', price: 48500,  rating: 4.4, reviews: 76,  emoji: '🪑', badge: null,   description: 'Lumbar support, adjustable height, breathable mesh.' },
  { id: 4,  name: 'Minimalist Desk Lamp',   category: 'home',      price: 7800,   rating: 4.2, reviews: 55,  emoji: '💡', badge: null,   description: 'USB-C charging, touch dimmer, warm & cool light.' },
  { id: 5,  name: 'Running Shoes Ultra',    category: 'sports',    price: 22000,  rating: 4.6, reviews: 210, emoji: '👟', badge: 'Sale', description: 'Lightweight foam sole, moisture-wicking upper.' },
  { id: 6,  name: 'Mechanical Keyboard',    category: 'gadgets',   price: 35000,  rating: 4.8, reviews: 188, emoji: '⌨️', badge: 'Top',  description: 'RGB backlit, tactile brown switches, aluminum frame.' },
  { id: 7,  name: 'Wooden Coffee Table',    category: 'furniture', price: 67000,  rating: 4.3, reviews: 42,  emoji: '🪵', badge: null,   description: 'Solid oak, minimalist Scandinavian design.' },
  { id: 8,  name: 'Polo Shirt Premium',     category: 'fashion',   price: 6500,   rating: 4.1, reviews: 300, emoji: '👕', badge: null,   description: '100% pima cotton, preshrunk, 12 colours available.' },
];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let allProducts      = [];
let filteredProducts = [];
let cart             = [];
let currentCategory  = 'all';
let timerInterval    = null;
let toastTimer       = null;

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
async function init() {
  renderLoading();
  try {
    if (PRODUCTS_ENDPOINT) {
      const res = await fetch(PRODUCTS_ENDPOINT);
      if (!res.ok) throw new Error('Fetch failed');
      allProducts = await res.json();
    } else {
      await new Promise(r => setTimeout(r, 600)); // simulate network delay
      allProducts = DEMO_PRODUCTS;
    }
    filteredProducts = [...allProducts];
    renderProducts(filteredProducts);
  } catch (e) {
    renderError();
  }
}

// ─────────────────────────────────────────────
//  RENDER — Loading skeleton
// ─────────────────────────────────────────────
function renderLoading() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = Array(8).fill(0).map(() => `
    <div class="product-card" style="pointer-events:none">
      <div class="card-img" style="background:var(--black3)"></div>
      <div class="card-body" style="gap:0.6rem">
        <div style="height:10px;background:var(--black3);border-radius:4px;width:50%"></div>
        <div style="height:14px;background:var(--black3);border-radius:4px;width:85%"></div>
        <div style="height:10px;background:var(--black3);border-radius:4px;width:70%"></div>
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
//  RENDER — Error / no endpoint
// ─────────────────────────────────────────────
function renderError() {
  document.getElementById('productGrid').innerHTML = `
    <div class="state-box">
      <div class="icon">⚠️</div>
      <p>Could not load products. Set your endpoint in <code>app.js</code>.</p>
      <div class="endpoint-hint">
        <h4>📡 How to connect your endpoint</h4>
        <pre>// In app.js, find:
const PRODUCTS_ENDPOINT = '';

// Set your API URL:
const PRODUCTS_ENDPOINT = 'https://your-api.com/products';

// Expected JSON format:
[{
  "id": 1,
  "name": "Product Name",
  "category": "gadgets",
  "price": 15000,
  "rating": 4.5,
  "reviews": 120,
  "image": "https://...",   // optional
  "emoji": "📦",            // fallback icon
  "badge": "New",           // optional label
  "description": "..."
}]</pre>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────
//  RENDER — Product cards
// ─────────────────────────────────────────────
function renderProducts(products) {
  const grid = document.getElementById('productGrid');

  if (!products.length) {
    grid.innerHTML = `
      <div class="state-box">
        <div class="icon">🔍</div>
        <p>No products found. Try a different category or search term.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.06}s">
      <div class="card-img-wrap">
        <div class="card-img">
          ${p.image
            ? `<img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='<span style=\\"font-size:3rem\\">${p.emoji || '📦'}</span>'" />`
            : `<span style="font-size:3rem">${p.emoji || '📦'}</span>`
          }
        </div>
        ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
      </div>
      <div class="card-body">
        <div class="card-category">${p.category || 'General'}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.description || ''}</div>
        <div class="card-rating">
          <span class="stars">${renderStars(p.rating || 0)}</span>
          <span class="rating-count">(${p.reviews || 0})</span>
        </div>
        <div class="card-footer">
          <div class="card-price">₦${Number(p.price).toLocaleString()}</div>
          <button class="add-to-cart" id="atc-${p.id}" onclick="addToCart(${p.id})">
            + Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

// ─────────────────────────────────────────────
//  FILTER & SORT
// ─────────────────────────────────────────────
function filterByCategory(cat, el) {
  currentCategory = cat;
  document.querySelectorAll('.hero-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  applyFilters();
}

function filterProducts() {
  applyFilters();
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  filteredProducts = allProducts.filter(p => {
    const matchCat = currentCategory === 'all' || (p.category || '').toLowerCase() === currentCategory;
    const matchQ   = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  renderProducts(filteredProducts);
}

function sortProducts(val) {
  if (val === 'price-asc')  filteredProducts.sort((a, b) => a.price - b.price);
  else if (val === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
  else if (val === 'name')  filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  else filteredProducts = allProducts.filter(p => currentCategory === 'all' || p.category === currentCategory);
  renderProducts(filteredProducts);
}

// ─────────────────────────────────────────────
//  CART — Add item
// ─────────────────────────────────────────────
function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();

  const btn = document.getElementById(`atc-${id}`);
  if (btn) {
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ Add';
      btn.classList.remove('added');
    }, 1500);
  }

  showToast(`🛒 ${product.name} added to cart`, 'success');
}

// ─────────────────────────────────────────────
//  CART — Update UI
// ─────────────────────────────────────────────
function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const badge = document.getElementById('cartBadge');
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);

  document.getElementById('cartTotal').textContent = `₦${total.toLocaleString()}`;
  document.getElementById('checkoutBtn').disabled = cart.length === 0;

  const container = document.getElementById('cartItems');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="icon">🛒</div>
        <p>Your cart is empty.<br>Browse products and add items!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='${item.emoji || '📦'}'" />`
          : item.emoji || '📦'
        }
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₦${Number(item.price).toLocaleString()}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remove">🗑</button>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
//  CART — Qty controls & remove
// ─────────────────────────────────────────────
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

// ─────────────────────────────────────────────
//  CART — Toggle sidebar
// ─────────────────────────────────────────────
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('overlay');
  const isOpen  = sidebar.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
}

// ─────────────────────────────────────────────
//  PAYSTACK MODAL — Open
// ─────────────────────────────────────────────
function openPaystackModal() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const items = cart.reduce((s, i) => s + i.qty, 0);

  document.getElementById('orderSummaryCard').innerHTML = `
    <div class="order-row">
      <span>Items (${items})</span>
      <span class="val">₦${total.toLocaleString()}</span>
    </div>
    <div class="order-row">
      <span>Delivery</span>
      <span class="val">₦0 (Free)</span>
    </div>
    <div class="order-row total">
      <span>Total</span>
      <span class="val">₦${total.toLocaleString()}</span>
    </div>
  `;

  document.getElementById('payFormSection').style.display = 'block';
  document.getElementById('acctDisplay').classList.remove('show');
  document.getElementById('paystackModal').classList.add('open');
  document.getElementById('overlay').classList.add('open');
}

// ─────────────────────────────────────────────
//  PAYSTACK MODAL — Close
// ─────────────────────────────────────────────
function closePaystackModal() {
  document.getElementById('paystackModal').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  if (timerInterval) clearInterval(timerInterval);
}

// ─────────────────────────────────────────────
//  OVERLAY — Close all panels
// ─────────────────────────────────────────────
function closeAll() {
  document.getElementById('cartSidebar').classList.remove('open');
  closePaystackModal();
  document.getElementById('overlay').classList.remove('open');
}

// ─────────────────────────────────────────────
//  PAYSTACK — Generate dedicated virtual account
// ─────────────────────────────────────────────
async function generateAccountNumber() {
  const name  = document.getElementById('payName').value.trim();
  const email = document.getElementById('payEmail').value.trim();
  const phone = document.getElementById('payPhone').value.trim();

  if (!name || !email || !phone) {
    showToast('⚠️ Please fill in all fields', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('⚠️ Enter a valid email address', 'error');
    return;
  }

  const btn = document.querySelector('.pay-btn');
  btn.innerHTML = '<span class="spinner"></span> Generating...';
  btn.disabled  = true;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // ── PAYSTACK DEDICATED VIRTUAL ACCOUNT (DVA) ──────────────────
  // In production, this call must go through YOUR backend server.
  // Your backend calls:
  //   POST https://api.paystack.co/dedicated_account
  //   Authorization: Bearer YOUR_SECRET_KEY
  //   Body: { customer: { email }, preferred_bank: 'wema-bank' }
  //
  // Never expose your secret key in frontend code.
  // Replace the simulated block below with a fetch to your backend:
  //
  //   const res  = await fetch('/api/generate-account', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ name, email, phone, amount: total })
  //   });
  //   const data = await res.json();
  //   // data should contain: bank, account_number, account_name
  // ──────────────────────────────────────────────────────────────

  // DEMO simulation (remove once backend is connected):
  await new Promise(r => setTimeout(r, 1800));
  const banks  = ['Wema Bank', 'Access Bank', 'Sterling Bank', 'Titan Trust Bank'];
  const bank   = banks[Math.floor(Math.random() * banks.length)];
  const acctNo = '010' + Math.floor(Math.random() * 9000000 + 1000000);

  // Populate the account display:
  document.getElementById('acctBank').textContent   = bank;
  document.getElementById('acctNumber').textContent = acctNo;
  document.getElementById('acctName').textContent   = `PStark — ${name.toUpperCase()}`;
  document.getElementById('acctAmount').textContent = `Transfer exactly ₦${total.toLocaleString()}`;

  document.getElementById('payFormSection').style.display = 'none';
  document.getElementById('acctDisplay').classList.add('show');

  startTimer(30 * 60);

  btn.innerHTML = 'Generate Payment Account';
  btn.disabled  = false;
  showToast('✅ Account number generated!', 'success');
}

// ─────────────────────────────────────────────
//  PAYSTACK — Countdown timer
// ─────────────────────────────────────────────
function startTimer(seconds) {
  if (timerInterval) clearInterval(timerInterval);
  let remaining = seconds;
  const el = document.getElementById('acctTimer');

  timerInterval = setInterval(() => {
    remaining--;
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      el.textContent  = 'Expired';
      el.style.color  = 'var(--danger)';
    }
  }, 1000);
}

// ─────────────────────────────────────────────
//  Copy account number to clipboard
// ─────────────────────────────────────────────
function copyAcctNumber() {
  const num = document.getElementById('acctNumber').textContent;
  navigator.clipboard.writeText(num.replace(/\s/g, '')).then(() => {
    showToast('📋 Account number copied!', 'success');
  });
}

// ─────────────────────────────────────────────
//  TOAST notification
// ─────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ─────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────
init();
updateCartUI();