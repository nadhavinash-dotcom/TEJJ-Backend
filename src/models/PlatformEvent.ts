import { Schema, model, Document } from 'mongoose';

export interface IPlatformEvent extends Document {
  user_id?: Schema.Types.ObjectId;
  worker_id?: Schema.Types.ObjectId;
  employer_id?: Schema.Types.ObjectId;
  event_type: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: Date;
}

const platformEventSchema = new Schema<IPlatformEvent>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker' },
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer' },
  event_type: { type: String, required: true },
  metadata: Schema.Types.Mixed,
  ip_address: String,
}, { timestamps: { createdAt: 'created_at' } });

platformEventSchema.index({ user_id: 1, created_at: -1 });
platformEventSchema.index({ event_type: 1, created_at: -1 });

export const PlatformEvent = model<IPlatformEvent>('PlatformEvent', platformEventSchema);
