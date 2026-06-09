// Main Application Entry Point

import { initRouter, closeModal } from './router.js';
import { initBuilder } from './builder.js';
import { initCheckout } from './checkout.js';
import { initChatbot } from './chat.js';
import { addInquiry, syncDatabaseWithServer } from './state.js';
import { initTestimonials } from './testimonials.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Synchronize all database tables with the backend MongoDB Atlas
  await syncDatabaseWithServer();

  // 2. Boot Subsystems
  initRouter();
  initBuilder();
  initCheckout();
  initChatbot();
   initTestimonials();
 
   // 3. Fade out and hide the Site Preloader
   const preloader = document.getElementById('site-preloader');
   if (preloader) {
     setTimeout(() => {
       preloader.style.opacity = '0';
       preloader.style.visibility = 'hidden';
     }, 400); // 400ms buffer for premium feel
   }
 
   // 4. Mobile Menu Toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // 3. Theme Toggle Initialization
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('sacred_samskara_theme');

  // Apply saved theme
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('sacred_samskara_theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
    });
  }

  function updateThemeIcon(isDark) {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = isDark ? '☀️' : '🌙';
      themeToggleBtn.title = isDark ? 'Switch to Sattvik Day' : 'Switch to Divine Night';
    }
  }

  // 4. Modal Backdrop Close Handlers
  document.querySelectorAll('.overlay-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      // Close only if click is directly on overlay backdrop, not content card
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal(modal.id);
      });
    }
  });



  // 6. Smooth Scroll Effect for Nav shadows (Optimized to prevent style recalculation thrashing)
  const nav = document.querySelector('nav');
  let hasShadow = false;
  window.addEventListener('scroll', () => {
    if (nav) {
      const shouldHaveShadow = window.scrollY > 50;
      if (shouldHaveShadow !== hasShadow) {
        hasShadow = shouldHaveShadow;
        nav.style.boxShadow = hasShadow ? 'var(--shadow-md)' : 'none';
      }
    }
  }, { passive: true });
});

// Expose FAQ Toggle function globally since it is inline in HTML markup
window.toggleFaq = function(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
};
