const BASE_URL = 'http://localhost:3000';

// ========================
// PRODUCTS SLIDER
// ========================
const PRODUCTS_PER_PAGE_DESKTOP = 3;
const PRODUCTS_PER_PAGE_TABLET = 2;
const PRODUCTS_PER_PAGE_MOBILE = 1;
let allProducts = [];
let currentSlide = 0;

function getProductsPerPage() {
  if (window.innerWidth < 768) return PRODUCTS_PER_PAGE_MOBILE;
  if (window.innerWidth < 1440) return PRODUCTS_PER_PAGE_TABLET;
  return PRODUCTS_PER_PAGE_DESKTOP;
}

function getTotalSlides() {
  return 6;
}

function renderProducts(products) {
  const list = document.querySelector('.products-list');
  list.innerHTML = '';

  const perPage = getProductsPerPage();
  const start = currentSlide * perPage;
  const visible = products.slice(start, start + perPage);

  visible.forEach(item => {
    list.insertAdjacentHTML('beforeend', `
      <li class="product-card js-open-product"
          data-image="${item.image}"
          data-alt="${item.alt}"
          data-title="${item.title}"
          data-price="${item.price}"
          data-desc="${item.description || ''}">
        <img class="product-image" src="${item.image}" alt="${item.alt}" />
        <h3 class="product-title">${item.title}</h3>
        <p class="product-price">$${item.price}</p>
      </li>
    `);
  });

  updateDots();
  bindProductCards();
}

function updateDots() {
  const total = getTotalSlides();
  const dotsContainer = document.querySelector('.products-dots');
  dotsContainer.innerHTML = '';

  // Завжди рівно 6 крапок
  for (let i = 0; i < 6; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'products-dot' + (i === currentSlide ? ' active' : '');
    btn.setAttribute('aria-label', `Slide ${i + 1}`);
    btn.addEventListener('click', () => {
      currentSlide = i;
      renderProducts(allProducts);
    });
    dotsContainer.appendChild(btn);
  }

  // Disabled стан для стрілок
  const [prevBtn, nextBtn] = document.querySelectorAll('.products-btn');
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === total - 1;
}

// Стрілки
document.querySelector('.products-controls').addEventListener('click', (e) => {
  const btn = e.target.closest('.products-btn');
  if (!btn) return;

  const total = getTotalSlides();
  const isPrev = btn.getAttribute('aria-label') === 'Previous';

  if (isPrev) {
    if (currentSlide > 0) currentSlide--;
  } else {
    if (currentSlide < total - 1) currentSlide++;
  }

  renderProducts(allProducts);
});

// ========================
// BOUQUETS (show more)
// ========================
const BOUQUETS_PER_PAGE = 8;
let allBouquets = [];
let visibleCount = BOUQUETS_PER_PAGE;

function renderBouquets(bouquets) {
  const list = document.querySelector('.bouquets-list');
  list.innerHTML = '';

  bouquets.slice(0, visibleCount).forEach(item => {
    list.insertAdjacentHTML('beforeend', `
      <li class="bouquet-card js-open-product"
          data-image="${item.image}"
          data-alt="${item.alt}"
          data-title="${item.title}"
          data-price="${item.price}"
          data-desc="${item.description}">
        <img class="bouquet-image" src="${item.image}" alt="${item.alt}" />
        <h3 class="bouquet-title">${item.title}</h3>
        <p class="bouquet-price">$${item.price}</p>
      </li>
    `);
  });

  const showMoreBtn = document.querySelector('.bouquets-btn');
  if (showMoreBtn) {
    showMoreBtn.style.display = visibleCount >= bouquets.length ? 'none' : 'block';
  }

  bindProductCards();
}

document.querySelector('.bouquets-btn').addEventListener('click', () => {
  visibleCount += BOUQUETS_PER_PAGE;
  renderBouquets(allBouquets);
});

// ========================
// LOADER / ERROR
// ========================

function showLoader(container) {
  container.innerHTML = `
    <li class="loader-wrapper">
      <span class="loader"></span>
    </li>
  `;
}

function showError(container, message = 'Something went wrong. Please try again.') {
  container.innerHTML = `
    <li class="error-message">
      <p>${message}</p>
      <button class="error-retry-btn" onclick="initData()">Try again</button>
    </li>
  `;
}

// ========================
// FETCH
// ========================

// Допоміжна функція: повторює запит кілька разів з невеликою затримкою,
// якщо сервер ще не встиг піднятися
async function fetchWithRetry(url, retries = 5, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function fetchProducts() {
  const list = document.querySelector('.products-list');
  showLoader(list);
  try {
    const response = await fetchWithRetry(`${BASE_URL}/products`);
    allProducts = response.data;
    renderProducts(allProducts);
  } catch (error) {
    showError(list, 'Failed to load products. Please try again.');
  }
}

async function fetchBouquets() {
  const list = document.querySelector('.bouquets-list');
  showLoader(list);
  try {
    const response = await fetchWithRetry(`${BASE_URL}/bouquets`);
    allBouquets = response.data;
    renderBouquets(allBouquets);
  } catch (error) {
    showError(list, 'Failed to load bouquets. Please try again.');
  }
}

// ========================
// BIND CARD → PRODUCT MODAL
// ========================

function bindProductCards() {
  document.querySelectorAll('.js-open-product').forEach(card => {
    card.replaceWith(card.cloneNode(true));
  });

  document.querySelectorAll('.js-open-product').forEach(card => {
    card.addEventListener('click', () => {
      openProductModal({
        image: card.dataset.image,
        alt:   card.dataset.alt,
        title: card.dataset.title,
        price: card.dataset.price,
        desc:  card.dataset.desc,
      });
    });
  });
}

// ========================
// SWIPE (touch) для products
// ========================
let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.products-list').addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.querySelector('.products-list').addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) < 50) return; // ігноруємо маленькі рухи

  const total = getTotalSlides();
  if (diff > 0) {
    // свайп вліво → наступний
    if (currentSlide < total - 1) currentSlide++;
  } else {
    // свайп вправо → попередній
    if (currentSlide > 0) currentSlide--;
  }
  renderProducts(allProducts);
}, { passive: true });

// ========================
// RESIZE — перерендер при зміні розміру
// ========================
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    currentSlide = 0;
    if (allProducts.length) renderProducts(allProducts);
  }, 200);
});

// ========================
// INIT
// ========================

async function initData() {
  await Promise.all([fetchProducts(), fetchBouquets()]);
}

initData();
// ========================
// SCROLL TO TOP
// ========================
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('is-visible');
  } else {
    scrollTopBtn.classList.remove('is-visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});