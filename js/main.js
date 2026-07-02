const BASE_URL = 'http://localhost:3000';

// ========================
// STATE — один об'єкт
// ========================
const state = {
  products: {
    page: 1,
    limit: 18,
    currentSlide: 0,
  },
  bouquets: {
    page: 1,
    limit: 8,
    filter: 'all',
    total: 0,
  },
};

// ========================
// PRODUCTS SLIDER
// ========================
const PRODUCTS_PER_PAGE_DESKTOP = 3;
const PRODUCTS_PER_PAGE_TABLET = 2;
const PRODUCTS_PER_PAGE_MOBILE = 1;
let allProducts = [];

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
  const perPage = getProductsPerPage();
  const start = state.products.currentSlide * perPage;
  const visible = products.slice(start, start + perPage);

  const html = visible.map(item => `
    <li class="product-card js-open-product"
        data-image="${item.image}"
        data-alt="${item.alt}"
        data-title="${item.title}"
        data-price="${item.price}"
        data-desc="${item.description || ''}">
      <img class="product-image"
           src="${item.image}"
           srcset="${item.image} 1x, ${item.image} 2x"
           alt="${item.alt}"
           loading="lazy" />
      <h3 class="product-title">${item.title}</h3>
      <p class="product-price">$${item.price}</p>
    </li>
  `).join('');

  list.innerHTML = '';
  list.insertAdjacentHTML('beforeend', html);
  updateDots();
  bindProductCards();
}

function updateDots() {
  const total = getTotalSlides();
  const dotsContainer = document.querySelector('.products-dots');
  dotsContainer.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'products-dot' + (i === state.products.currentSlide ? ' active' : '');
    btn.setAttribute('aria-label', `Slide ${i + 1}`);
    btn.addEventListener('click', () => {
      state.products.currentSlide = i;
      renderProducts(allProducts);
    });
    dotsContainer.appendChild(btn);
  }

  const [prevBtn, nextBtn] = document.querySelectorAll('.products-btn');
  prevBtn.disabled = state.products.currentSlide === 0;
  nextBtn.disabled = state.products.currentSlide === total - 1;
}

document.querySelector('.products-controls').addEventListener('click', (e) => {
  const btn = e.target.closest('.products-btn');
  if (!btn) return;
  const total = getTotalSlides();
  const isPrev = btn.getAttribute('aria-label') === 'Previous';
  if (isPrev) { if (state.products.currentSlide > 0) state.products.currentSlide--; }
  else { if (state.products.currentSlide < total - 1) state.products.currentSlide++; }
  renderProducts(allProducts);
});

// ========================
// BOUQUETS — SORT + PAGINATION
// ========================
function renderBouquets(bouquets, append = false) {
  const list = document.querySelector('.bouquets-list');
  const showMoreBtn = document.querySelector('.bouquets-btn');

  if (!append) list.innerHTML = '';

  if (bouquets.length === 0 && !append) {
    list.insertAdjacentHTML('beforeend', `
      <li class="error-message" style="list-style:none; grid-column:1/-1">
        <p>No bouquets found.</p>
      </li>
    `);
    showMoreBtn.style.display = 'none';
    return;
  }

  const html = bouquets.map(item => `
    <li class="bouquet-card js-open-product"
        data-image="${item.image}"
        data-alt="${item.alt}"
        data-title="${item.title}"
        data-price="${item.price}"
        data-desc="${item.description}">
      <img class="bouquet-image"
           src="${item.image}"
           srcset="${item.image} 1x, ${item.image} 2x"
           alt="${item.alt}"
           loading="lazy" />
      <h3 class="bouquet-title">${item.title}</h3>
      <p class="bouquet-price">$${item.price}</p>
    </li>
  `).join('');

  list.insertAdjacentHTML('beforeend', html);

  const loaded = state.bouquets.page * state.bouquets.limit;
  showMoreBtn.style.display = loaded >= state.bouquets.total ? 'none' : 'block';

  bindProductCards();
}

document.querySelector('.bouquets-btn').addEventListener('click', async () => {
  state.bouquets.page += 1;
  await fetchBouquets(true);
});

document.querySelector('.bouquets-filter').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  // Скидаємо сторінку при зміні сортування
  state.bouquets.page = 1;
  state.bouquets.filter = btn.dataset.filter;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  fetchBouquets(false);
});

// ========================
// LOADER / ERROR
// ========================
function showLoader(container) {
  container.innerHTML = `<li class="loader-wrapper"><span class="loader"></span></li>`;
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
// FETCH — axios + async/await + _page/_limit
// ========================
async function fetchWithRetry(url, retries = 3, delay = 500) {
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
    const response = await fetchWithRetry(
      `${BASE_URL}/products?_page=${state.products.page}&_per_page=${state.products.limit}`
    );
    allProducts = Array.isArray(response.data) ? response.data : response.data.data;
    renderProducts(allProducts);
  } catch (error) {
    showError(list, 'Failed to load products. Please try again.');
  }
}

async function fetchBouquets(append = false) {
  const list = document.querySelector('.bouquets-list');
  if (!append) showLoader(list);

  try {
    let url = `${BASE_URL}/bouquets?_page=${state.bouquets.page}&_per_page=${state.bouquets.limit}`;

    if (state.bouquets.filter === 'under80') url += '&price_lte=79';
    if (state.bouquets.filter === '80to100') url += '&price_gte=80&price_lte=100';
    if (state.bouquets.filter === 'over100') url += '&price_gte=101';

    const response = await fetchWithRetry(url);

    // json-server v1 повертає total в response.data.items
    const data = Array.isArray(response.data) ? response.data : response.data.data;
    const total = response.data.items || data.length;
    state.bouquets.total = total;

    renderBouquets(data, append);
  } catch (error) {
    if (!append) showError(list, 'Failed to load bouquets. Please try again.');
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
// SWIPE
// ========================
let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.products-list').addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.querySelector('.products-list').addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) < 50) return;
  const total = getTotalSlides();
  if (diff > 0) { if (state.products.currentSlide < total - 1) state.products.currentSlide++; }
  else { if (state.products.currentSlide > 0) state.products.currentSlide--; }
  renderProducts(allProducts);
}, { passive: true });

// ========================
// RESIZE
// ========================
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    state.products.currentSlide = 0;
    if (allProducts.length) renderProducts(allProducts);
  }, 200);
});

// ========================
// INIT
// ========================
async function initData() {
  await Promise.all([fetchProducts(), fetchBouquets(false)]);
}

initData();

// ========================
// SCROLL TO TOP
// ========================
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('is-visible', window.scrollY > 400);
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
