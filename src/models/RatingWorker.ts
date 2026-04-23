import { Schema, model, Document } from 'mongoose';

export interface IRatingWorker extends Document {
  match_id: Schema.Types.ObjectId;
  worker_id: Schema.Types.ObjectId;
  employer_id: Schema.Types.ObjectId;
  overall_score: number;
  skill_match?: number;
  punctuality?: number;
  professionalism?: number;
  would_rehire?: boolean;
  on_time?: boolean;
  private_note?: string;
  created_at: Date;
}

const ratingWorkerSchema = new Schema<IRatingWorker>({
  match_id: { type: Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  overall_score: { type: Number, required: true, min: 1, max: 5 },
  skill_match: { type: Number, min: 1, max: 5 },
  punctuality: { type: Number, min: 1, max: 5 },
  professionalism: { type: Number, min: 1, max: 5 },
  would_rehire: Boolean,
  on_time: Boolean,
  private_note: { type: String, maxlength: 200 },
}, { timestamps: { createdAt: 'created_at' } });

ratingWorkerSchema.index({ worker_id: 1, created_at: -1 });

export const RatingWorker = model<IRatingWorker>('RatingWorker', ratingWorkerSchema);
