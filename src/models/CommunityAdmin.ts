import { Schema, model, Document } from 'mongoose';

export interface ICommunityAdmin extends Document {
  name: string;
  phone: string;
  worker_id?: Schema.Types.ObjectId;
  group_name: string;
  group_member_count: number;
  dominant_skill?: string;
  city: string;
  area_locality?: string;
  partnership_tier: string;
  referral_rate: number;
  total_referrals: number;
  total_successful_onboardings: number;
  total_earnings_paid: number;
  status: string;
  notes?: string;
  created_at: Date;
}

const communityAdminSchema = new Schema<ICommunityAdmin>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker' },
  group_name: { type: String, required: true },
  group_member_count: { type: Number, default: 0 },
  dominant_skill: String,
  city: { type: String, required: true },
  area_locality: String,
  partnership_tier: { type: String, default: 'C', enum: ['A', 'B', 'C'] },
  referral_rate: { type: Number, default: 25.0 },
  total_referrals: { type: Number, default: 0 },
  total_successful_onboardings: { type: Number, default: 0 },
  total_earnings_paid: { type: Number, default: 0 },
  status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'CHURNED', 'BLOCKED'] },
  notes: String,
}, { timestamps: { createdAt: 'created_at' } });

export const CommunityAdmin = model<ICommunityAdmin>('CommunityAdmin', communityAdminSchema);
