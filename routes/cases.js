const express = require('express');
const router = express.Router();
const Case = require('../models/Case');

// Helper function to generate a Case Number (e.g., PC-2026-12345)
const generateCaseNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PC-${year}-${randomNum}`;
};

// 2. CREATE A CASE
router.post('/create', async (req, res) => {
  try {
    const { userId, issueType, description } = req.body;

    if (!userId || !issueType || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newCase = new Case({
      caseNumber: generateCaseNumber(),
      userId,
      issueType,
      description,
      status: 'pending_payment'
    });

    await newCase.save();

    // Determine price based on issue type
    const price = issueType === 'advanced' ? 50 : 30;

    res.status(201).json({
      message: 'Case created. Please proceed to payment.',
      caseId: newCase._id,
      caseNumber: newCase.caseNumber,
      amountDue: price,
      currency: 'USD'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating case', error: error.message });
  }
});

// 3. GET CASE DETAILS (To check if paid)
router.get('/:id', async (req, res) => {
  try {
    const caseDetails = await Case.findById(req.params.id);
    if (!caseDetails) return res.status(404).json({ message: 'Case not found' });
    res.json(caseDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
