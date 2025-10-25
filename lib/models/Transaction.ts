import mongoose, { Schema, Model, models } from 'mongoose';

export interface ITransaction {
  userId: mongoose.Types.ObjectId;
  transactionId: string; // Plaid transaction ID
  accountId: string;
  amount: number;
  isoCurrencyCode?: string;
  unofficialCurrencyCode?: string;
  category?: string[];
  categoryId?: string;
  merchantName?: string;
  name: string;
  paymentChannel?: string;
  pending: boolean;
  pendingTransactionId?: string;
  date: Date;
  authorizedDate?: Date;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  paymentMeta?: {
    referenceNumber?: string;
    ppdId?: string;
    payee?: string;
  };
  personalFinanceCategory?: {
    primary?: string;
    detailed?: string;
    confidenceLevel?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isoCurrencyCode: String,
    unofficialCurrencyCode: String,
    category: [String],
    categoryId: String,
    merchantName: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    paymentChannel: String,
    pending: {
      type: Boolean,
      default: false,
      index: true,
    },
    pendingTransactionId: String,
    date: {
      type: Date,
      required: true,
      index: true,
    },
    authorizedDate: Date,
    location: {
      address: String,
      city: String,
      region: String,
      postalCode: String,
      country: String,
      lat: Number,
      lon: Number,
    },
    paymentMeta: {
      referenceNumber: String,
      ppdId: String,
      payee: String,
    },
    personalFinanceCategory: {
      primary: String,
      detailed: String,
      confidenceLevel: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, merchantName: 1 });
TransactionSchema.index({ userId: 1, 'personalFinanceCategory.primary': 1 });

const Transaction: Model<ITransaction> =
  models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
