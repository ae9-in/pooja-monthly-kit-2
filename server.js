import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://jishnu:jishnu123@cluster0.bremaru.mongodb.net/pooja_kit?appName=Cluster0';

console.log('Connecting to MongoDB Atlas...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas (Database: pooja_kit).');
    seedDatabase();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
  });

// --- MONGOOSE SCHEMAS & MODELS ---

const SubscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerAddress: String,
  customerPincode: String,
  planType: String,
  planName: String,
  price: Number,
  billingCycle: String,
  startDate: String,
  nextDeliveryDate: String,
  status: String,
  shippingStatus: String, // Placed, Sourced, Packed, Shipped, Delivered
  paymentMethod: String,
  customItems: [String]
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

const InquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: String
});

const Inquiry = mongoose.model('Inquiry', InquirySchema);

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: String, // SMS, Email
  recipient: String,
  subject: String,
  body: String,
  date: String
});

const Notification = mongoose.model('Notification', NotificationSchema);

const ReferralSchema = new mongoose.Schema({
  code: { type: String, default: 'DIVINE50' },
  completedCount: { type: Number, default: 0 },
  history: [{
    friendEmail: String,
    date: String,
    status: String,
    reward: String
  }]
});

const Referral = mongoose.model('Referral', ReferralSchema);

// --- REST API ENDPOINTS ---

// 1. Subscriptions API
app.get('/api/subscriptions', async (req, res) => {
  try {
    const subs = await Subscription.find().sort({ _id: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const newSub = new Subscription(req.body);
    await newSub.save();
    res.status(201).json(newSub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const updatedSub = await Subscription.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedSub) return res.status(404).json({ error: 'Subscription not found' });
    res.json(updatedSub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Inquiries API
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ _id: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const newInquiry = new Inquiry({
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0]
    });
    await newInquiry.save();
    res.status(201).json(newInquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    const notes = await Notification.find().sort({ _id: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const newNote = new Notification({
      id: 'NOT-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ...req.body
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Referrals API
app.get('/api/referrals', async (req, res) => {
  try {
    let ref = await Referral.findOne({ code: 'DIVINE50' });
    if (!ref) {
      ref = new Referral({
        code: 'DIVINE50',
        completedCount: 2,
        history: [
          { friendEmail: 'devendra@example.com', date: '2026-05-20', status: 'Completed', reward: '₹50 Coupon Earned' },
          { friendEmail: 'gopal@example.com', date: '2026-06-02', status: 'Completed', reward: '₹50 Coupon Earned' }
        ]
      });
      await ref.save();
    }
    res.json(ref);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/referrals', async (req, res) => {
  try {
    const { friendEmail } = req.body;
    let ref = await Referral.findOne({ code: 'DIVINE50' });
    if (!ref) {
      ref = new Referral();
    }
    ref.completedCount += 1;
    ref.history.unshift({
      friendEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      reward: '₹50 Coupon Earned'
    });
    await ref.save();
    res.json(ref);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve static frontend files
app.use(express.static(__dirname));

// Wildcard fallback to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server listener
app.listen(PORT, () => {
  console.log(`Sacred Samskara Backend server running on http://localhost:${PORT}`);
});

// --- DATABASE SEEDING LOGIC ---
async function seedDatabase() {
  try {
    const subCount = await Subscription.countDocuments();
    if (subCount === 0) {
      console.log('Seeding initial subscription records into MongoDB...');
      const defaultSubs = [
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
          shippingStatus: 'Shipped',
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
      await Subscription.insertMany(defaultSubs);
      console.log('Seeded subscriptions successfully.');
    }

    const inqCount = await Inquiry.countDocuments();
    if (inqCount === 0) {
      console.log('Seeding initial inquiry records into MongoDB...');
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
      await Inquiry.insertMany(defaultInquiries);
      console.log('Seeded inquiries successfully.');
    }

    const noteCount = await Notification.countDocuments();
    if (noteCount === 0) {
      console.log('Seeding initial notification records into MongoDB...');
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
      await Notification.insertMany(defaultNotifications);
      console.log('Seeded notifications successfully.');
    }
  } catch (seedErr) {
    console.error('Error seeding initial records:', seedErr.message);
  }
}
