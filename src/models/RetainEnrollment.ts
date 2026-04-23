import { Schema, model, Document } from 'mongoose';

export interface IRetainEnrollment extends Document {
  employer_id: Schema.Types.ObjectId;
  worker_id: Schema.Types.ObjectId;
  plan_tier: string;
  enrolled_at: Date;
  days_with_employer: number;
  insurance_active: boolean;
  insurance_activated_at?: Date;
  loan_eligible: boolean;
  loan_initiated: boolean;
  loan_amount?: number;
  loan_emi_employer?: number;
  status: string;
}

const retainEnrollmentSchema = new Schema<IRetainEnrollment>({
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  plan_tier: { type: String, required: true, enum: ['BASIC', 'PLUS', 'PREMIUM'] },
  enrolled_at: { type: Date, default: Date.now },
  days_with_employer: { type: Number, default: 0 },
  insurance_active: { type: Boolean, default: false },
  insurance_activated_at: Date,
  loan_eligible: { type: Boolean, default: false },
  loan_initiated: { type: Boolean, default: false },
  loan_amount: Number,
  loan_emi_employer: Number,
  status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'PAUSED', 'CANCELLED'] },
});

retainEnrollmentSchema.index({ employer_id: 1, worker_id: 1 });

export const RetainEnrollment = model<IRetainEnrollment>('RetainEnrollment', retainEnrollmentSchema);
