import { Schema, model, Document } from 'mongoose';

const geoPointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true },
}, { _id: false });

export interface IMatch extends Document {
  job_id: Schema.Types.ObjectId;
  worker_id: Schema.Types.ObjectId;
  employer_id: Schema.Types.ObjectId;
  matched_at: Date;
  match_method: string;
  worker_distance_m?: number;
  worker_sups_at_match?: number;
  worker_location_at_match?: { type: string; coordinates: [number, number] };
  status: string;
  arrived_at?: Date;
  confirmed_at?: Date;
  confirmed_method?: string;
  shift_end_confirmed_at?: Date;
  no_show_reported_at?: Date;
  no_show_reported_by?: string;
  cancellation_reason?: string;
  worker_rating_id?: Schema.Types.ObjectId;
  employer_rating_id?: Schema.Types.ObjectId;
  placement_fee_charged?: number;
  placement_fee_paid: boolean;
  created_at: Date;
}

const matchSchema = new Schema<IMatch>({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  matched_at: { type: Date, default: Date.now },
  match_method: {
    type: String, required: true,
    enum: ['L1_FLASH', 'L2_SAME_DAY', 'L3_CONTRACT', 'L4_PERMANENT', 'DEMO_POST', 'CREAM_POOL', 'AGENT_AUTO']
  },
  worker_distance_m: Number,
  worker_sups_at_match: Number,
  worker_location_at_match: geoPointSchema,
  status: {
    type: String, default: 'MATCHED',
    enum: ['MATCHED', 'WORKER_EN_ROUTE', 'ARRIVED', 'CONFIRMED', 'NO_SHOW_WORKER',
           'NO_SHOW_EMPLOYER_CONFIRM', 'CANCELLED_WORKER', 'CANCELLED_EMPLOYER', 'COMPLETED', 'DISPUTED']
  },
  arrived_at: Date,
  confirmed_at: Date,
  confirmed_method: { type: String, enum: ['QR_SCAN', 'MANUAL_CONFIRM', 'IVR_CONFIRM'] },
  shift_end_confirmed_at: Date,
  no_show_reported_at: Date,
  no_show_reported_by: { type: String, enum: ['EMPLOYER', 'WORKER', 'SYSTEM'] },
  cancellation_reason: String,
  worker_rating_id: { type: Schema.Types.ObjectId, ref: 'RatingWorker' },
  employer_rating_id: { type: Schema.Types.ObjectId, ref: 'RatingEmployer' },
  placement_fee_charged: Number,
  placement_fee_paid: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at' } });

matchSchema.index({ job_id: 1 });
matchSchema.index({ worker_id: 1, matched_at: -1 });
matchSchema.index({ employer_id: 1, status: 1 });

export const Match = model<IMatch>('Match', matchSchema);
