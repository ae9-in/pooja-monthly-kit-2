// Global Application State Management

const STATE_KEYS = {
  SUBS: 'sacred_samskara_subs',
  INQUIRIES: 'sacred_samskara_inquiries',
  SESSION: 'sacred_samskara_user_email',
  NOTIFICATIONS: 'sacred_samskara_notifications',
  REFERRALS: 'sacred_samskara_referrals'
};

// Official Product Inventory List
export const OFFICIAL_INVENTORY = [
  { id: 'agarbatti', name: 'Agarbakthi', desc: '100g premium aromatic incense', emoji: '🌿', benefit: 'Aromatherapy & peaceful vibes' },
  { id: 'camphor', name: 'Camphor', desc: '100g pure Bhimseni camphor', emoji: '🕯️', benefit: 'Cleanses surrounding atmosphere' },
  { id: 'deepaoil', name: 'Deepam Oil', desc: '800mL premium oil blend', emoji: '🪔', benefit: 'Long burning & soothing flame' },
  { id: 'dhoopstick', name: 'Dhoop Stick', desc: '100g herbal incense logs', emoji: '🪵', benefit: 'Ancient temple fragrance' },
  { id: 'wicks', name: 'Cotton Wicks', desc: '40 Nos hand-rolled wicks', emoji: '🕯', benefit: 'Clean, soot-free ignition' },
  { id: 'kumkum', name: 'Harshina Kumkuma Packet', desc: '1 Packet divine kumkum', emoji: '🔴', benefit: 'Natural, skin-friendly vermilion' },
  { id: 'shuddodaka', name: 'Shuddodaka', desc: '1 Bottle holy water', emoji: '🏺', benefit: 'Purification before daily prayers' }
];

// Initial Seed Data
const defaultSubscriptions = [
  {
    id: 'SUB-948120',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    customerPhone: '8431119696',
    customerAddress: 'Apt 405, Gold Towers, Outer Ring Road, Bangalore, Karnataka',
    customerPincode: '560103',
    planType: 'monthly',
    planName: 'Monthly Pooja Kit Subscription',
    price: 450,
    billingCycle: 'Monthly',
    startDate: '2026-05-10',
    nextDeliveryDate: '2026-06-10',
    status: 'Active',
    shippingStatus: 'Shipped', // Placed, Sourced, Packed, Shipped, Delivered
    paymentMethod: 'UPI',
    customItems: []
  },
  {
    id: 'SUB-304918',
    customerName: 'Rajesh Nair',
    customerEmail: 'rajesh.nair@example.com',
    customerPhone: '9988776655',
    customerAddress: 'Flat 2B, Lotus Gardens, Adyar, Chennai, Tamil Nadu',
    customerPincode: '600020',
    planType: '3month',
    planName: '3-Month Pooja Kit Subscription',
    price: 1299,
    billingCycle: '3-Month',
    startDate: '2026-04-18',
    nextDeliveryDate: '2026-07-18',
    status: 'Active',
    shippingStatus: 'Delivered',
    paymentMethod: 'Credit Card',
    customItems: []
  },
  {
    id: 'SUB-772910',
    customerName: 'Lakshmi Iyer',
    customerEmail: 'lakshmi@example.com',
    customerPhone: '9876543210',
    customerAddress: '24, Vaikunth Society, Juhu, Mumbai, Maharashtra',
    customerPincode: '400049',
    planType: '6month',
    planName: '6-Month Pooja Kit Subscription',
    price: 2499,
    billingCycle: '6-Month',
    startDate: '2026-06-01',
    nextDeliveryDate: '2026-12-01',
    status: 'Active',
    shippingStatus: 'Sourced',
    paymentMethod: 'Net Banking',
    customItems: []
  }
];

const defaultInquiries = [
  {
    name: 'Amit Patel',
    email: 'amit@example.com',
    message: 'Can I add extra Deepam Oil? Thanks!',
    date: '2026-06-05'
  },
  {
    name: 'Saraswati Sen',
    email: 'sara@example.com',
    message: 'Hello, I would like to know more about the Monthly Pooja Kit.',
    date: '2026-06-07'
  }
];

const defaultNotifications = [
  {
    id: 'NOT-1',
    type: 'Email',
    recipient: 'priya.sharma@example.com',
    subject: 'Pooja Kit Shipped! 🚚',
    body: 'Hari Om Priya. Your Monthly Pooja Kit has been packed with care and dispatched via Speed Post. Track your status on your dashboard!',
    date: '2026-05-15 10:30'
  },
  {
    id: 'NOT-2',
    type: 'SMS',
    recipient: '8431119696',
    subject: 'Order Confirmation',
    body: 'Pranam! Your order for Monthly Pooja Kit (SUB-948120) has been received. Thank you for choosing Sacred Samskara.',
    date: '2026-05-10 14:15'
  }
];

const defaultReferrals = {
  code: 'DIVINE50',
  completedCount: 2,
  history: [
    { friendEmail: 'devendra@example.com', date: '2026-05-20', status: 'Completed', reward: '₹50 Coupon Earned' },
    { friendEmail: 'gopal@example.com', date: '2026-06-02', status: 'Completed', reward: '₹50 Coupon Earned' }
  ]
};

// Read from LocalStorage
export function getSubscriptions() {
  const data = localStorage.getItem(STATE_KEYS.SUBS);
  if (!data) {
    localStorage.setItem(STATE_KEYS.SUBS, JSON.stringify(defaultSubscriptions));
    return defaultSubscriptions;
  }
  return JSON.parse(data);
}

export function saveSubscriptions(subs) {
  localStorage.setItem(STATE_KEYS.SUBS, JSON.stringify(subs));
}

// Synchronize all database tables with the MongoDB Backend Atlas Server
export async function syncDatabaseWithServer() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout

  try {
    const [subsRes, inquiriesRes, notesRes, refRes] = await Promise.all([
      fetch('/api/subscriptions', { signal: controller.signal }),
      fetch('/api/inquiries', { signal: controller.signal }),
      fetch('/api/notifications', { signal: controller.signal }),
      fetch('/api/referrals', { signal: controller.signal })
    ]);

    clearTimeout(timeoutId);

    if (subsRes.ok && inquiriesRes.ok && notesRes.ok && refRes.ok) {
      const subs = await subsRes.json();
      const inquiries = await inquiriesRes.json();
      const notifications = await notesRes.json();
      const referrals = await refRes.json();

      localStorage.setItem(STATE_KEYS.SUBS, JSON.stringify(subs));
      localStorage.setItem(STATE_KEYS.INQUIRIES, JSON.stringify(inquiries));
      localStorage.setItem(STATE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STATE_KEYS.REFERRALS, JSON.stringify(referrals));
      console.log('Sacred database successfully synchronized with MongoDB Atlas.');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Backend Server offline. Using local storage cache.', err.message);
  }
}

export function addSubscription(sub) {
  const subs = getSubscriptions();
  subs.unshift(sub);
  saveSubscriptions(subs);

  // Background MongoDB post sync
  fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub)
  }).catch(err => console.warn('Background sync failed to add subscription:', err.message));

  return sub;
}

export function updateSubscription(id, updates) {
  const subs = getSubscriptions();
  const index = subs.findIndex(s => s.id === id);
  if (index !== -1) {
    subs[index] = { ...subs[index], ...updates };
    saveSubscriptions(subs);

    // Background MongoDB update sync
    fetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subs[index])
    }).catch(err => console.warn('Background sync failed to update subscription:', err.message));

    return subs[index];
  }
  return null;
}

// Inquiries
export function getInquiries() {
  const data = localStorage.getItem(STATE_KEYS.INQUIRIES);
  if (!data) {
    localStorage.setItem(STATE_KEYS.INQUIRIES, JSON.stringify(defaultInquiries));
    return defaultInquiries;
  }
  return JSON.parse(data);
}

export function addInquiry(inquiry) {
  const inquiries = getInquiries();
  const data = { ...inquiry, date: new Date().toISOString().split('T')[0] };
  inquiries.unshift(data);
  localStorage.setItem(STATE_KEYS.INQUIRIES, JSON.stringify(inquiries));

  // Background MongoDB post sync
  fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.warn('Background sync failed to add inquiry:', err.message));
}

// Notifications Simulation
export function getNotifications() {
  const data = localStorage.getItem(STATE_KEYS.NOTIFICATIONS);
  if (!data) {
    localStorage.setItem(STATE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
    return defaultNotifications;
  }
  return JSON.parse(data);
}

export function addNotification(notification) {
  const notes = getNotifications();
  const data = {
    id: 'NOT-' + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    ...notification
  };
  notes.unshift(data);
  localStorage.setItem(STATE_KEYS.NOTIFICATIONS, JSON.stringify(notes));

  // Background MongoDB post sync
  fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.warn('Background sync failed to add notification:', err.message));
}

// Referral Program Simulation
export function getReferralData() {
  const data = localStorage.getItem(STATE_KEYS.REFERRALS);
  if (!data) {
    localStorage.setItem(STATE_KEYS.REFERRALS, JSON.stringify(defaultReferrals));
    return defaultReferrals;
  }
  return JSON.parse(data);
}

export function addReferral(friendEmail) {
  const ref = getReferralData();
  ref.completedCount += 1;
  ref.history.unshift({
    friendEmail,
    date: new Date().toISOString().split('T')[0],
    status: 'Completed',
    reward: '₹50 Coupon Earned'
  });
  localStorage.setItem(STATE_KEYS.REFERRALS, JSON.stringify(ref));

  // Background MongoDB post sync
  fetch('/api/referrals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friendEmail })
  }).catch(err => console.warn('Background sync failed to post referral:', err.message));

  return ref;
}

// Session
export function getLoggedInEmail() {
  return localStorage.getItem(STATE_KEYS.SESSION);
}

export function loginUser(email) {
  localStorage.setItem(STATE_KEYS.SESSION, email.trim().toLowerCase());
}

export function logoutUser() {
  localStorage.removeItem(STATE_KEYS.SESSION);
}

export function getSubscriptionsByEmail(email) {
  const subs = getSubscriptions();
  return subs.filter(s => s.customerEmail.toLowerCase() === email.trim().toLowerCase());
}
