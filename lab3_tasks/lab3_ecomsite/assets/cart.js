/* ===================================================================
   Wheeler, Rawson & Co. — shared cart store.
   One cart, backed by localStorage, used by every page.
   cart.html handles display/edit; checkout.html handles payment.
   =================================================================== */

const CART_KEY = 'wr_cart';
const FREIGHT = 12.50;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateNavBadge();
}

function addToCart(id, name, price, qty) {
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, qty });
  }
  saveCart(cart);
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    return removeFromCart(id);
  }
  saveCart(cart);
  renderCartPage();
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCartPage();
}

function cartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const freight = subtotal > 0 ? FREIGHT : 0;
  return { subtotal, freight, total: subtotal + freight, totalQty };
}

/* Updates the little badge on the nav Cart link — runs on every page */
function updateNavBadge() {
  const badge = document.getElementById('nav-cart-badge');
  if (!badge) return;
  const { totalQty } = cartTotals();
  badge.textContent = totalQty;
  badge.classList.toggle('d-none', totalQty === 0);
}

/* ---------- cart.html: display + edit only ---------- */
function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return; // not on the cart page

  const cart = getCart();
  const { subtotal } = cartTotals();

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-ink-muted p-4 mb-0">Your cart is empty. <a href="index.html">Browse the catalogue.</a></p>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="p-3 rule d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h3 class="h6 mb-1">${item.name}</h3>
          <div class="small text-ink-muted mb-1">Unit: $${item.price.toFixed(2)}</div>
          <button class="btn btn-link btn-sm text-danger p-0 text-decoration-none" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
        <div class="d-flex align-items-center gap-4">
          <div class="qty-stepper">
            <button type="button" onclick="updateQty(${item.id}, -1)">-</button>
            <input type="text" readonly value="${item.qty}">
            <button type="button" onclick="updateQty(${item.id}, 1)">+</button>
          </div>
          <div class="fw-bold text-end" style="min-width:80px;">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  }

  const subEl = document.getElementById('cart-subtotal');
  if (subEl) subEl.textContent = '$' + subtotal.toFixed(2);

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) checkoutBtn.classList.toggle('disabled', cart.length === 0);
}

/* ---------- checkout.html: order summary + payment ---------- */
function renderCheckoutPage() {
  const summaryEl = document.getElementById('checkout-items');
  if (!summaryEl) return; // not on the checkout page

  const cart = getCart();
  const { subtotal, freight, total } = cartTotals();

  if (cart.length === 0) {
    summaryEl.innerHTML = '<p class="text-ink-muted mb-0">Your cart is empty. <a href="index.html">Browse the catalogue.</a></p>';
  } else {
    summaryEl.innerHTML = cart.map(item => `
      <div class="leader-row mb-2">
        <span>${item.name} &times; ${item.qty}</span>
        <span class="leader-dots"></span>
        <span class="leader-price">$${(item.price * item.qty).toFixed(2)}</span>
      </div>
    `).join('');
  }

  const subEl = document.getElementById('summary-subtotal');
  const freightEl = document.getElementById('summary-freight');
  const totalEl = document.getElementById('summary-total');
  if (subEl) subEl.textContent = '$' + subtotal.toFixed(2);
  if (freightEl) freightEl.textContent = '$' + freight.toFixed(2);
  if (totalEl) totalEl.textContent = '$' + total.toFixed(2);

  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) placeOrderBtn.disabled = cart.length === 0;
}

function placeOrder(event) {
  event.preventDefault();
  saveCart([]);
  renderCheckoutPage();
  const banner = document.getElementById('order-success');
  if (banner) {
    banner.classList.remove('d-none');
    const formCard = document.getElementById('checkout-form-card');
    if (formCard) formCard.classList.add('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavBadge();
  renderCartPage();
  renderCheckoutPage();
});
