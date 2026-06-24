// ========================
// PRODUCT DETAILS MODAL
// ========================
const productModal = document.getElementById('productModal');
const productModalClose = document.getElementById('productModalClose');
const productModalBuy = document.getElementById('productModalBuy');

function openProductModal(data) {
  document.getElementById('productModalImage').src = data.image;
  document.getElementById('productModalImage').alt = data.alt;
  document.getElementById('productModalImage').width = 536;
  document.getElementById('productModalTitle').textContent = data.title;
  document.getElementById('productModalPrice').textContent = '$' + data.price;
  document.getElementById('productModalDesc').textContent = data.desc;
  productModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  productModal.classList.remove('is-open');
  document.body.style.overflow = '';
}

productModalClose.addEventListener('click', closeProductModal);
productModal.addEventListener('click', (e) => {
  if (e.target === productModal) closeProductModal();
});

// ========================
// ORDER MODAL
// ========================
const orderModal = document.getElementById('orderModal');
const modalClose = document.getElementById('modalClose');

function openOrderModal() {
  orderModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  orderModal.classList.remove('is-open');
  document.body.style.overflow = '';
}

// "Buy now" → закрити деталі, відкрити замовлення
productModalBuy.addEventListener('click', () => {
  closeProductModal();
  setTimeout(openOrderModal, 200);
});

modalClose.addEventListener('click', closeOrderModal);
orderModal.addEventListener('click', (e) => {
  if (e.target === orderModal) closeOrderModal();
});

// Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (orderModal.classList.contains('is-open')) closeOrderModal();
    else if (productModal.classList.contains('is-open')) closeProductModal();
  }
});

// Форма замовлення
const orderForm = document.getElementById('orderForm');

function validateField(field) {
  const isEmpty = field.value.trim() === '';
  const wrap = field.closest('.modal-field');

  if (isEmpty) {
    field.classList.add('is-error');
    let err = wrap.querySelector('.modal-field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'modal-field-error';
      err.textContent = 'This field is required';
      wrap.appendChild(err);
    }
  } else {
    field.classList.remove('is-error');
    const err = wrap.querySelector('.modal-field-error');
    if (err) err.remove();
  }

  return !isEmpty;
}

// Live validation on blur
orderForm.querySelectorAll('input[required], textarea[required]').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('is-error')) validateField(field);
  });
});

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const fields = orderForm.querySelectorAll('input[required], textarea[required]');
  let isValid = true;

  fields.forEach(field => {
    if (!validateField(field)) isValid = false;
  });

  // Checkbox
  const checkbox = orderForm.querySelector('input[type="checkbox"]');
  if (checkbox && !checkbox.checked) {
    isValid = false;
    const label = checkbox.closest('.modal-field');
    let err = label.querySelector('.modal-field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'modal-field-error';
      err.textContent = 'Please accept the terms';
      label.appendChild(err);
    }
  } else if (checkbox) {
    const label = checkbox.closest('.modal-field');
    const err = label.querySelector('.modal-field-error');
    if (err) err.remove();
  }

  if (!isValid) return;

  alert('Thank you! Your order has been received.');
  closeOrderModal();
  orderForm.reset();
  orderForm.querySelectorAll('.is-error').forEach(f => f.classList.remove('is-error'));
  orderForm.querySelectorAll('.modal-field-error').forEach(e => e.remove());
});

// ========================
// SUBSCRIBE FORM (footer)
// ========================
const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    e.target.reset();
  });
}

// ========================
// REVIEWS SLIDER
// ========================
const reviews = [
  { text: '"Flora made my anniversary unforgettable with their beautiful arrangement!"', author: 'Emma T.' },
  { text: 'Absolutely stunning bouquet! It looked even better than the photo and arrived right on time.', author: 'Daniel R.' },
  { text: 'The service was exceptional, and the flowers were fresh!', author: 'Olivia M.' },
  { text: 'I ordered a custom bouquet for my mum\'s birthday and she was absolutely thrilled. Will definitely order again!', author: 'Sophie K.' },
  { text: 'Fast delivery, beautiful packaging, and the flowers lasted over two weeks. Highly recommend!', author: 'James L.' },
  { text: 'The most gorgeous arrangement I\'ve ever seen. Flora truly has an eye for beauty.', author: 'Maria V.' },
];

let reviewIndex = 0;

function getReviewsPerPage() {
  if (window.innerWidth >= 1440) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

function renderReviews() {
  const list = document.querySelector('.reviews-list');
  const perPage = getReviewsPerPage();
  list.innerHTML = '';

  for (let i = 0; i < perPage; i++) {
    const idx = (reviewIndex + i) % reviews.length;
    const r = reviews[idx];
    list.insertAdjacentHTML('beforeend', `
      <li class="review-card">
        <p class="review-text">${r.text}</p>
        <h3 class="review-author">${r.author}</h3>
      </li>
    `);
  }
}

document.querySelector('.reviews-controls').addEventListener('click', (e) => {
  const btn = e.target.closest('.reviews-btn');
  if (!btn) return;

  const isPrev = btn.getAttribute('aria-label') === 'Previous review';
  const perPage = getReviewsPerPage();

  if (isPrev) {
    reviewIndex = (reviewIndex - perPage + reviews.length) % reviews.length;
  } else {
    reviewIndex = (reviewIndex + perPage) % reviews.length;
  }

  renderReviews();
});

window.addEventListener('resize', () => {
  reviewIndex = 0;
  renderReviews();
});

renderReviews();

// ========================
// MOBILE MENU
// ========================
const mobileMenu = document.querySelector('.mobile-menu');
const menuOpenBtn = document.querySelector('.menu-open-btn');
const menuCloseBtn = document.querySelector('.mobile-menu-close-btn');

function openMobileMenu() {
  mobileMenu.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('is-open');
  document.body.style.overflow = '';
}

menuOpenBtn.addEventListener('click', openMobileMenu);
menuCloseBtn.addEventListener('click', closeMobileMenu);

// Закрити при кліку на посилання
document.querySelectorAll('.mobile-menu-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});