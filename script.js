// script.js
const SERVICES = [
  {
    id: "site",
    name: "сайт",
    desc: "лендинг или визитка",
    price: 105000,
    icon: "./fav.jpg",
  },
  {
    id: "song",
    name: "песню",
    desc: "инструментал или трек",
    price: 30000,
    icon: "./fav.jpg",
  },
  {
    id: "logo",
    name: "логотип",
    desc: "уникальный знак",
    price: 1500,
    icon: "./fav.jpg",
  },
  {
    id: "ad",
    name: "рекламу",
    desc: "баннер или пост",
    price: 10000,
    icon: "./fav.jpg",
  },
  {
    id: "viz",
    name: "визуализатор",
    desc: "анимация под трек",
    price: 5000,
    icon: "./fav.jpg",
  },
];

const PORTFOLIO = [
  { name: "сайты", icon: "./fav.jpg" },
  { name: "песни", icon: "./fav.jpg" },
  { name: "логотипы", icon: "./fav.jpg" },
  { name: "реклама", icon: "./fav.jpg" },
  { name: "визуализация", icon: "./fav.jpg" },
];

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let viewCounts = JSON.parse(localStorage.getItem("viewCounts") || "{}");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  document.getElementById("cartCount").innerText = count;
  document.getElementById("cartTotal").innerHTML = total + " ₽";
  document.getElementById("cartModalTotal").innerText = total;
}

function addToCart(serviceId) {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return;
  const existing = cart.find((i) => i.id === serviceId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...service, quantity: 1 });
  }
  saveCart();
  showToast("добавлено в корзину: " + service.name);
}

function removeFromCart(serviceId) {
  const existing = cart.find((i) => i.id === serviceId);
  if (existing && existing.quantity > 1) {
    existing.quantity--;
  } else {
    cart = cart.filter((i) => i.id !== serviceId);
  }
  saveCart();
  renderCartModal();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCartModal();
  showToast("корзина очищена");
}

function toggleFavorite(serviceId) {
  if (favorites.includes(serviceId)) {
    favorites = favorites.filter((id) => id !== serviceId);
    showToast("удалено из избранного");
  } else {
    favorites.push(serviceId);
    showToast("добавлено в избранное");
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderCards();
}

function incrementView(serviceId) {
  viewCounts[serviceId] = (viewCounts[serviceId] || 0) + 1;
  localStorage.setItem("viewCounts", JSON.stringify(viewCounts));
}

function renderCards() {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = SERVICES.map(
    (service) => `
        <div class="card">
            <img src="${service.icon}" class="card__icon-img" alt="icon">
            <h3 class="card__name">заказать ${service.name}</h3>
            <p class="card__text">${service.desc}</p>
            <div class="card__price-row">
                <span class="card__price">${service.price} ₽</span>
                <span class="card__count">заказов: ${viewCounts[service.id] || 0}</span>
            </div>
            <div class="card__actions">
                <button class="card__btn" data-service="${service.id}">заказать →</button>
                <button class="card__fav ${favorites.includes(service.id) ? "active" : ""}" data-fav="${service.id}">${favorites.includes(service.id) ? "❤️" : "♡"}</button>
                <button class="card__add-cart" data-cart="${service.id}">в корзину</button>
            </div>
        </div>
    `,
  ).join("");

  document.querySelectorAll(".card__btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.service;
      incrementView(id);
      renderCards();
      openSmsModal(id);
    });
  });

  document.querySelectorAll(".card__fav").forEach((btn) => {
    btn.addEventListener("click", () => toggleFavorite(btn.dataset.fav));
  });

  document.querySelectorAll(".card__add-cart").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.cart));
  });
}

function renderPortfolio() {
  const container = document.getElementById("portfolioGrid");
  container.innerHTML = PORTFOLIO.map(
    (p) => `
        <div class="portfolio-category">
            <img src="${p.icon}" class="portfolio-icon" alt="icon">
            <h4>${p.name}</h4>
            <div class="portfolio-placeholder">
                <div class="placeholder__emoji">🌱</div>
                <p class="placeholder__text">Упс! Пока нет проектов</p>
                <p class="placeholder__subtext">Вы можете стать первым!</p>
                <button class="placeholder__btn" data-placeholder="${p.name}">заказать ${p.name}</button>
            </div>
        </div>
    `,
  ).join("");

  document.querySelectorAll(".placeholder__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.placeholder;
      const service = SERVICES.find(
        (s) => s.name === name.slice(0, -1) || s.name === name,
      );
      if (service) openSmsModal(service.id);
    });
  });
}

function openSmsModal(serviceId) {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (service) {
    const msg = `Хочу заказать ${service.name} (${service.price} ₽). Номер для связи: +7...`;
    window.location.href = `sms:+79165681929?body=${encodeURIComponent(msg)}`;
  }
}

function renderCartModal() {
  const body = document.getElementById("cartModalBody");
  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty">корзина пуста</div>';
  } else {
    body.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <span><strong>${item.name}</strong> — ${item.price} ₽ × ${item.quantity}</span>
                <button class="cart-item__remove" data-remove="${item.id}">🗑️</button>
            </div>
        `,
      )
      .join("");
    document.querySelectorAll(".cart-item__remove").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
    });
  }
  updateCartUI();
}

function copyOrderToClipboard() {
  if (cart.length === 0) {
    showToast("корзина пуста");
    return;
  }
  let text = "Мой заказ в low studio:\n";
  cart.forEach((item) => {
    text += `- ${item.name}: ${item.price} ₽ × ${item.quantity} = ${item.price * item.quantity} ₽\n`;
  });
  text += `\nИтого: ${cart.reduce((s, i) => s + i.price * i.quantity, 0)} ₽\nТелефон: +7...`;
  navigator.clipboard.writeText(text);
  showToast("заказ скопирован в буфер");
}

function downloadOrderTxt() {
  if (cart.length === 0) {
    showToast("корзина пуста");
    return;
  }
  let text = "low studio — заказ\n\n";
  cart.forEach((item) => {
    text += `${item.name}: ${item.price} ₽ × ${item.quantity} = ${item.price * item.quantity} ₽\n`;
  });
  text += `\nИтого: ${cart.reduce((s, i) => s + i.price * i.quantity, 0)} ₽\nДата: ${new Date().toLocaleString()}`;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `order_${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("файл скачан");
}

function sendCartSms() {
  if (cart.length === 0) {
    showToast("корзина пуста");
    return;
  }
  let text = "low studio заказ:\n";
  cart.forEach((item) => {
    text += `${item.name} ${item.price}₽ x${item.quantity}=${item.price * item.quantity}₽\n`;
  });
  text += `Итого: ${cart.reduce((s, i) => s + i.price * i.quantity, 0)}₽`;
  window.location.href = `sms:+79165681929?body=${encodeURIComponent(text)}`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// Таймер до конца дня
function startTimer() {
  const timerEl = document.getElementById("timerClock");
  function update() {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const diff = end - now;
    if (diff <= 0) {
      timerEl.innerText = "00:00:00";
      return;
    }
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    timerEl.innerText = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  update();
  setInterval(update, 1000);
}

// Тёмная тема
function initTheme() {
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) document.body.classList.add("dark-theme");
  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-theme") ? "dark" : "light",
    );
  });
}

// Модалки
function initModals() {
  const cartModal = document.getElementById("cartModal");
  const policyModal = document.getElementById("policyModal");
  document.getElementById("viewCartBtn").onclick = () => {
    renderCartModal();
    cartModal.classList.add("show");
  };
  document.getElementById("cartModalClose").onclick = () =>
    cartModal.classList.remove("show");
  document.getElementById("policyBtn").onclick = () =>
    policyModal.classList.add("show");
  document.getElementById("policyModalClose").onclick = () =>
    policyModal.classList.remove("show");
  document.getElementById("clearCartBtn").onclick = () => {
    clearCart();
    showToast("корзина очищена");
  };
  document.getElementById("copyOrderBtn").onclick = copyOrderToClipboard;
  document.getElementById("downloadOrderBtn").onclick = downloadOrderTxt;
  document.getElementById("cartSmsBtn").onclick = sendCartSms;

  window.onclick = (e) => {
    if (e.target === cartModal) cartModal.classList.remove("show");
    if (e.target === policyModal) policyModal.classList.remove("show");
  };
}

// Скролл топ
function initScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 300);
  });
  btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  renderPortfolio();
  updateCartUI();
  startTimer();
  initTheme();
  initModals();
  initScrollTop();
});
