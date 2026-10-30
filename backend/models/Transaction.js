const mongoose = require('mongoose');

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Scholarship',
  'Business',
  'Investment',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Education',
  'Entertainment',
  'Health',
  'Bills',
  'Rent',
  'Travel',
  'Other Expense',
];

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be income or expense',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ALL_CATEGORIES,
        message: 'Invalid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user+date queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

