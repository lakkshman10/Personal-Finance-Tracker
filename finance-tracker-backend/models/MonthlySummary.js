const mongoose = require("mongoose");

const MonthlySummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: {
    type: String,
    required: true,
  }, // Format: YYYY-MM
  totalExpenses: {
    type: Number,
    default: 0,
  },
  categoriesBreakdown: {
    type: Map,
    of: Number,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

MonthlySummarySchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySummary', MonthlySummarySchema);
