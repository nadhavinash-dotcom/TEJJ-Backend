import { Schema, model, Document } from 'mongoose';

export interface IInsurancePolicy extends Document {
  worker_id: Schema.Types.ObjectId;
  retain_enrollment_id: Schema.Types.ObjectId;
  policy_number: string;
  provider: string;
  cover_amount: number;
  accident_cover?: number;
  opd_cover?: number;
  start_date: Date;
  end_date: Date;
  card_url?: string;
  active: boolean;
  created_at: Date;
}

const insurancePolicySchema = new Schema<IInsurancePolicy>({
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  retain_enrollment_id: { type: Schema.Types.ObjectId, ref: 'RetainEnrollment', required: true },
  policy_number: { type: String, required: true, unique: true },
  provider: { type: String, default: 'Star Health' },
  cover_amount: { type: Number, default: 100000 },
  accident_cover: Number,
  opd_cover: Number,
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  card_url: String,
  active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at' } });

export const InsurancePolicy = model<IInsurancePolicy>('InsurancePolicy', insurancePolicySchema);
