import { Schema, model, Document } from 'mongoose';

const geoPointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true },
}, { _id: false });

export interface IWorker extends Document {
  user_id: Schema.Types.ObjectId;
  full_name?: string;
  profile_photo_url?: string;
  gender?: string;
  date_of_birth?: Date;
  state_of_origin?: string;
  aadhaar_verified: boolean;
  primary_skill?: string;
  secondary_skills: string[];
  cuisine_specialities: string[];
  service_styles: string[];
  years_experience: number;
  highest_qualification?: string;
  english_level?: string;
  languages_spoken: string[];
  equipment_skills: string[];
  pos_systems: string[];
  fssai_certified: boolean;
  fssai_certificate_url?: string;
  driving_license_number?: string;
  driving_license_verified: boolean;
  psara_certificate_url?: string;
  psara_verified: boolean;
  skill_video_url?: string;
  skill_video_thumbnail?: string;
  skill_video_duration_sec?: number;
  ai_score?: number;
  ai_score_technique?: number;
  ai_score_speed?: number;
  ai_score_hygiene?: number;
  ai_score_warmth?: number;
  ai_score_status: string;
  ai_score_feedback?: string;
  ai_confidence_score?: number;
  ai_scored_at?: Date;
  home_location?: { type: string; coordinates: [number, number] };
  last_known_location?: { type: string; coordinates: [number, number] };
  location_last_updated?: Date;
  locality_name?: string;
  city?: string;
  pincode?: string;
  area_locality?: string;
  preferred_radius_km: number;
  transport_mode?: string;
  recently_migrated: boolean;
  open_to_relocation: boolean;
  available_days: string[];
  available_from?: string;
  available_to?: string;
  notice_period_days: number;
  min_pay_per_shift?: number;
  min_monthly_salary?: number;
  min_dignity_score: number;
  trust_score: number;
  show_up_rate: number;
  employer_rating_avg: number;
  profile_depth_score: number;
  conduct_score: number;
  total_confirmed_arrivals: number;
  total_no_shows: number;
  platform_activity_days: number;
  last_seen?: Date;
  avg_response_time_minutes?: number;
  insurance_enrolled: boolean;
  insurance_start_date?: Date;
  insurance_policy_number?: string;
  loan_eligible: boolean;
  loan_status: string;
  loan_amount?: number;
  earned_wage_eligible: boolean;
  skill_badge_modules_completed: number;
  status: string;
  suspended: boolean;
  suspension_reason?: string;
  suspension_lifted_at?: Date;
  appeal_submitted: boolean;
  referral_code?: string;
  referred_by_worker_id?: Schema.Types.ObjectId;
  referred_by_admin_id?: Schema.Types.ObjectId;
  total_referrals_completed: number;
  total_referral_earnings: number;
  agent_enabled: boolean;
  agent_rules?: Record<string, unknown>;
  qr_code_url?: string;
  fcm_token?: string;
  voice_search_keywords: string[];
  created_at: Date;
  updated_at: Date;
}

const workerSchema = new Schema<IWorker>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  full_name: String,
  profile_photo_url: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  date_of_birth: Date,
  state_of_origin: String,
  aadhaar_verified: { type: Boolean, default: false },
  primary_skill: String,
  secondary_skills: [String],
  cuisine_specialities: [String],
  service_styles: [String],
  years_experience: { type: Number, default: 0 },
  highest_qualification: String,
  english_level: { type: String, enum: ['None', 'Basic', 'Conversational', 'Fluent'] },
  languages_spoken: [String],
  equipment_skills: [String],
  pos_systems: [String],
  fssai_certified: { type: Boolean, default: false },
  fssai_certificate_url: String,
  driving_license_number: String,
  driving_license_verified: { type: Boolean, default: false },
  psara_certificate_url: String,
  psara_verified: { type: Boolean, default: false },
  skill_video_url: String,
  skill_video_thumbnail: String,
  skill_video_duration_sec: Number,
  ai_score: Number,
  ai_score_technique: Number,
  ai_score_speed: Number,
  ai_score_hygiene: Number,
  ai_score_warmth: Number,
  ai_score_status: { type: String, default: 'PENDING', enum: ['PENDING', 'SCORED', 'HUMAN_REVIEW', 'DISPUTED'] },
  ai_score_feedback: String,
  ai_confidence_score: Number,
  ai_scored_at: Date,
  home_location: { type: geoPointSchema },
  last_known_location: { type: geoPointSchema },
  location_last_updated: Date,
  locality_name: String,
  city: String,
  pincode: String,
  area_locality: String,
  preferred_radius_km: { type: Number, default: 10 },
  transport_mode: String,
  recently_migrated: { type: Boolean, default: false },
  open_to_relocation: { type: Boolean, default: false },
  available_days: [String],
  available_from: String,
  available_to: String,
  notice_period_days: { type: Number, default: 0 },
  min_pay_per_shift: Number,
  min_monthly_salary: Number,
  min_dignity_score: { type: Number, default: 3.0 },
  trust_score: { type: Number, default: 0 },
  show_up_rate: { type: Number, default: 1.0 },
  employer_rating_avg: { type: Number, default: 0 },
  profile_depth_score: { type: Number, default: 0 },
  conduct_score: { type: Number, default: 5.0 },
  total_confirmed_arrivals: { type: Number, default: 0 },
  total_no_shows: { type: Number, default: 0 },
  platform_activity_days: { type: Number, default: 0 },
  last_seen: Date,
  avg_response_time_minutes: Number,
  insurance_enrolled: { type: Boolean, default: false },
  insurance_start_date: Date,
  insurance_policy_number: String,
  loan_eligible: { type: Boolean, default: false },
  loan_status: { type: String, default: 'NOT_ELIGIBLE' },
  loan_amount: Number,
  earned_wage_eligible: { type: Boolean, default: false },
  skill_badge_modules_completed: { type: Number, default: 0 },
  status: { type: String, default: 'DRAFT', enum: ['DRAFT', 'DRAFT_ACTIVE', 'ACTIVE', 'PAUSED', 'SUSPENDED'] },
  suspended: { type: Boolean, default: false },
  suspension_reason: String,
  suspension_lifted_at: Date,
  appeal_submitted: { type: Boolean, default: false },
  referral_code: { type: String, unique: true, sparse: true },
  referred_by_worker_id: { type: Schema.Types.ObjectId, ref: 'Worker' },
  referred_by_admin_id: { type: Schema.Types.ObjectId, ref: 'CommunityAdmin' },
  total_referrals_completed: { type: Number, default: 0 },
  total_referral_earnings: { type: Number, default: 0 },
  agent_enabled: { type: Boolean, default: false },
  agent_rules: Schema.Types.Mixed,
  qr_code_url: String,
  fcm_token: String,
  voice_search_keywords: [String],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

workerSchema.index({ home_location: '2dsphere' }, { name: 'idx_worker_home_2dsphere' });
workerSchema.index({ last_known_location: '2dsphere' }, { name: 'idx_worker_last_known_2dsphere' });
workerSchema.index({ primary_skill: 1, status: 1 });
workerSchema.index({ trust_score: -1 });
workerSchema.index({ city: 1, primary_skill: 1 });

export const Worker = model<IWorker>('Worker', workerSchema);
