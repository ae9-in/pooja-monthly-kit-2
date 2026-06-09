// Custom Pooja Kit Builder Module

import { navigateTo } from './router.js';
import { OFFICIAL_INVENTORY } from './state.js';

// Base packaging and shipping cost (included in pro-rated sum to equal exactly 450)
const BASE_FEE = 0; 

// Pro-rated prices for each official item to total exactly ₹450
const ITEM_PRICES = {
  agarbatti: 60,
  camphor: 80,
  deepaoil: 140,
  dhoopstick: 60,
  wicks: 30,
  kumkum: 30,
  shuddodaka: 50
};

// Default all items checked (Total = ₹450)
let selectedItems = new Set(['agarbatti', 'camphor', 'deepaoil', 'dhoopstick', 'wicks', 'kumkum', 'shuddodaka']);

export function initBuilder() {
  renderBuilderItems();
  updateBuilderPreview();

  // Bind order button
  const orderBtn = document.getElementById('subscribe-custom-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      // Store current custom kit selection in localStorage for checkout
      const customKitDetails = {
        items: Array.from(selectedItems).map(id => {
          const invItem = OFFICIAL_INVENTORY.find(item => item.id === id);
          return {
            ...invItem,
            price: ITEM_PRICES[id]
          };
        }),
        totalPrice: calculateTotal()
      };
      localStorage.setItem('sacred_samskara_temp_custom', JSON.stringify(customKitDetails));
      navigateTo('#checkout-custom');
    });
  }
}

function renderBuilderItems() {
  const container = document.getElementById('builder-items-grid');
  if (!container) return;

  container.innerHTML = OFFICIAL_INVENTORY.map(item => {
    const isSelected = selectedItems.has(item.id);
    const price = ITEM_PRICES[item.id];
    return `
      <div class="builder-item-card ${isSelected ? 'selected' : ''}" data-id="${item.id}">
        <span class="builder-emoji">${item.emoji}</span>
        <span class="builder-name" style="font-size:12px; margin-bottom: 2px;">${item.name}</span>
        <span style="font-size:11px; color:var(--text-muted); display:block; margin-bottom: 6px;">${item.desc}</span>
        <span class="builder-price">+₹${price}</span>
      </div>
    `;
  }).join('');

  // Add click listeners to cards
  container.querySelectorAll('.builder-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      if (selectedItems.has(id)) {
        selectedItems.delete(id);
        card.classList.remove('selected');
      } else {
        selectedItems.add(id);
        card.classList.add('selected');
      }
      updateBuilderPreview();
    });
  });
}

function calculateTotal() {
  let total = BASE_FEE;
  selectedItems.forEach(id => {
    total += ITEM_PRICES[id];
  });
  return total;
}

function updateBuilderPreview() {
  const listContainer = document.getElementById('builder-preview-list');
  const basePriceEl = document.getElementById('builder-base-price');
  const addonsPriceEl = document.getElementById('builder-addons-price');
  const totalPriceEl = document.getElementById('builder-total-price');

  if (!listContainer) return;

  // Selected items list
  const selectedList = Array.from(selectedItems).map(id => {
    const item = OFFICIAL_INVENTORY.find(item => item.id === id);
    return {
      ...item,
      price: ITEM_PRICES[id]
    };
  }).filter(Boolean);

  listContainer.innerHTML = selectedList.length === 0 
    ? `<li style="justify-content: center; color: rgba(255,255,255,0.4)">All items removed. Select at least one item.</li>`
    : selectedList.map(item => `
        <li>
          <span>${item.emoji} ${item.name}</span>
          <span>₹${item.price}</span>
        </li>
      `).join('');

  // Price calculations
  let addonsSum = 0;
  selectedList.forEach(item => addonsSum += item.price);

  basePriceEl.textContent = `₹${BASE_FEE}`;
  addonsPriceEl.textContent = `₹${addonsSum}`;
  totalPriceEl.textContent = `₹${BASE_FEE + addonsSum}`;
}
