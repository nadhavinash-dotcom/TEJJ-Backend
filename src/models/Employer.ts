import { Schema, model, Document } from 'mongoose';

const geoPointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true },
}, { _id: false });

export interface IEmployer extends Document {
  user_id: Schema.Types.ObjectId;
  property_name: string;
  property_type: string;
  property_segment?: string;
  cuisine_types: string[];
  covers_capacity?: number;
  number_of_rooms?: number;
  brand_affiliation?: string;
  year_established?: number;
  property_logo_url?: string;
  property_photos: string[];
  location?: { type: string; coordinates: [number, number] };
  location_address?: string;
  location_landmark?: string;
  pincode?: string;
  city?: string;
  area_locality?: string;
  nearest_metro_or_bus?: string;
  parking_available?: boolean;
  contact_name: string;
  contact_phone: string;
  alternate_contact_name?: string;
  alternate_contact_phone?: string;
  entry_instructions?: string;
  gstin?: string;
  gstin_verified: boolean;
  gstin_business_name?: string;
  fssai_license_number?: string;
  fssai_verified: boolean;
  liquor_license: boolean;
  psara_registered: boolean;
  verified_employer_badge: boolean;
  dignity_score: number;
  dignity_state: string;
  confirmation_rate: number;
  pay_accuracy_rate: number;
  fair_treatment_rate: number;
  worker_return_rate: number;
  whisper_flag_count: number;
  confirm_gate_blocked: boolean;
  confirm_gate_reason?: string;
  confirm_gate_since?: Date;
  plan: string;
  plan_started_at?: Date;
  plan_expires_at?: Date;
  posts_this_month: number;
  monthly_post_limit: number;
  payment_method_id?: string;
  badge_subscription_active: boolean;
  cream_pool_access: boolean;
  analytics_access: boolean;
  interview_scheduler_access: boolean;
  agent_recruiter_access: boolean;
  uplift_portfolio_access: boolean;
  demo_post_access: boolean;
  multi_property_access: boolean;
  database_search_access: boolean;
  database_unlocks_remaining: number;
  total_jobs_posted: number;
  total_confirmed_arrivals: number;
  l1_fill_rate: number;
  avg_time_to_match_min: number;
  no_show_rate: number;
  avg_worker_rating_given: number;
  rehire_rate: number;
  avg_pay_vs_market: number;
  thirty_day_repost_rate: number;
  retain_plan_tier: string;
  retain_workers_enrolled: number;
  retain_monthly_cost: number;
  retain_started_at?: Date;
  auto_recruiter_enabled: boolean;
  auto_post_trigger_condition?: string;
  auto_post_template_id?: Schema.Types.ObjectId;
  suspended: boolean;
  suspension_reason?: string;
  created_at: Date;
  updated_at: Date;
}

const employerSchema = new Schema<IEmployer>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  property_name: { type: String, required: true },
  property_type: { type: String, required: true },
  property_segment: String,
  cuisine_types: [String],
  covers_capacity: Number,
  number_of_rooms: Number,
  brand_affiliation: String,
  year_established: Number,
  property_logo_url: String,
  property_photos: [String],
  location: { type: geoPointSchema },
  location_address: String,
  location_landmark: String,
  pincode: String,
  city: String,
  area_locality: String,
  nearest_metro_or_bus: String,
  parking_available: Boolean,
  contact_name: { type: String, required: true },
  contact_phone: { type: String, required: true },
  alternate_contact_name: String,
  alternate_contact_phone: String,
  entry_instructions: String,
  gstin: String,
  gstin_verified: { type: Boolean, default: false },
  gstin_business_name: String,
  fssai_license_number: String,
  fssai_verified: { type: Boolean, default: false },
  liquor_license: { type: Boolean, default: false },
  psara_registered: { type: Boolean, default: false },
  verified_employer_badge: { type: Boolean, default: false },
  dignity_score: { type: Number, default: 4.0 },
  dignity_state: { type: String, default: 'NEW', enum: ['NEW', 'ESTABLISHED', 'WARNING', 'RESTRICTED', 'UNDER_REVIEW', 'SUSPENDED'] },
  confirmation_rate: { type: Number, default: 1.0 },
  pay_accuracy_rate: { type: Number, default: 1.0 },
  fair_treatment_rate: { type: Number, default: 1.0 },
  worker_return_rate: { type: Number, default: 0 },
  whisper_flag_count: { type: Number, default: 0 },
  confirm_gate_blocked: { type: Boolean, default: false },
  confirm_gate_reason: String,
  confirm_gate_since: Date,
  plan: { type: String, default: 'FLASH_FREE', enum: ['FLASH_FREE', 'STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'] },
  plan_started_at: Date,
  plan_expires_at: Date,
  posts_this_month: { type: Number, default: 0 },
  monthly_post_limit: { type: Number, default: 3 },
  payment_method_id: String,
  badge_subscription_active: { type: Boolean, default: false },
  cream_pool_access: { type: Boolean, default: false },
  analytics_access: { type: Boolean, default: false },
  interview_scheduler_access: { type: Boolean, default: false },
  agent_recruiter_access: { type: Boolean, default: false },
  uplift_portfolio_access: { type: Boolean, default: false },
  demo_post_access: { type: Boolean, default: false },
  multi_property_access: { type: Boolean, default: false },
  database_search_access: { type: Boolean, default: false },
  database_unlocks_remaining: { type: Number, default: 0 },
  total_jobs_posted: { type: Number, default: 0 },
  total_confirmed_arrivals: { type: Number, default: 0 },
  l1_fill_rate: { type: Number, default: 0 },
  avg_time_to_match_min: { type: Number, default: 0 },
  no_show_rate: { type: Number, default: 0 },
  avg_worker_rating_given: { type: Number, default: 0 },
  rehire_rate: { type: Number, default: 0 },
  avg_pay_vs_market: { type: Number, default: 0 },
  thirty_day_repost_rate: { type: Number, default: 0 },
  retain_plan_tier: { type: String, default: 'NONE', enum: ['NONE', 'BASIC', 'PLUS', 'PREMIUM'] },
  retain_workers_enrolled: { type: Number, default: 0 },
  retain_monthly_cost: { type: Number, default: 0 },
  retain_started_at: Date,
  auto_recruiter_enabled: { type: Boolean, default: false },
  auto_post_trigger_condition: String,
  auto_post_template_id: { type: Schema.Types.ObjectId, ref: 'JobTemplate' },
  suspended: { type: Boolean, default: false },
  suspension_reason: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

employerSchema.index({ location: '2dsphere' }, { name: 'idx_employer_location_2dsphere' });
employerSchema.index({ city: 1, dignity_score: -1 });

export const Employer = model<IEmployer>('Employer', employerSchema);
