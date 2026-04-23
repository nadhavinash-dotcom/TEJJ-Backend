import { Schema, model, Document } from 'mongoose';

export interface IPlanSubscription extends Document {
  employer_id: Schema.Types.ObjectId;
  plan: string;
  amount: number;
  currency: string;
  payment_id?: string;
  started_at: Date;
  expires_at?: Date;
  status: string;
  created_at: Date;
}

const planSubscriptionSchema = new Schema<IPlanSubscription>({
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  payment_id: String,
  started_at: { type: Date, default: Date.now },
  expires_at: Date,
  status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'] },
}, { timestamps: { createdAt: 'created_at' } });

planSubscriptionSchema.index({ employer_id: 1, status: 1 });

export const PlanSubscription = model<IPlanSubscription>('PlanSubscription', planSubscriptionSchema);
