import { Schema, model, Document } from 'mongoose';

export interface IRatingEmployer extends Document {
  match_id: Schema.Types.ObjectId;
  worker_id_hash: string;
  employer_id: Schema.Types.ObjectId;
  overall_score: number;
  pay_on_time?: boolean;
  respectful_treatment?: boolean;
  would_return?: boolean;
  private_note?: string;
  created_at: Date;
}

const ratingEmployerSchema = new Schema<IRatingEmployer>({
  match_id: { type: Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
  worker_id_hash: { type: String, required: true },
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  overall_score: { type: Number, required: true, min: 1, max: 5 },
  pay_on_time: Boolean,
  respectful_treatment: Boolean,
  would_return: Boolean,
  private_note: { type: String, maxlength: 200 },
}, { timestamps: { createdAt: 'created_at' } });

ratingEmployerSchema.index({ employer_id: 1, created_at: -1 });

export const RatingEmployer = model<IRatingEmployer>('RatingEmployer', ratingEmployerSchema);
