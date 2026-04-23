import { Schema, model, Document } from 'mongoose';

export interface IReferral extends Document {
  referrer_worker_id: Schema.Types.ObjectId;
  referred_worker_id?: Schema.Types.ObjectId;
  referral_code_used: string;
  referred_at: Date;
  first_arrival_at?: Date;
  status: string;
  referrer_credit: number;
  referred_bonus: number;
  paid_at?: Date;
}

const referralSchema = new Schema<IReferral>({
  referrer_worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  referred_worker_id: { type: Schema.Types.ObjectId, ref: 'Worker' },
  referral_code_used: { type: String, required: true },
  referred_at: { type: Date, default: Date.now },
  first_arrival_at: Date,
  status: { type: String, default: 'PENDING', enum: ['PENDING', 'COMPLETED', 'EXPIRED'] },
  referrer_credit: { type: Number, default: 25 },
  referred_bonus: { type: Number, default: 50 },
  paid_at: Date,
});

export const Referral = model<IReferral>('Referral', referralSchema);
