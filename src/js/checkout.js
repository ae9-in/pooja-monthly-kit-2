// Checkout Wizard Module

import { addSubscription, loginUser, addNotification, getLoggedInEmail } from './state.js';
import { navigateTo, closeModal } from './router.js';

let currentPlan = 'monthly';
let currentStep = 1;
let checkoutPrice = 450;
let basePrice = 450;
let mrpPrice = 665;
let discountApplied = 0;
let appliedCouponCode = '';
let billingCycle = 'Monthly';
let planDisplayName = 'Monthly Pooja Kit';
let customItems = [];

const PLAN_INFO = {
  monthly: { name: 'Monthly Pooja Kit Subscription', price: 450, mrp: 665, cycle: 'Monthly' },
  '3month': { name: '3-Month Pooja Kit Subscription', price: 1299, mrp: 1995, cycle: '3-Month' },
  '6month': { name: '6-Month Pooja Kit Subscription', price: 2499, mrp: 3990, cycle: '6-Month' }
};

export function startCheckout(planId) {
  const loggedEmail = getLoggedInEmail();
  if (!loggedEmail) {
    alert("Pranam! Please log in to your Devotee Account to continue with the purchase.");
    closeModal('checkout-modal');
    navigateTo('#dashboard');
    return;
  }

  currentPlan = planId;
  currentStep = 1;
  customItems = [];
  discountApplied = 0;
  appliedCouponCode = '';

  if (planId === 'custom') {
    const tempCustom = localStorage.getItem('sacred_samskara_temp_custom');
    if (tempCustom) {
      const data = JSON.parse(tempCustom);
      basePrice = data.totalPrice;
      planDisplayName = 'Bespoke Custom Kit';
      customItems = data.items.map(item => item.name);
      mrpPrice = Math.round(data.totalPrice * 1.48); // Estimate MRP
    } else {
      basePrice = 450;
      planDisplayName = 'Bespoke Custom Kit';
      mrpPrice = 665;
    }
    billingCycle = 'Monthly';
  } else {
    const info = PLAN_INFO[planId] || PLAN_INFO['monthly'];
    basePrice = info.price;
    mrpPrice = info.mrp;
    planDisplayName = info.name;
    billingCycle = info.cycle;
  }

  checkoutPrice = basePrice;
  renderOrderSummary();
  showStep(1);
  resetFormFields();
}

function renderOrderSummary() {
  const summaryEl = document.getElementById('checkout-plan-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-weight:600;">
        <span>${planDisplayName} (${billingCycle})</span>
        <span>₹${basePrice.toLocaleString()}</span>
      </div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">MRP: <del>₹${mrpPrice.toLocaleString()}</del> (Save ₹${(mrpPrice - basePrice).toLocaleString()}!)</div>
      ${customItems.length > 0 ? `<div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">Items: ${customItems.join(', ')}</div>` : ''}
      
      <!-- Coupon Application Display -->
      ${discountApplied > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#2E7D32; font-weight:600; font-size:14px;">
          <span>Coupon "${appliedCouponCode.toUpperCase()}" Applied</span>
          <span>-₹${discountApplied.toLocaleString()}</span>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(201, 150, 42, 0.2); padding-top:8px; margin-top:8px; font-size:14px; font-weight:bold; color:var(--maroon-deep);">
        <span>Total Offer Price</span>
        <span>₹${checkoutPrice.toLocaleString()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:13px; color:var(--text-muted);">
        <span>Shipping</span>
        <span style="color:#2E7D32; font-weight:600;">FREE (Sacred Delivery)</span>
      </div>
    `;
  }
}

function showStep(step) {
  currentStep = step;
  
  // Update UI Step Indicators
  document.querySelectorAll('.checkout-step').forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index + 1 === step) {
      el.classList.add('active');
    } else if (index + 1 < step) {
      el.classList.add('completed');
    }
  });

  // Toggle Panels
  document.querySelectorAll('.checkout-panel').forEach((el, index) => {
    el.classList.remove('active');
    if (index + 1 === step) {
      el.classList.add('active');
    }
  });

  // Footer Buttons
  const prevBtn = document.getElementById('checkout-prev-btn');
  const nextBtn = document.getElementById('checkout-next-btn');

  if (step === 1) {
    prevBtn.style.visibility = 'hidden';
    nextBtn.textContent = 'Continue to Address';
  } else if (step === 2) {
    prevBtn.style.visibility = 'visible';
    nextBtn.textContent = 'Proceed to Payment';
  } else if (step === 3) {
    prevBtn.style.visibility = 'visible';
    nextBtn.textContent = 'Pay & Subscribe';
  } else if (step === 4) {
    document.querySelector('.checkout-footer').style.display = 'none';
  }
}

function resetFormFields() {
  document.querySelector('.checkout-footer').style.display = 'flex';
  document.getElementById('pay-loader-screen').style.display = 'none';
  document.getElementById('pay-success-screen').style.display = 'none';
  document.getElementById('checkout-form-container').style.display = 'block';

  // Reset email element to default
  const emailEl = document.getElementById('checkout-email');
  if (emailEl) {
    emailEl.disabled = false;
    emailEl.style.backgroundColor = '';
    emailEl.value = '';
  }

  // Pre-fill user data if logged in
  const savedEmail = getLoggedInEmail();
  if (savedEmail && emailEl) {
    emailEl.value = savedEmail;
    emailEl.disabled = true;
    emailEl.style.backgroundColor = 'var(--ivory-deeper)';
  }
}

export function initCheckout() {
  const prevBtn = document.getElementById('checkout-prev-btn');
  const nextBtn = document.getElementById('checkout-next-btn');
  const couponApplyBtn = document.getElementById('apply-coupon-btn');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < 3) {
          showStep(currentStep + 1);
        } else {
          processPayment();
        }
      }
    });
  }

  // Coupon apply click listener
  if (couponApplyBtn) {
    couponApplyBtn.addEventListener('click', () => {
      const code = document.getElementById('checkout-coupon-input').value.trim().toUpperCase();
      const feedback = document.getElementById('coupon-feedback-msg');
      
      if (!code) {
        alert('Please enter a coupon code.');
        return;
      }

      if (code === 'FESTIVAL50') {
        discountApplied = 50;
        appliedCouponCode = 'FESTIVAL50';
        checkoutPrice = Math.max(0, basePrice - discountApplied);
        if (feedback) {
          feedback.textContent = 'Coupon applied: ₹50 discount applied successfully!';
          feedback.style.color = '#2E7D32';
        }
        renderOrderSummary();
      } else {
        discountApplied = 0;
        appliedCouponCode = '';
        checkoutPrice = basePrice;
        if (feedback) {
          feedback.textContent = 'Invalid Coupon Code. Try "FESTIVAL50".';
          feedback.style.color = '#C62828';
        }
        renderOrderSummary();
      }
    });
  }

  // Payment selections
  const cards = document.querySelectorAll('.payment-method-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById('checkout-name').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();

    if (!name) return alertError('Please enter your full name');
    if (!email || !email.includes('@')) return alertError('Please enter a valid email address');
    if (phone.length < 10 || isNaN(phone)) return alertError('Please enter a valid mobile number');
    return true;
  }

  if (step === 2) {
    const address = document.getElementById('checkout-address').value.trim();
    const city = document.getElementById('checkout-city').value.trim();
    const state = document.getElementById('checkout-state').value.trim();
    const pincode = document.getElementById('checkout-pincode').value.trim();

    if (!address) return alertError('Please enter your shipping address');
    if (!city) return alertError('Please enter your city');
    if (!state) return alertError('Please enter your state');
    if (pincode.length !== 6 || isNaN(pincode)) return alertError('Please enter a valid 6-digit Pincode');
    return true;
  }

  return true;
}

function alertError(msg) {
  alert(msg);
  return false;
}

function processPayment() {
  document.getElementById('checkout-form-container').style.display = 'none';
  document.querySelector('.checkout-footer').style.display = 'none';
  
  const loaderScreen = document.getElementById('pay-loader-screen');
  const loaderMsg = document.getElementById('pay-loader-message');
  loaderScreen.style.display = 'block';

  const messages = [
    'Initializing payment simulation...',
    'Securing gateway channel...',
    'Processing wallet authorization...',
    'Finalizing sacred transaction...'
  ];

  let msgIdx = 0;
  const interval = setInterval(() => {
    if (msgIdx < messages.length) {
      loaderMsg.textContent = messages[msgIdx++];
    }
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    completeSubscription();
  }, 2200);
}

function completeSubscription() {
  const name = document.getElementById('checkout-name').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const city = document.getElementById('checkout-city').value.trim();
  const state = document.getElementById('checkout-state').value.trim();
  const pincode = document.getElementById('checkout-pincode').value.trim();
  const selectedPaymentEl = document.querySelector('.payment-method-card.selected');
  const selectedPayment = selectedPaymentEl ? selectedPaymentEl.getAttribute('data-type') : 'UPI';

  const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  // Calculate next renewal date
  const nextMonth = new Date();
  if (billingCycle === '3-Month') {
    nextMonth.setMonth(today.getMonth() + 3);
  } else if (billingCycle === '6-Month') {
    nextMonth.setMonth(today.getMonth() + 6);
  } else {
    nextMonth.setMonth(today.getMonth() + 1);
  }
  const formattedNextMonth = nextMonth.toISOString().split('T')[0];

  const newSub = {
    id: subId,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    customerAddress: `${address}, ${city}, ${state}`,
    customerPincode: pincode,
    planType: currentPlan,
    planName: planDisplayName,
    price: checkoutPrice,
    billingCycle: billingCycle,
    startDate: formattedToday,
    nextDeliveryDate: formattedNextMonth,
    status: 'Active',
    shippingStatus: 'Placed',
    paymentMethod: selectedPayment,
    customItems: customItems
  };

  // Add sub & login
  addSubscription(newSub);
  loginUser(email);

  // Send Simulated notifications (SMS & Email)
  addNotification({
    type: 'SMS',
    recipient: phone,
    subject: 'Order Confirmation',
    body: `Pranam! Your order for Monthly Pooja Kit (${subId}) has been received. Thank you for choosing Sacred Samskara. Helpdesk: 8431119696.`
  });

  addNotification({
    type: 'Email',
    recipient: email,
    subject: `Pooja Kit Subscription Confirmed! 🪔`,
    body: `Hari Om, ${name}. Your Sacred subscription (${subId}) is now active. We will ship your first kit containing Agarbakthi, Camphor, Deepam Oil, Dhoop, and holy water soon. Thank you for inviting devotion home. Contact: 8431119696.`
  });

  // Switch to success screen
  document.getElementById('pay-loader-screen').style.display = 'none';
  const successScreen = document.getElementById('pay-success-screen');
  successScreen.style.display = 'block';
  
  document.getElementById('success-sub-id').textContent = subId;
  document.getElementById('success-sub-plan').textContent = `${planDisplayName} (${billingCycle})`;
  document.getElementById('success-sub-price').textContent = `₹${checkoutPrice.toLocaleString()}`;

  // Hook success confirmation buttons
  const viewDashBtn = document.getElementById('success-view-dash-btn');
  if (viewDashBtn) {
    const newBtn = viewDashBtn.cloneNode(true);
    viewDashBtn.parentNode.replaceChild(newBtn, viewDashBtn);
    newBtn.addEventListener('click', () => {
      closeModal('checkout-modal');
      navigateTo('#dashboard');
    });
  }

  const closeCheckoutBtn = document.getElementById('success-close-btn');
  if (closeCheckoutBtn) {
    const newCloseBtn = closeCheckoutBtn.cloneNode(true);
    closeCheckoutBtn.parentNode.replaceChild(newCloseBtn, closeCheckoutBtn);
    newCloseBtn.addEventListener('click', () => {
      closeModal('checkout-modal');
    });
  }
}
