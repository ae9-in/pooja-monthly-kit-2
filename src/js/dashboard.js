// Customer Dashboard Module

import { 
  getLoggedInEmail, 
  loginUser, 
  logoutUser, 
  getSubscriptionsByEmail, 
  updateSubscription,
  getNotifications,
  addNotification
} from './state.js';
import { closeModal, navigateTo } from './router.js';

export function renderDashboard() {
  const container = document.getElementById('dashboard-view-container');
  if (!container) return;

  const email = getLoggedInEmail();

  if (!email) {
    renderLoginView(container);
  } else {
    renderPortalView(container, email);
  }
}

function renderLoginView(container) {
  container.innerHTML = `
    <div style="max-width: 400px; margin: 40px auto; padding: 32px; background: var(--cream); border: 1px solid var(--gold); border-radius: 4px; text-align: center;">
      <span style="font-size: 40px; display: block; margin-bottom: 16px;">🙏</span>
      <h4 style="font-family: 'Cinzel', serif; color: var(--maroon); margin-bottom: 12px; font-size: 20px; letter-spacing: 1px;">Devotee Portal</h4>
      <p style="font-size: 15px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5;">
        Log in with the email address used during order placement to track shipping details and manage renewals.
      </p>
      <div class="form-group" style="text-align: left;">
        <label for="dash-login-email">Email Address</label>
        <input type="email" id="dash-login-email" class="form-control" placeholder="priya.sharma@example.com">
        <span style="font-size:12px; color:var(--text-muted); display:block; margin-top:8px;">
          Try seed devotee: <strong>priya.sharma@example.com</strong>
        </span>
      </div>
      <button id="dash-login-submit" class="btn-primary" style="width: 100%; margin-top: 12px; padding: 12px;">Login</button>
    </div>
  `;

  document.getElementById('dash-login-submit').addEventListener('click', () => {
    const loginEmail = document.getElementById('dash-login-email').value.trim();
    if (!loginEmail || !loginEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    loginUser(loginEmail);
    renderDashboard();
  });
}

function renderPortalView(container, email) {
  const userSubs = getSubscriptionsByEmail(email);
  const devoteeName = userSubs.length > 0 ? userSubs[0].customerName : 'Devotee';
  const devoteePhone = userSubs.length > 0 ? userSubs[0].customerPhone : '';

  // Get notifications matching email or phone
  const allNotifications = getNotifications();
  const matchedNotes = allNotifications.filter(note => 
    note.recipient.toLowerCase() === email.toLowerCase() || 
    (devoteePhone && note.recipient === devoteePhone)
  );

  let subsHtml = '';
  if (userSubs.length === 0) {
    subsHtml = `
      <div style="text-align:center; padding:48px; background:var(--ivory); border:1px solid var(--ivory-deeper); border-radius:4px; margin-bottom:24px;">
        <span style="font-size:36px; display:block; margin-bottom:12px;">📦</span>
        <h5 style="font-family:'Cinzel', serif; font-size:16px; color:var(--maroon); margin-bottom:8px;">No Subscriptions Found</h5>
        <p style="font-size:15px; color:var(--text-muted); margin-bottom:20px;">We couldn't find any subscription orders linked to <strong>${email}</strong>.</p>
        <p style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">Please place an order or select a plan from our home page first.</p>
        <button id="dash-order-now-btn" class="btn-primary" style="padding: 10px 24px; font-size: 12px; margin-top: 8px;">Order Pooja Kit Now</button>
      </div>
    `;
  } else {
    subsHtml = userSubs.map(sub => renderSubscriptionCard(sub)).join('');
  }

  container.innerHTML = `
    <div class="dashboard-header">
      <div>
        <h3 style="font-family:'Cormorant Garamond', serif; font-size: 28px; font-weight:400; color:var(--maroon);">Hari Om, <em>${devoteeName}</em></h3>
        <span style="font-size: 13px; color: var(--text-muted);">Devotee Session: ${email}</span>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <button id="dash-new-order-btn" class="btn-primary" style="padding: 8px 16px; font-size: 11px;">Order Kit</button>
        <button id="dash-logout-btn" class="btn-outline" style="padding: 8px 16px; font-size: 11px;">Logout</button>
      </div>
    </div>
    
    <div class="dashboard-grid">
      <!-- Active Subscriptions -->
      <div style="display:flex; flex-direction:column; gap:24px;">
        ${subsHtml}
      </div>

      <!-- Notifications Log Overlay Panel -->
      <div class="dashboard-card" style="border-top:3px solid var(--gold); background: var(--ivory);">
        <h4 style="font-family:'Cinzel', serif; font-size: 14px; color: var(--maroon); display: flex; justify-content: space-between; align-items: center;">
          <span>SMS & Email Alert Logs (Simulated)</span>
          <span style="font-size: 11px; background: var(--maroon); color: var(--gold-pale); padding: 2px 8px; border-radius: 10px;">${matchedNotes.length} Received</span>
        </h4>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px; line-height:1.4;">
          Here you can inspect automated notifications generated on subscription updates, shipping status edits, and payments.
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 8px;" id="dashboard-notes-list">
          ${renderNotificationList(matchedNotes)}
        </div>
      </div>
    </div>
  `;

  // Bind Logout Button
  document.getElementById('dash-logout-btn').addEventListener('click', () => {
    logoutUser();
    renderDashboard();
  });

  // Bind Order buttons to navigate to plans section
  const orderNowBtn = document.getElementById('dash-order-now-btn');
  if (orderNowBtn) {
    orderNowBtn.addEventListener('click', () => {
      closeModal('dashboard-modal');
      navigateTo('#plans');
    });
  }

  const newOrderBtn = document.getElementById('dash-new-order-btn');
  if (newOrderBtn) {
    newOrderBtn.addEventListener('click', () => {
      closeModal('dashboard-modal');
      navigateTo('#plans');
    });
  }

  // Bind Subscription Actions (Pause, Cancel, Resume, Print)
  userSubs.forEach(sub => {
    const pauseBtn = document.getElementById(`btn-pause-${sub.id}`);
    const resumeBtn = document.getElementById(`btn-resume-${sub.id}`);
    const cancelBtn = document.getElementById(`btn-cancel-${sub.id}`);
    const printBtn = document.getElementById(`btn-print-${sub.id}`);

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        updateSubscription(sub.id, { status: 'Paused', nextDeliveryDate: 'Paused' });
        
        // Add SMS alert simulation
        addNotification({
          type: 'SMS',
          recipient: sub.customerPhone,
          subject: 'Subscription Paused',
          body: `Pranam! Your Monthly Pooja Kit subscription (${sub.id}) has been paused. You will not be billed next month. Contact: 8431119696.`
        });

        renderDashboard();
      });
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const formattedNextMonth = nextMonth.toISOString().split('T')[0];
        updateSubscription(sub.id, { status: 'Active', nextDeliveryDate: formattedNextMonth });

        // Add SMS alert simulation
        addNotification({
          type: 'SMS',
          recipient: sub.customerPhone,
          subject: 'Subscription Resumed',
          body: `Pranam! Your Monthly Pooja Kit subscription (${sub.id}) is active again. Next delivery scheduled for ${formattedNextMonth}. Contact: 8431119696.`
        });

        renderDashboard();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel your Monthly Pooja Kit subscription?')) {
          updateSubscription(sub.id, { status: 'Cancelled', nextDeliveryDate: 'N/A' });
          
          addNotification({
            type: 'Email',
            recipient: sub.customerEmail,
            subject: 'Subscription Cancelled',
            body: `Hari Om ${sub.customerName}. Your Monthly Pooja Kit subscription (${sub.id}) has been cancelled. No further charges will apply. We hope to serve you again in the future. Helpdesk: 8431119696.`
          });

          renderDashboard();
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        printReceipt(sub);
      });
    }
  });
}

function renderNotificationList(notes) {
  if (notes.length === 0) {
    return `<div style="text-align:center; padding:24px; color:var(--text-muted); font-size:14px; border:1px dashed var(--ivory-deeper);">No notification logs found. Try placing an order!</div>`;
  }
  return notes.map(note => `
    <div style="background:var(--cream); border:1px solid var(--ivory-deeper); padding:12px; border-left:3px solid ${note.type === 'SMS' ? '#0288D1' : '#E65100'}; border-radius:2px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px; font-weight:600; text-transform:uppercase; color:var(--text-muted);">
        <span>${note.type} Alert to ${note.recipient}</span>
        <span>${note.date}</span>
      </div>
      <div style="font-weight:bold; font-size:13px; color:var(--text-dark); margin-bottom:4px;">${note.subject}</div>
      <div style="font-size:13px; color:var(--text-mid); line-height:1.4;">${note.body}</div>
    </div>
  `).join('');
}

function renderSubscriptionCard(sub) {
  const statusClass = sub.status === 'Active' ? 'status-active' : (sub.status === 'Paused' ? 'status-paused' : 'status-cancelled');
  
  // Calculate timeline values
  const shippingStages = ['Placed', 'Sourced', 'Packed', 'Shipped', 'Delivered'];
  const currentStageIdx = shippingStages.indexOf(sub.shippingStatus);
  const progressPercent = Math.max(0, (currentStageIdx / (shippingStages.length - 1)) * 100);

  const stageLabels = {
    Placed: 'Order Placed',
    Sourced: 'Ingredients Sourced',
    Packed: 'Packed with Care',
    Shipped: 'In Transit',
    Delivered: 'Delivered'
  };

  const stageIcons = {
    Placed: '📋',
    Sourced: '🌿',
    Packed: '📦',
    Shipped: '🚚',
    Delivered: '🙏'
  };

  const timelineHtml = shippingStages.map((stage, idx) => {
    const isCompleted = idx <= currentStageIdx;
    const isActive = idx === currentStageIdx;
    let nodeClass = '';
    if (isCompleted) nodeClass += ' completed';
    if (isActive) nodeClass += ' active';

    return `
      <div class="timeline-node${nodeClass}">
        <div class="timeline-dot">
          <span>${stageIcons[stage]}</span>
        </div>
        <span class="timeline-label">${stageLabels[stage]}</span>
      </div>
    `;
  }).join('');

  // Timeline Description Message
  let deliveryMessage = '';
  if (sub.status === 'Paused') {
    deliveryMessage = 'Your monthly deliveries are currently on hold. Resume when you are ready to continue your prayers.';
  } else if (sub.status === 'Cancelled') {
    deliveryMessage = 'Subscription cancelled. We hope to welcome you back soon to keep ancient traditions alive.';
  } else {
    switch (sub.shippingStatus) {
      case 'Placed':
        deliveryMessage = 'Your order is placed. Our priests and vendors are assembling the authentic, temple-grade items.';
        break;
      case 'Sourced':
        deliveryMessage = 'All ingredients (incense, camphor, oils, and wicks) have been gathered with care and reverence.';
        break;
      case 'Packed':
        deliveryMessage = 'Your sacred box is packed securely using eco-friendly materials and is ready for dispatch.';
        break;
      case 'Shipped':
        deliveryMessage = 'In transit! Sourced speed post is carrying your monthly box. Expect delivery within 2-3 business days.';
        break;
      case 'Delivered':
        deliveryMessage = 'Delivered! Hope your rituals are filled with tranquility, peace, and spiritual joy. Prasad is inside!';
        break;
    }
  }

  // Render Action Buttons
  let actionButtonsHtml = '';
  if (sub.status === 'Active') {
    actionButtonsHtml = `
      <button id="btn-pause-${sub.id}" class="btn-outline" style="border-color:#E65100; color:#E65100; padding:8px 16px; font-size:12px;">Pause Plan</button>
      <button id="btn-cancel-${sub.id}" class="btn-outline" style="border-color:#C62828; color:#C62828; padding:8px 16px; font-size:12px;">Cancel Subscription</button>
    `;
  } else if (sub.status === 'Paused') {
    actionButtonsHtml = `
      <button id="btn-resume-${sub.id}" class="btn-primary" style="padding:8px 20px; font-size:12px;">Resume Subscription</button>
    `;
  } else if (sub.status === 'Cancelled') {
    actionButtonsHtml = `
      <button id="btn-resume-${sub.id}" class="btn-primary" style="padding:8px 20px; font-size:12px;">Reactivate Subscription</button>
    `;
  }

  return `
    <div class="dashboard-card" style="margin-bottom: 8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span style="font-family:'Cinzel', serif; font-size:12px; color:var(--text-muted); letter-spacing:1px;">ID: ${sub.id}</span>
        <span class="subscription-status-badge ${statusClass}">${sub.status}</span>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:24px;">
        <div>
          <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:block;">Pooja Package</span>
          <strong style="font-size:18px; font-family:'Cormorant Garamond', serif; color:var(--maroon); font-weight:600;">${sub.planName}</strong>
          ${sub.customItems && sub.customItems.length > 0 ? `<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Items: ${sub.customItems.join(', ')}</div>` : ''}
        </div>
        <div>
          <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:block;">Billing Cycle</span>
          <strong style="font-size:16px; color:var(--text-dark);">${sub.price} INR / ${sub.billingCycle}</strong>
        </div>
        <div>
          <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:block;">Subscription Date</span>
          <span style="font-size:15px; color:var(--text-dark);">${sub.startDate}</span>
        </div>
        <div>
          <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:block;">Next Delivery Date</span>
          <span style="font-size:15px; color:var(--text-dark);">${sub.nextDeliveryDate}</span>
        </div>
      </div>

      <!-- Shipping Stepper -->
      ${sub.status === 'Active' ? `
        <div style="margin-top: 24px; border-top: 1px solid var(--ivory-deeper); padding-top: 24px;">
          <h5 style="font-family:'Cinzel', serif; font-size:11px; color:var(--gold-dim); letter-spacing:1px; margin-bottom:12px; text-transform:uppercase;">Delivery Status Tracker</h5>
          <div class="delivery-tracking-timeline">
            <div class="timeline-progress-bar" style="width: ${progressPercent}%;"></div>
            ${timelineHtml}
          </div>
        </div>
      ` : ''}

      <div style="background:var(--ivory); border-left:3px solid var(--gold); padding:12px 16px; margin: 24px 0 20px; font-size:14px; color:var(--text-mid); line-height:1.5; font-style:italic;">
        ${deliveryMessage}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--ivory-deeper); padding-top:20px; margin-top:16px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:12px;">
          ${actionButtonsHtml}
        </div>
        <button id="btn-print-${sub.id}" class="btn-outline" style="padding:8px 16px; font-size:12px; border-color:var(--gold);">Print Invoice</button>
      </div>
    </div>
  `;
}

function printReceipt(sub) {
  // Create dynamic printable invoice page
  const printWindow = window.open('', '_blank');
  const itemsList = sub.customItems && sub.customItems.length > 0
    ? `<li>Custom Pooja Box Items: ${sub.customItems.join(', ')}</li>`
    : `<li>Full Standard Pack (${sub.planName})</li>`;

  printWindow.document.write(`
    <html>
    <head>
      <title>Invoice - ${sub.id}</title>
      <style>
        body { font-family: 'Georgia', serif; padding: 40px; color: #2C1A0E; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #C9962A; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #4A1010; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #E8D8BC; }
        .invoice-table th { background-color: #FAF3E8; font-weight: bold; }
        .footer { text-align: center; margin-top: 60px; font-size: 13px; color: #8B6040; border-top: 1px dashed #C9962A; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Sacred Samskara</div>
        <div style="font-size:11px; text-transform:uppercase; letter-spacing: 2px;">Pure & Authentic Monthly Pooja Kits</div>
        <h2 style="margin-top:20px; font-weight:normal; font-style:italic;">Order Invoice Receipt</h2>
      </div>

      <div class="details">
        <div>
          <strong>Billed To:</strong><br>
          ${sub.customerName}<br>
          ${sub.customerEmail}<br>
          ${sub.customerPhone}
        </div>
        <div style="text-align: right;">
          <strong>Invoice Details:</strong><br>
          Invoice Number: INV-${sub.id.split('-')[1]}<br>
          Subscription ID: ${sub.id}<br>
          Date: ${sub.startDate}<br>
          Status: Paid (Gateway)
        </div>
      </div>

      <div style="margin-bottom:30px;">
        <strong>Shipping Address:</strong><br>
        ${sub.customerAddress}<br>
        Pincode: ${sub.customerPincode}
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Billing Type</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${sub.planName}</strong>
              <ul style="margin-top:6px; padding-left:20px; font-size:13px; color:#5C3A1E;">
                ${itemsList}
              </ul>
            </td>
            <td>${sub.billingCycle} Subscription</td>
            <td style="text-align:right; font-weight:bold;">₹${sub.price.toLocaleString()}.00</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right; border:none; padding-top:20px;"><strong>Subtotal:</strong></td>
            <td style="text-align:right; border:none; padding-top:20px;">₹${sub.price.toLocaleString()}.00</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right; border:none;"><strong>Shipping:</strong></td>
            <td style="text-align:right; border:none; color:green;">FREE</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right; font-size:18px; border-top:2px solid #C9962A; padding-top:10px;"><strong>Grand Total:</strong></td>
            <td style="text-align:right; font-size:18px; font-weight:bold; border-top:2px solid #C9962A; padding-top:10px; color:#4A1010;">₹${sub.price.toLocaleString()}.00</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Thank you for subscribing to Sacred Samskara. Your support keeps our heritage alive.</p>
        <p>© 2026 Sacred Samskara. Helpdesk: 8431119696</p>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
