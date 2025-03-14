const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      enum: ["monthly", "custom"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    alerts: {
      type: Number,
      required: true, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
