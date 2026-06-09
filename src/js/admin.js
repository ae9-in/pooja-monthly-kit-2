// Admin Dashboard Module

import { getSubscriptions, updateSubscription, getInquiries, addNotification, syncDatabaseWithServer } from './state.js';

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderAdmin() {
  const container = document.getElementById('admin-view-container');
  if (!container) return;

  // 1. Session Authentication Check
  const isAuthenticated = sessionStorage.getItem('sacred_samskara_admin_logged_in') === 'true';

  if (!isAuthenticated) {
    container.innerHTML = `
      <div style="max-width: 400px; margin: 60px auto; padding: 36px; background: var(--cream); border: 2px solid var(--gold); border-radius: 4px; box-shadow: var(--shadow-lg); text-align: center;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🙏</span>
        <h3 style="font-family: 'Cinzel', serif; font-size: 24px; color: var(--maroon); margin-bottom: 8px; letter-spacing: 1px;">Admin Access</h3>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">Please log in to manage devotee subscription orders</p>
        
        <form id="admin-login-form">
          <div style="text-align: left; margin-bottom: 16px;">
            <label for="admin-username" style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; color: var(--gold-dim); letter-spacing: 1px;">Username</label>
            <input type="text" id="admin-username" class="form-control" style="width: 100%; padding: 10px; font-size:14px; border:1px solid var(--ivory-deeper); background:var(--cream); color:var(--text-dark);" placeholder="admin" required autocomplete="username">
          </div>
          
          <div style="text-align: left; margin-bottom: 24px;">
            <label for="admin-password" style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; color: var(--gold-dim); letter-spacing: 1px;">Security Password</label>
            <input type="password" id="admin-password" class="form-control" style="width: 100%; padding: 10px; font-size:14px; border:1px solid var(--ivory-deeper); background:var(--cream); color:var(--text-dark);" placeholder="••••••••" required autocomplete="current-password">
          </div>
          
          <div id="admin-login-error" style="color: #C62828; font-size: 13px; margin-bottom: 16px; font-weight: 600; display: none; text-align: left;"></div>
          
          <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; display:block;">ACCESS PORTAL</button>
        </form>
      </div>
    `;

    const form = document.getElementById('admin-login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value.trim();
        const errorEl = document.getElementById('admin-login-error');

        if (username === 'admin' && password === 'admin123') {
          sessionStorage.setItem('sacred_samskara_admin_logged_in', 'true');
          renderAdmin();
        } else {
          if (errorEl) {
            errorEl.textContent = 'Invalid username or password. Try admin / admin123.';
            errorEl.style.display = 'block';
          }
        }
      });
    }
    return;
  }

  // 2. Initialize Real-Time Polling Sync (12s interval to reduce server requests)
  if (!window.adminPollInterval) {
    window.adminPollInterval = setInterval(async () => {
      const modal = document.getElementById('admin-modal');
      const loggedIn = sessionStorage.getItem('sacred_samskara_admin_logged_in') === 'true';
      if (modal && modal.classList.contains('active') && loggedIn) {
        const prevHash = JSON.stringify(getSubscriptions().map(s => ({ id: s.id, status: s.status, shippingStatus: s.shippingStatus })));
        await syncDatabaseWithServer();
        const newHash = JSON.stringify(getSubscriptions().map(s => ({ id: s.id, status: s.status, shippingStatus: s.shippingStatus })));
        if (prevHash !== newHash) {
          console.log('Real-time update: Database changed on server. Redrawing admin...');
          renderAdmin();
        }
      }
    }, 12000);
  }

  const subs = getSubscriptions();
  const inquiries = getInquiries();

  // 3. Subscription Management Metrics
  const activeSubsCount = subs.filter(s => s.status === 'Active').length;
  const pausedSubsCount = subs.filter(s => s.status === 'Paused').length;
  const cancelledSubsCount = subs.filter(s => s.status === 'Cancelled').length;
  
  // 4. Revenue Calculations
  const activeSubs = subs.filter(s => s.status === 'Active');
  const monthlyRevenue = activeSubs.reduce((acc, curr) => {
    let val = curr.price;
    if (curr.billingCycle === '3-Month') val = Math.round(curr.price / 3);
    if (curr.billingCycle === '6-Month') val = Math.round(curr.price / 6);
    return acc + val;
  }, 0);
  
  // 5. Delivery Metrics
  const shippedCount = activeSubs.filter(s => s.shippingStatus === 'Shipped').length;
  const deliveredCount = subs.filter(s => s.shippingStatus === 'Delivered').length;
  const pendingDeliveries = activeSubs.filter(s => s.shippingStatus !== 'Delivered').length;

  container.innerHTML = `
    <div class="admin-header">
      <div>
        <h3 style="font-family:'Cormorant Garamond', serif; font-size: 28px; color:var(--maroon);">Sacred Samskara – <em>Admin Panel</em></h3>
        <span style="font-size: 13px; color: var(--text-muted);">E-Commerce Subscriptions Management Portal</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size: 12px; background:var(--gold-dim); color:white; padding:6px 12px; border-radius:2px; font-weight:bold;">Role: Temple Manager</span>
        <button id="admin-logout-btn" class="btn-outline" style="padding:6px 12px; font-size:11px; border-color:var(--maroon); color:var(--maroon); background:none; cursor:pointer;">Logout</button>
      </div>
    </div>

    <!-- 1. Subscription Management Counters -->
    <h4 style="font-family:'Cinzel', serif; font-size:12px; letter-spacing:1px; color:var(--gold-dim); margin-bottom:12px; text-transform:uppercase;">Subscription Management</h4>
    <div class="admin-stats-grid" style="margin-bottom: 24px;">
      <div class="admin-stat-card" style="border-top-color: #2E7D32;">
        <span class="admin-stat-label">Active Subscribers</span>
        <div class="admin-stat-val">${activeSubsCount}</div>
      </div>
      <div class="admin-stat-card" style="border-top-color: #E65100;">
        <span class="admin-stat-label">Upcoming Renewals</span>
        <div class="admin-stat-val">${activeSubs.filter(s => s.nextDeliveryDate !== 'N/A' && s.nextDeliveryDate !== 'Paused').length}</div>
      </div>
      <div class="admin-stat-card" style="border-top-color: #C62828;">
        <span class="admin-stat-label">Cancelled Subscribers</span>
        <div class="admin-stat-val">${cancelledSubsCount}</div>
      </div>
      <div class="admin-stat-card" style="border-top-color: var(--gold);">
        <span class="admin-stat-label">Paused Subscribers</span>
        <div class="admin-stat-val">${pausedSubsCount}</div>
      </div>
    </div>

    <!-- 2. Order Management Table -->
    <h4 style="font-family:'Cinzel', serif; font-size:12px; letter-spacing:1px; color:var(--gold-dim); margin-bottom:12px; text-transform:uppercase;">Order Management (Dispatch & Delivery Status)</h4>
    <div class="admin-table-container" style="margin-bottom: 28px;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sub ID</th>
            <th>Customer</th>
            <th>Pooja Kit Plan</th>
            <th>Price</th>
            <th>Order Status</th>
            <th>Dispatch & Delivery Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${renderOrdersRows(subs)}
        </tbody>
      </table>
    </div>

    <!-- 3. Customer Management Database -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h4 style="font-family:'Cinzel', serif; font-size:12px; letter-spacing:1px; color:var(--gold-dim); margin:0; text-transform:uppercase;">Customer Database & Purchase History</h4>
      <button id="admin-export-csv-btn" class="btn-primary" style="padding:6px 16px; font-size:11px; margin:0;">Export to CSV</button>
    </div>
    <div class="admin-table-container" style="margin-bottom: 28px;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Contact Details</th>
            <th>Shipping Address</th>
            <th>Total Paid</th>
            <th>Last Order Date</th>
          </tr>
        </thead>
        <tbody>
          ${renderCustomerRows(subs)}
        </tbody>
      </table>
    </div>

    <!-- 4. Reports & Revenue Section -->
    <h4 style="font-family:'Cinzel', serif; font-size:12px; letter-spacing:1px; color:var(--gold-dim); margin-bottom:12px; text-transform:uppercase;">Administrative Reports</h4>
    <div class="admin-stats-grid" style="grid-template-columns: 1fr 1fr; gap:24px; margin-bottom: 32px;">
      
      <!-- Revenue Report Card -->
      <div class="admin-stat-card">
        <span class="admin-stat-label">Monthly Revenue Report</span>
        <div class="admin-stat-val" style="font-size:36px; margin: 12px 0;">₹${monthlyRevenue.toLocaleString()} <span style="font-size:14px; font-weight:normal; color:var(--text-muted);">/ Month Est.</span></div>
        <div style="font-size:13px; color:var(--text-mid); line-height:1.6;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Standard Kit Revenue:</span>
            <strong>₹${activeSubs.filter(s => s.planType !== 'custom').reduce((acc, c) => acc + (c.billingCycle === 'Monthly' ? c.price : Math.round(c.price / (c.billingCycle === '3-Month' ? 3 : 6))), 0).toLocaleString()}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Bespoke Custom Revenue:</span>
            <strong>₹${activeSubs.filter(s => s.planType === 'custom').reduce((acc, c) => acc + c.price, 0).toLocaleString()}</strong>
          </div>
          <div style="border-top:1px dashed var(--ivory-deeper); margin-top:8px; padding-top:8px; display:flex; justify-content:space-between;">
            <span>Total Active Orders:</span>
            <strong>${activeSubs.length}</strong>
          </div>
        </div>
      </div>

      <!-- Delivery Report Card -->
      <div class="admin-stat-card">
        <span class="admin-stat-label">Delivery Progress Logs</span>
        <div style="margin: 16px 0;">
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span>Delivered Boxes:</span>
            <strong>${deliveredCount}</strong>
          </div>
          <div style="background:var(--ivory-deeper); height:6px; border-radius:3px; margin-bottom:12px;">
            <div style="background:#2E7D32; height:100%; width:${subs.length > 0 ? (deliveredCount / subs.length) * 100 : 0}%; border-radius:3px;"></div>
          </div>
          
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span>In Transit (Shipped):</span>
            <strong>${shippedCount}</strong>
          </div>
          <div style="background:var(--ivory-deeper); height:6px; border-radius:3px; margin-bottom:12px;">
            <div style="background:#0288D1; height:100%; width:${subs.length > 0 ? (shippedCount / subs.length) * 100 : 0}%; border-radius:3px;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span>Pending Assemble (Placed/Sourced):</span>
            <strong>${pendingDeliveries - shippedCount}</strong>
          </div>
          <div style="background:var(--ivory-deeper); height:6px; border-radius:3px;">
            <div style="background:var(--gold); height:100%; width:${subs.length > 0 ? ((pendingDeliveries - shippedCount) / subs.length) * 100 : 0}%; border-radius:3px;"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- Customer Inbox -->
    <h4 style="font-family:'Cinzel', serif; font-size:12px; letter-spacing:1px; color:var(--gold-dim); margin-bottom:12px; text-transform:uppercase;">Inquiries Inbox</h4>
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width:110px;">Date</th>
            <th style="width:130px;">Sender</th>
            <th style="width:170px;">Email</th>
            <th>Inquiry Message</th>
          </tr>
        </thead>
        <tbody>
          ${inquiries.map(inq =>
            '<tr>' +
              '<td style="font-size:13px; color:var(--text-muted);">' + escapeHtml(inq.date) + '</td>' +
              '<td><strong>' + escapeHtml(inq.name) + '</strong></td>' +
              '<td style="font-size:13px; color:var(--text-muted);">' + escapeHtml(inq.email) + '</td>' +
              '<td style="line-height:1.5;">' + escapeHtml(inq.message) + '</td>' +
            '</tr>'
          ).join('')}
        </tbody>
      </table>
    </div>
  `;

  bindAdminEvents(container);
}

function renderOrdersRows(subs) {
  if (subs.length === 0) {
    return `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No subscription orders found.</td></tr>`;
  }

  const shippingStages = ['Placed', 'Sourced', 'Packed', 'Shipped', 'Delivered'];

  return subs.map(sub => {
    const statusColor = sub.status === 'Active' ? '#2E7D32' : (sub.status === 'Paused' ? '#E65100' : '#C62828');
    
    // Create options for shipping select dropdown
    const optionsHtml = shippingStages.map(stage => {
      const isSelected = sub.shippingStatus === stage;
      return '<option value="' + escapeHtml(stage) + '"' + (isSelected ? ' selected' : '') + '>' + escapeHtml(stage) + '</option>';
    }).join('');

    const itemsDetail = sub.customItems && sub.customItems.length > 0 
      ? '<br><span style="font-size:10px; color:var(--text-muted); font-weight:normal;">Items: ' + escapeHtml(sub.customItems.join(', ')) + '</span>'
      : '';

    return '<tr>' +
      '<td style="font-family:monospace; font-weight:bold;">' + escapeHtml(sub.id) + '</td>' +
      '<td>' +
        '<strong>' + escapeHtml(sub.customerName) + '</strong><br>' +
        '<span style="font-size:11px; color:var(--text-muted);">' + escapeHtml(sub.customerPhone) + '</span>' +
      '</td>' +
      '<td style="font-weight:600; color:var(--maroon-deep);">' +
        escapeHtml(sub.planName) +
        itemsDetail +
      '</td>' +
      '<td>₹' + sub.price.toLocaleString() + ' (' + escapeHtml(sub.billingCycle) + ')</td>' +
      '<td>' +
        '<span style="color:' + statusColor + '; font-weight:bold; font-size:13px;">' + escapeHtml(sub.status) + '</span>' +
      '</td>' +
      '<td>' +
        (sub.status === 'Active' ? 
          '<select class="status-select-dropdown admin-shipping-select" data-id="' + escapeHtml(sub.id) + '">' +
            optionsHtml +
          '</select>'
         : '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">N/A</span>') +
      '</td>' +
      '<td>' +
        '<button class="btn-outline admin-cancel-btn" data-id="' + escapeHtml(sub.id) + '" style="padding:6px 12px; font-size:11px; border-color:#C62828; color:#C62828;">' +
          'Cancel' +
        '</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function renderCustomerRows(subs) {
  if (subs.length === 0) {
    return `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Customer Database is empty.</td></tr>`;
  }
  
  // Group by customer email
  const customers = {};
  subs.forEach(sub => {
    const email = sub.customerEmail.toLowerCase();
    if (!customers[email]) {
      customers[email] = {
        name: sub.customerName,
        email: sub.customerEmail,
        phone: sub.customerPhone,
        address: sub.customerAddress,
        pincode: sub.customerPincode,
        totalPaid: 0,
        lastOrder: sub.startDate
      };
    }
    customers[email].totalPaid += sub.price;
    if (new Date(sub.startDate) > new Date(customers[email].lastOrder)) {
      customers[email].lastOrder = sub.startDate;
    }
  });

  return Object.values(customers).map(c =>
    '<tr>' +
      '<td><strong>' + escapeHtml(c.name) + '</strong></td>' +
      '<td>' +
        '<span style="font-size:13px;">' + escapeHtml(c.email) + '</span><br>' +
        '<span style="font-size:12px; color:var(--text-muted);">' + escapeHtml(c.phone) + '</span>' +
      '</td>' +
      '<td style="font-size:13px; max-width: 250px; white-space: normal; line-height: 1.4;">' + escapeHtml(c.address) + ' - Pincode: ' + escapeHtml(c.pincode) + '</td>' +
      '<td style="font-weight:bold; color:#2E7D32;">₹' + c.totalPaid.toLocaleString() + '</td>' +
      '<td style="font-size:13px; color:var(--text-muted);">' + escapeHtml(c.lastOrder) + '</td>' +
    '</tr>'
  ).join('');
}

function bindAdminEvents(container) {
  // Bind Shipping Select changes
  container.querySelectorAll('.admin-shipping-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const subId = select.getAttribute('data-id');
      const val = e.target.value;
      updateSubscription(subId, { shippingStatus: val });

      // Simulate a notification triggered by the shipping update
      const sub = getSubscriptions().find(s => s.id === subId);
      if (sub) {
        let updateSubject = '';
        let updateBody = '';
        if (val === 'Shipped') {
          updateSubject = 'Pooja Kit Dispatched! 🚚';
          updateBody = `Pranam ${sub.customerName}. Your Monthly Pooja Kit (${sub.id}) has been dispatched via speed post. Track it on your devotee dashboard.`;
        } else if (val === 'Delivered') {
          updateSubject = 'Pooja Kit Delivered! 🪔';
          updateBody = `Hari Om ${sub.customerName}. Your Monthly Pooja Kit (${sub.id}) has been marked as Delivered. We hope your prayers are filled with blessings. Contact: 8431119696.`;
        } else {
          updateSubject = `Pooja Kit Tracker Update`;
          updateBody = `Pranam ${sub.customerName}. Your Monthly Pooja Kit (${sub.id}) status is now updated to: ${val}. Details on dashboard.`;
        }

        // Add SMS alert simulation
        addNotification({
          type: 'SMS',
          recipient: sub.customerPhone,
          subject: updateSubject,
          body: updateBody
        });
      }

      renderAdmin();
    });
  });

  // Bind cancel buttons
  container.querySelectorAll('.admin-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.getAttribute('data-id');
      if (confirm(`Cancel subscription ${subId}?`)) {
        updateSubscription(subId, { status: 'Cancelled', nextDeliveryDate: 'N/A' });
        
        // Notify
        const sub = getSubscriptions().find(s => s.id === subId);
        if (sub) {
          addNotification({
            type: 'Email',
            recipient: sub.customerEmail,
            subject: 'Subscription Cancelled',
            body: `Pranam ${sub.customerName}. Your subscription (${sub.id}) has been cancelled. No future renewals will trigger. If this was an error, reactivate anytime.`
          });
        }
        
        renderAdmin();
      }
    });
  });

  // Bind CSV Export button
  const exportBtn = document.getElementById('admin-export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const subs = getSubscriptions();
      if (subs.length === 0) {
        alert('No data available to export.');
        return;
      }

      // Group by customer email
      const customers = {};
      subs.forEach(sub => {
        const email = sub.customerEmail.toLowerCase();
        if (!customers[email]) {
          customers[email] = {
            name: sub.customerName,
            email: sub.customerEmail,
            phone: sub.customerPhone,
            address: sub.customerAddress,
            pincode: sub.customerPincode,
            totalPaid: 0,
            lastOrder: sub.startDate
          };
        }
        customers[email].totalPaid += sub.price;
        if (new Date(sub.startDate) > new Date(customers[email].lastOrder)) {
          customers[email].lastOrder = sub.startDate;
        }
      });

      // Construct CSV content
      const headers = ['Customer Name', 'Email', 'Phone', 'Shipping Address', 'Pincode', 'Total Paid (INR)', 'Last Order Date'];
      const rows = Object.values(customers).map(c => [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email.replace(/"/g, '""')}"`,
        `"${c.phone.replace(/"/g, '""')}"`,
        `"${c.address.replace(/"/g, '""')}"`,
        `"${c.pincode.replace(/"/g, '""')}"`,
        c.totalPaid,
        c.lastOrder
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      // Create download anchor link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'sacred_samskara_customers.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Bind Logout Button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('sacred_samskara_admin_logged_in');
      if (window.adminPollInterval) {
        clearInterval(window.adminPollInterval);
        window.adminPollInterval = null;
      }
      renderAdmin();
    });
  }
}
