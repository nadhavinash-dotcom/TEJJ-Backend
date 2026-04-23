import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  user_id: Schema.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  read_at?: Date;
  deep_link?: string;
  created_at: Date;
}

const notificationSchema = new Schema<INotification>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String, required: true,
    enum: ['FLASH_JOB', 'MATCH_CONFIRMED', 'ARRIVAL_REMINDER', 'RATE_REQUEST', 'INSURANCE_UPDATE',
           'LOAN_UPDATE', 'TRUST_SCORE_CHANGE', 'INTERVIEW_SCHEDULED', 'SYSTEM']
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: Schema.Types.Mixed,
  read: { type: Boolean, default: false },
  read_at: Date,
  deep_link: String,
}, { timestamps: { createdAt: 'created_at' } });

notificationSchema.index({ user_id: 1, read: 1, created_at: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
