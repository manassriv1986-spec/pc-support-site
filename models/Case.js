const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: {
    type: String,
    enum: ['normal', 'advanced'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending_payment', 'paid', 'open', 'resolved', 'closed'],
    default: 'pending_payment'
  },
  description: { type: String, required: true },
  logFileUrl: { type: String }, // Link to the S3/Cloud file
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', caseSchema);
