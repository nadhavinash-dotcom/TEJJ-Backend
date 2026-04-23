import { Schema, model, Document } from 'mongoose';

const geoPointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true },
}, { _id: false });

const killerQuestionSchema = new Schema({
  question: String,
  answer_type: { type: String, enum: ['YES_NO', 'TEXT', 'CHOICE'] },
  required: Boolean,
  choices: [String],
}, { _id: false });

export interface IJob extends Document {
  employer_id: Schema.Types.ObjectId;
  lane: number;
  is_demo_post: boolean;
  job_title: string;
  job_description?: string;
  primary_skill: string;
  secondary_skills_preferred: string[];
  cuisine_preferred: string[];
  pay_rate?: number;
  pay_type: string;
  pay_min?: number;
  pay_max?: number;
  shift_start_time?: Date;
  shift_end_time?: Date;
  shift_duration_hours?: number;
  number_of_openings: number;
  openings_filled: number;
  geofence_radius_m: number;
  location?: { type: string; coordinates: [number, number] };
  uniform_required?: string;
  experience_years_min?: number;
  minimum_qualification?: string;
  killer_questions: unknown[];
  special_instructions?: string;
  accommodation_provided: boolean;
  meals_provided: boolean;
  transport_provided: boolean;
  contract_start_date?: Date;
  contract_duration?: string;
  notice_period_max_days?: number;
  interview_required: boolean;
  interview_format?: string;
  cream_pool_first: boolean;
  status: string;
  expires_at?: Date;
  template_id?: Schema.Types.ObjectId;
  boost_active: boolean;
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

const jobSchema = new Schema<IJob>({
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  lane: { type: Number, required: true, enum: [1, 2, 3, 4] },
  is_demo_post: { type: Boolean, default: false },
  job_title: { type: String, required: true },
  job_description: String,
  primary_skill: { type: String, required: true },
  secondary_skills_preferred: [String],
  cuisine_preferred: [String],
  pay_rate: Number,
  pay_type: { type: String, default: 'PER_SHIFT', enum: ['PER_SHIFT', 'DAILY', 'MONTHLY', 'ANNUAL'] },
  pay_min: Number,
  pay_max: Number,
  shift_start_time: Date,
  shift_end_time: Date,
  shift_duration_hours: Number,
  number_of_openings: { type: Number, default: 1 },
  openings_filled: { type: Number, default: 0 },
  geofence_radius_m: { type: Number, default: 10000 },
  location: { type: geoPointSchema },
  uniform_required: String,
  experience_years_min: Number,
  minimum_qualification: String,
  killer_questions: [killerQuestionSchema],
  special_instructions: String,
  accommodation_provided: { type: Boolean, default: false },
  meals_provided: { type: Boolean, default: false },
  transport_provided: { type: Boolean, default: false },
  contract_start_date: Date,
  contract_duration: String,
  notice_period_max_days: Number,
  interview_required: { type: Boolean, default: false },
  interview_format: { type: String, enum: ['In-Person', 'Video Call', 'Both'] },
  cream_pool_first: { type: Boolean, default: false },
  status: { type: String, default: 'BROADCASTING', enum: ['DRAFT', 'BROADCASTING', 'MATCHED', 'PARTIALLY_FILLED', 'FILLED', 'EXPIRED', 'CANCELLED', 'PAUSED'] },
  expires_at: Date,
  template_id: { type: Schema.Types.ObjectId, ref: 'JobTemplate' },
  boost_active: { type: Boolean, default: false },
  boost_count: { type: Number, default: 0 },
  pay_vs_market: Number,
  demo_evaluation_criteria: [String],
  demo_hiring_standard: String,
  demo_fulltime_salary: Number,
  demo_conversion_count: { type: Number, default: 0 },
  keywords_extracted: [String],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

jobSchema.index({ location: '2dsphere' }, { name: 'idx_job_location_2dsphere' });
jobSchema.index({ status: 1, lane: 1, created_at: -1 });
jobSchema.index({ employer_id: 1 });
jobSchema.index({ primary_skill: 1, status: 1 });
jobSchema.index({ expires_at: 1 });

export const Job = model<IJob>('Job', jobSchema);
