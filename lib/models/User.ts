import mongoose, { Schema, Model, models } from 'mongoose';

export interface IUser {
  email: string;
  name?: string;
  plaidAccessToken?: string; // Encrypted
  plaidItemId?: string;
  plaidInstitutionId?: string;
  plaidInstitutionName?: string;
  cursor?: string; // For transaction sync
  accountsLinked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    plaidAccessToken: {
      type: String,
      select: false, // Don't include in queries by default
    },
    plaidItemId: {
      type: String,
    },
    plaidInstitutionId: {
      type: String,
    },
    plaidInstitutionName: {
      type: String,
    },
    cursor: {
      type: String,
    },
    accountsLinked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ plaidItemId: 1 });

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
