import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  baseScore: {
    type: Number,
    required: true
  },
  timeBonus: {
    type: Number,
    required: true
  },
  moveBonus: {
    type: Number,
    required: true
  },
  totalScore: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  movesUsed: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

scoreSchema.index({ user: 1, level: 1 });
scoreSchema.index({ totalScore: -1 });

export default mongoose.model('Score', scoreSchema);
