import mongoose, { Schema, Model, models } from 'mongoose';

export interface IRecurringSubscription {
  userId: mongoose.Types.ObjectId;
  streamId: string; // Plaid stream ID
  merchantName: string;
  description?: string;
  category: string[];
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';
  lastAmount: number;
  lastDate: Date;
  firstDate?: Date;
  isActive: boolean;
  status: 'ACTIVE' | 'MATURE' | 'EARLY_DETECTION' | 'TOMBSTONED';
  averageAmount?: number;
  flowType: 'OUTFLOW' | 'INFLOW';
  accountId: string;
  transactionIds: string[];
  isoCurrencyCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringSubscriptionSchema = new Schema<IRecurringSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    streamId: {
      type: String,
      required: true,
      unique: true,
    },
    merchantName: {
      type: String,
      required: true,
      index: true,
    },
    description: String,
    category: [String],
    frequency: {
      type: String,
      enum: ['WEEKLY', 'BIWEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'],
      required: true,
    },
    lastAmount: {
      type: Number,
      required: true,
    },
    lastDate: {
      type: Date,
      required: true,
    },
    firstDate: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'MATURE', 'EARLY_DETECTION', 'TOMBSTONED'],
      required: true,
    },
    averageAmount: Number,
    flowType: {
      type: String,
      enum: ['OUTFLOW', 'INFLOW'],
      required: true,
      index: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    transactionIds: [String],
    isoCurrencyCode: String,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
RecurringSubscriptionSchema.index({ userId: 1, isActive: 1 });
RecurringSubscriptionSchema.index({ userId: 1, flowType: 1 });
RecurringSubscriptionSchema.index({ userId: 1, frequency: 1 });

const RecurringSubscription: Model<IRecurringSubscription> =
  models.RecurringSubscription ||
  mongoose.model<IRecurringSubscription>('RecurringSubscription', RecurringSubscriptionSchema);

export default RecurringSubscription;
