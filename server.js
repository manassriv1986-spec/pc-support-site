 const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const path = require('path');
  const Razorpay = require('razorpay');
  require('dotenv').config();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // DATABASE MODELS (In-file for stability)
  const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    country: { type: String, required: true }
  }));

  const Case = mongoose.model('Case', new mongoose.Schema({
    caseNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueType: { type: String, required: true },
    status: { type: String, default: 'pending_payment' },
    description: { type: String, required: true }
  }));

  const Payment = mongoose.model('Payment', new mongoose.Schema({
    transactionId: { type: String, required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    amount: { type: Number, required: true },
    status: { type: String, default: 'completed' }
  }));

  // PAYMENT LOGIC
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TowGWirwaWcs2R',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'PEcSxQfcZqAleh9z81CX6BDP',
  });

  app.post('/api/start-case', async (req, res) => {
    try {
      const { fullName, email, phone, country, issueType, description } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ fullName, email, phone, country });
      }
      const caseNumber = `PC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newCase = await Case.create({ caseNumber, userId: user._id, issueType, description });
      const amount = issueType === 'advanced' ? 50 : 30;
      const order = await razorpay.orders.create({ amount: amount * 100, currency: 'USD', receipt: `rcpt_${Date.now()}` });
      res.json({ userId: user._id, caseId: newCase._id, caseNumber: newCase.caseNumber, orderId: order.id, amount: amount });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { caseId, razorpay_payment_id } = req.body;
      await Case.findByIdAndUpdate(caseId, { status: 'paid' });
      await Payment.create({ transactionId: razorpay_payment_id, caseId, amount: 30 });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB'));

  app.get('/', (req, res) => res.send('Server Online! Visit /support.html'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
