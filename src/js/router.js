// Client-Side Hash Router

import { renderDashboard } from './dashboard.js';
import { renderAdmin } from './admin.js';
import { startCheckout } from './checkout.js';

export function initRouter() {
  // Support direct pathname routing for /admin -> #admin
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
    window.location.hash = '#admin';
  }

  window.addEventListener('hashchange', handleRoute);
  // Initial load routing
  handleRoute();
}

export function navigateTo(hash) {
  window.location.hash = hash;
}

export function handleRoute() {
  const hash = window.location.hash;

  // First, hide all main overlay modals
  closeAllModals();

  if (hash === '#dashboard') {
    openModal('dashboard-modal');
    renderDashboard();
  } else if (hash === '#admin') {
    openModal('admin-modal');
    renderAdmin();
  } else if (hash.startsWith('#checkout')) {
    openModal('checkout-modal');
    // Extract plan type if specified, e.g. #checkout-premium
    const plan = hash.split('-')[1] || 'premium';
    startCheckout(plan);
  }
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    // Force a reflow for transition
    modal.offsetHeight; 
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable page background scrolling
  }
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      // If no other modals are active, re-enable body scrolling
      if (!document.querySelector('.overlay-modal.active')) {
        document.body.style.overflow = '';
      }
    }, 300); // Wait for transition
  }
  
  // Clear hash if we are closing a modal that was opened via hash
  const currentHash = window.location.hash;
  if (
    (id === 'dashboard-modal' && currentHash === '#dashboard') ||
    (id === 'admin-modal' && currentHash === '#admin') ||
    (id === 'checkout-modal' && currentHash.startsWith('#checkout'))
  ) {
    // Remove hash without scrolling
    history.replaceState(null, null, ' ');
  }
}

export function closeAllModals() {
  const modals = document.querySelectorAll('.overlay-modal');
  modals.forEach(modal => {
    modal.classList.remove('active');
    modal.style.display = 'none';
  });
  document.body.style.overflow = '';
}
