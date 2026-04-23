import type { GeoPoint } from './user.types';

export type HiringLane = 1 | 2 | 3 | 4;

export type JobStatus =
  | 'DRAFT'
  | 'BROADCASTING'
  | 'MATCHED'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'PAUSED';

export type PayType = 'PER_SHIFT' | 'DAILY' | 'MONTHLY' | 'ANNUAL';

export interface KillerQuestion {
  id: string;
  question: string;
  answer_type: 'YES_NO' | 'TEXT' | 'CHOICE';
  required: boolean;
  choices?: string[];
}

export interface Job {
  _id: string;
  employer_id: string;
  lane: HiringLane;
  is_demo_post: boolean;
  job_title: string;
  job_description?: string;
  primary_skill: string;
  secondary_skills_preferred: string[];
  cuisine_preferred: string[];
  pay_rate?: number;
  pay_type: PayType;
  pay_min?: number;
  pay_max?: number;
  shift_start_time?: Date;
  shift_end_time?: Date;
  shift_duration_hours?: number;
  number_of_openings: number;
  openings_filled: number;
  geofence_radius_m: number;
  location?: GeoPoint;
  uniform_required?: string;
  experience_years_min?: number;
  minimum_qualification?: string;
  killer_questions: KillerQuestion[];
  special_instructions?: string;
  accommodation_provided: boolean;
  meals_provided: boolean;
  transport_provided: boolean;
  contract_start_date?: Date;
  contract_duration?: string;
  notice_period_max_days?: number;
  interview_required: boolean;
  interview_format?: 'In-Person' | 'Video Call' | 'Both';
  cream_pool_first: boolean;
  status: JobStatus;
  expires_at?: Date;
  template_id?: string;
  boost_active: boolean;
  boost_expires_at?: Date;
  boost_count: number;
  pay_vs_market?: number;
  demo_evaluation_criteria: string[];
  demo_hiring_standard?: string;
  demo_fulltime_salary?: number;
  demo_conversion_count: number;
  keywords_extracted: string[];
  created_at: Date;
  updated_at: Date;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'MATCHED'
  | 'INTERVIEW_SCHEDULED'
  | 'DEMO_SCHEDULED'
  | 'OFFER_MADE'
  | 'HIRED'
  | 'NOT_PROCEEDED'
  | 'NO_SHOW_INTERVIEW'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface KillerAnswer {
  question_id: string;
  answer: string;
}

export interface Application {
  _id: string;
  job_id: string;
  worker_id: string;
  employer_id: string;
  applied_at: Date;
  killer_answers: KillerAnswer[];
  status: ApplicationStatus;
  distance_at_apply?: number;
  sups_at_apply?: number;
  created_at: Date;
  updated_at: Date;
}

export type MatchStatus =
  | 'MATCHED'
  | 'WORKER_EN_ROUTE'
  | 'ARRIVED'
  | 'CONFIRMED'
  | 'NO_SHOW_WORKER'
  | 'NO_SHOW_EMPLOYER_CONFIRM'
  | 'CANCELLED_WORKER'
  | 'CANCELLED_EMPLOYER'
  | 'COMPLETED'
  | 'DISPUTED';

export type MatchMethod =
  | 'L1_FLASH'
  | 'L2_SAME_DAY'
  | 'L3_CONTRACT'
  | 'L4_PERMANENT'
  | 'DEMO_POST'
  | 'CREAM_POOL'
  | 'AGENT_AUTO';

export type ConfirmMethod = 'QR_SCAN' | 'MANUAL_CONFIRM' | 'IVR_CONFIRM';

export interface Match {
  _id: string;
  job_id: string;
  worker_id: string;
  employer_id: string;
  matched_at: Date;
  match_method: MatchMethod;
  worker_distance_m?: number;
  worker_sups_at_match?: number;
  worker_location_at_match?: GeoPoint;
  status: MatchStatus;
  arrived_at?: Date;
  confirmed_at?: Date;
  confirmed_method?: ConfirmMethod;
  shift_end_confirmed_at?: Date;
  no_show_reported_at?: Date;
  no_show_reported_by?: 'EMPLOYER' | 'WORKER' | 'SYSTEM';
  cancellation_reason?: string;
  worker_rating_id?: string;
  employer_rating_id?: string;
  placement_fee_charged?: number;
  placement_fee_paid: boolean;
  created_at: Date;
}

export interface RatingWorker {
  _id: string;
  match_id: string;
  worker_id: string;
  employer_id: string;
  overall_score: number;
  skill_match?: number;
  punctuality?: number;
  professionalism?: number;
  would_rehire?: boolean;
  on_time?: boolean;
  private_note?: string;
  created_at: Date;
}

export interface RatingEmployer {
  _id: string;
  match_id: string;
  worker_id_hash: string;
  employer_id: string;
  overall_score: number;
  pay_on_time?: boolean;
  respectful_treatment?: boolean;
  would_return?: boolean;
  private_note?: string;
  created_at: Date;
}

export type InterviewStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'NO_SHOW_CANDIDATE'
  | 'NO_SHOW_EMPLOYER'
  | 'RESCHEDULED'
  | 'CANCELLED';

export interface Interview {
  _id: string;
  application_id: string;
  job_id: string;
  employer_id: string;
  worker_id: string;
  scheduled_date: Date;
  scheduled_time: string;
  interview_type: 'In-Person' | 'Video Call';
  location_or_link?: string;
  interviewer_name?: string;
  pre_interview_brief?: string;
  ics_url?: string;
  status: InterviewStatus;
  reminder_24h_sent: boolean;
  reminder_2h_sent: boolean;
  created_at: Date;
}

export interface JobTemplate {
  _id: string;
  employer_id: string;
  template_name: string;
  lane: HiringLane;
  primary_skill: string;
  job_title: string;
  pay_rate?: number;
  shift_duration_hours?: number;
  killer_questions: KillerQuestion[];
  special_instructions?: string;
  usage_count: number;
  last_used_at?: Date;
  created_at: Date;
}
