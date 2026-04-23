export interface CrewPool {
  _id: string;
  employer_id: string;
  pool_name: string;
  description?: string;
  created_at: Date;
}

export interface CrewPoolMember {
  _id: string;
  pool_id: string;
  worker_id: string;
  added_at: Date;
  added_reason?: string;
  is_active: boolean;
}

export type WhisperStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REMOVED';

export type WhisperCategory =
  | 'UNPAID_WAGES'
  | 'ABUSIVE_BEHAVIOUR'
  | 'FAKE_JOB_POST'
  | 'UNSAFE_CONDITIONS'
  | 'OTHER';

export interface WhisperPost {
  _id: string;
  worker_id_hash: string;
  employer_locality: string;
  employer_type: string;
  category: WhisperCategory;
  content: string;
  original_language?: string;
  transcribed_english?: string;
  status: WhisperStatus;
  helpful_count: number;
  created_at: Date;
}

export interface MarketRate {
  _id: string;
  city: string;
  skill: string;
  median: number;
  p25: number;
  p75: number;
  updated_at: Date;
}

export interface DispatchEvent {
  _id: string;
  job_id: string;
  worker_id: string;
  event_type: 'PINGED' | 'NOTIFIED_WHATSAPP' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'NO_RESPONSE';
  channel: 'PUSH' | 'WHATSAPP' | 'SMS';
  sent_at: Date;
  responded_at?: Date;
  response_latency_seconds?: number;
}

export interface Referral {
  _id: string;
  referrer_worker_id: string;
  referred_worker_id?: string;
  referral_code_used: string;
  referred_at: Date;
  first_arrival_at?: Date;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  referrer_credit: number;
  referred_bonus: number;
  paid_at?: Date;
}

export type CommunityAdminTier = 'A' | 'B' | 'C';

export interface CommunityAdmin {
  _id: string;
  name: string;
  phone: string;
  worker_id?: string;
  group_name: string;
  group_member_count: number;
  dominant_skill?: string;
  dominant_state_origin?: string;
  city: string;
  area_locality?: string;
  partnership_tier: CommunityAdminTier;
  referral_rate: number;
  total_referrals: number;
  total_successful_onboardings: number;
  total_earnings_paid: number;
  onboarded_by_ops_lead?: string;
  partnership_started?: Date;
  last_referral_at?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'CHURNED' | 'BLOCKED';
  notes?: string;
}

export interface RetainEnrollment {
  _id: string;
  employer_id: string;
  worker_id: string;
  plan_tier: 'BASIC' | 'PLUS' | 'PREMIUM';
  enrolled_at: Date;
  days_with_employer: number;
  insurance_active: boolean;
  insurance_activated_at?: Date;
  loan_eligible: boolean;
  loan_initiated: boolean;
  loan_amount?: number;
  loan_emi_employer?: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
}

export interface InsurancePolicy {
  _id: string;
  worker_id: string;
  retain_enrollment_id: string;
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

export interface Loan {
  _id: string;
  worker_id: string;
  retain_enrollment_id: string;
  loan_amount: number;
  emi_total: number;
  emi_employer_contribution: number;
  emi_worker: number;
  disbursement_date?: Date;
  loan_partner: 'Shriram Finance' | 'Bajaj Finserv' | 'IIFL' | 'Other';
  status: 'APPLIED' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  created_at: Date;
}

export type NotificationType =
  | 'FLASH_JOB'
  | 'MATCH_CONFIRMED'
  | 'ARRIVAL_REMINDER'
  | 'RATE_REQUEST'
  | 'INSURANCE_UPDATE'
  | 'LOAN_UPDATE'
  | 'TRUST_SCORE_CHANGE'
  | 'INTERVIEW_SCHEDULED'
  | 'SYSTEM';

export interface Notification {
  _id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  read_at?: Date;
  deep_link?: string;
  created_at: Date;
}

export interface PlatformEvent {
  _id: string;
  user_id?: string;
  worker_id?: string;
  employer_id?: string;
  event_type: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: Date;
}

export interface SupsPrediction {
  _id: string;
  worker_id: string;
  job_id: string;
  score: number;
  features_snapshot: Record<string, unknown>;
  predicted_at: Date;
  model_version: string;
}

export interface PlanSubscription {
  _id: string;
  employer_id: string;
  plan: string;
  amount: number;
  currency: 'INR';
  payment_id?: string;
  started_at: Date;
  expires_at?: Date;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  created_at: Date;
}
