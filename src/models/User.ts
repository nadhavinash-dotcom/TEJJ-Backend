import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  phone_number: string;
  firebase_uid: string;
  language: string;
  has_worker: boolean;
  has_employer: boolean;
  active_role?: 'worker' | 'employer';
  fcm_token?: string;
  notification_permission: string;
  last_active?: Date;
  device_type?: string;
  app_version?: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>({
  phone_number: { type: String, required: true, unique: true, trim: true },
  firebase_uid: { type: String, required: false, unique: true, sparse: true },
  language: { type: String, default: 'hi' },
  has_worker: { type: Boolean, default: false },
  has_employer: { type: Boolean, default: false },
  active_role: { type: String, enum: ['worker', 'employer'] },
  fcm_token: String,
  notification_permission: { type: String, default: 'PENDING', enum: ['GRANTED', 'DENIED', 'PENDING'] },
  last_active: Date,
  device_type: { type: String, enum: ['ANDROID', 'IOS', 'FEATURE_PHONE'] },
  app_version: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = model<IUser>('User', userSchema);
