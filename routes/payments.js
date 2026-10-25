const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Razorpay = require('razorpay');
const Case = require('../models/Case');
const Payment = require('../models/Payment');

function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// 1. CREATE RAZORPAY ORDER
router.post('/create-order', async (req, res) => {
  try {
    const { caseId, amount } = req.body;
    const razorpay = getRazorpayInstance();

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// 2. VERIFY PAYMENT
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, caseId, userId, amount } = req.body;

    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    await Case.findByIdAndUpdate(caseId, { status: 'paid', updatedAt: Date.now() });

    const newPayment = new Payment({
      transactionId: razorpay_payment_id,
      caseId,
      userId,
      amount: Number(amount) || 30,
      currency: 'INR',
      status: 'completed',
      paymentMethod: 'razorpay'
    });
    await newPayment.save();

    res.json({ message: 'Payment verified successfully!' });
  } catch (error) {
    console.error('Verify Error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

module.exports = router;