export type Language = 'hi' | 'te' | 'ta' | 'kn' | 'mr' | 'bn' | 'pa' | 'en';

export type UserRole = 'worker' | 'employer' | 'both';

export type NotificationPermission = 'GRANTED' | 'DENIED' | 'PENDING';

export type DeviceType = 'ANDROID' | 'IOS' | 'FEATURE_PHONE';

export interface User {
  _id: string;
  phone_number: string;
  firebase_uid: string;
  language: Language;
  has_worker: boolean;
  has_employer: boolean;
  active_role?: 'worker' | 'employer';
  fcm_token?: string;
  notification_permission: NotificationPermission;
  last_active?: Date;
  device_type?: DeviceType;
  app_version?: string;
  created_at: Date;
  updated_at: Date;
}

export type WorkerStatus = 'DRAFT' | 'DRAFT_ACTIVE' | 'ACTIVE' | 'PAUSED' | 'SUSPENDED';

export type AIScoreStatus = 'PENDING' | 'SCORED' | 'HUMAN_REVIEW' | 'DISPUTED';

export type LoanStatus =
  | 'NOT_ELIGIBLE'
  | 'ELIGIBLE'
  | 'APPLIED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DEFAULTED';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Worker {
  _id: string;
  user_id: string;
  full_name?: string;
  profile_photo_url?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  date_of_birth?: Date;
  state_of_origin?: string;
  aadhaar_verified: boolean;

  // Skills
  primary_skill?: string;
  secondary_skills: string[];
  cuisine_specialities: string[];
  service_styles: string[];
  years_experience: number;
  highest_qualification?: string;
  english_level?: 'None' | 'Basic' | 'Conversational' | 'Fluent';
  languages_spoken: string[];
  equipment_skills: string[];
  pos_systems: string[];

  // Certifications
  fssai_certified: boolean;
  fssai_certificate_url?: string;
  driving_license_number?: string;
  driving_license_url?: string;
  driving_license_verified: boolean;
  psara_certificate_url?: string;
  psara_verified: boolean;

  // Video & AI
  skill_video_url?: string;
  skill_video_thumbnail?: string;
  skill_video_duration_sec?: number;
  skill_video_uploaded_at?: Date;
  ai_score?: number;
  ai_score_technique?: number;
  ai_score_speed?: number;
  ai_score_hygiene?: number;
  ai_score_warmth?: number;
  ai_score_status: AIScoreStatus;
  ai_score_feedback?: string;
  ai_confidence_score?: number;
  ai_scored_at?: Date;

  // Location
  home_location?: GeoPoint;
  last_known_location?: GeoPoint;
  location_last_updated?: Date;
  locality_name?: string;
  city?: string;
  pincode?: string;
  area_locality?: string;
  preferred_radius_km: number;
  transport_mode?: 'Walk' | '2-Wheeler' | 'Public Transport' | 'Car';
  recently_migrated: boolean;
  open_to_relocation: boolean;

  // Availability
  available_days: string[];
  available_from?: string;
  available_to?: string;
  notice_period_days: number;

  // Pay
  min_pay_per_shift?: number;
  min_monthly_salary?: number;
  min_dignity_score: number;

  // Trust
  trust_score: number;
  show_up_rate: number;
  employer_rating_avg: number;
  profile_depth_score: number;
  conduct_score: number;
  total_confirmed_arrivals: number;
  total_no_shows: number;
  platform_activity_days: number;
  last_seen?: Date;

  // SUPS inputs
  avg_response_time_minutes?: number;
  peak_hour_acceptance_rate?: number;
  recent_activity_signal?: number;

  // Financial
  insurance_enrolled: boolean;
  insurance_start_date?: Date;
  insurance_policy_number?: string;
  insurance_card_url?: string;
  insurance_cover_amount?: number;
  loan_eligible: boolean;
  loan_status: LoanStatus;
  loan_amount?: number;
  earned_wage_eligible: boolean;
  skill_badge_modules_completed: number;

  // Status
  status: WorkerStatus;
  suspended: boolean;
  suspension_reason?: string;
  suspension_lifted_at?: Date;
  appeal_submitted: boolean;

  // Referral
  referral_code?: string;
  referred_by_worker_id?: string;
  referred_by_admin_id?: string;
  total_referrals_completed: number;
  total_referral_earnings: number;

  // Agent mode
  agent_enabled: boolean;
  agent_rules?: AgentRules;

  // QR
  qr_code_url?: string;

  // Voice
  voice_search_keywords: string[];

  fcm_token?: string;

  created_at: Date;
  updated_at: Date;
}

export interface AgentRules {
  min_pay_per_shift: number;
  max_radius_km: number;
  min_dignity_score: number;
  blackout_days: string[];
  blackout_from?: string;
  blackout_to?: string;
  preview_mode: boolean;
  cancellation_window_hours: number;
}

export type EmployerDignityState =
  | 'NEW'
  | 'ESTABLISHED'
  | 'WARNING'
  | 'RESTRICTED'
  | 'UNDER_REVIEW'
  | 'SUSPENDED';

export type EmployerPlan =
  | 'FLASH_FREE'
  | 'STARTER'
  | 'GROWTH'
  | 'PRO'
  | 'ENTERPRISE';

export type RetainPlanTier = 'NONE' | 'BASIC' | 'PLUS' | 'PREMIUM';

export interface Employer {
  _id: string;
  user_id: string;
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

  // Location
  location?: GeoPoint;
  location_address?: string;
  location_landmark?: string;
  pincode?: string;
  city?: string;
  area_locality?: string;
  nearest_metro_or_bus?: string;
  parking_available?: boolean;

  // Contact
  contact_name: string;
  contact_phone: string;
  alternate_contact_name?: string;
  alternate_contact_phone?: string;
  entry_instructions?: string;

  // Compliance
  gstin?: string;
  gstin_verified: boolean;
  gstin_business_name?: string;
  fssai_license_number?: string;
  fssai_verified: boolean;
  liquor_license: boolean;
  psara_registered: boolean;
  verified_employer_badge: boolean;

  // Dignity
  dignity_score: number;
  dignity_state: EmployerDignityState;
  confirmation_rate: number;
  pay_accuracy_rate: number;
  fair_treatment_rate: number;
  worker_return_rate: number;
  whisper_flag_count: number;

  // Confirm gate
  confirm_gate_blocked: boolean;
  confirm_gate_reason?: string;
  confirm_gate_since?: Date;

  // Plan
  plan: EmployerPlan;
  plan_started_at?: Date;
  plan_expires_at?: Date;
  posts_this_month: number;
  monthly_post_limit: number;
  payment_method_id?: string;
  badge_subscription_active: boolean;

  // Feature gates
  cream_pool_access: boolean;
  analytics_access: boolean;
  interview_scheduler_access: boolean;
  agent_recruiter_access: boolean;
  uplift_portfolio_access: boolean;
  demo_post_access: boolean;
  multi_property_access: boolean;
  database_search_access: boolean;
  database_unlocks_remaining: number;

  // Analytics (computed)
  total_jobs_posted: number;
  total_confirmed_arrivals: number;
  l1_fill_rate: number;
  avg_time_to_match_min: number;
  no_show_rate: number;
  avg_worker_rating_given: number;
  rehire_rate: number;
  avg_pay_vs_market: number;
  thirty_day_repost_rate: number;

  // Retain
  retain_plan_tier: RetainPlanTier;
  retain_workers_enrolled: number;
  retain_monthly_cost: number;
  retain_started_at?: Date;

  // Auto-recruiter
  auto_recruiter_enabled: boolean;
  auto_post_trigger_condition?: string;
  auto_post_template_id?: string;

  suspended: boolean;
  suspension_reason?: string;

  created_at: Date;
  updated_at: Date;
}
