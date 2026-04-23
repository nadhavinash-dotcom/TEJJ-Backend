import { Schema, model, Document } from 'mongoose';

export interface ISupsPrediction extends Document {
  worker_id: Schema.Types.ObjectId;
  job_id: Schema.Types.ObjectId;
  score: number;
  features_snapshot: Record<string, unknown>;
  predicted_at: Date;
  model_version: string;
}

const supsPredictionSchema = new Schema<ISupsPrediction>({
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  features_snapshot: Schema.Types.Mixed,
  predicted_at: { type: Date, default: Date.now },
  model_version: { type: String, default: 'v1-mock' },
});

supsPredictionSchema.index({ worker_id: 1, job_id: 1 });

export const SupsPrediction = model<ISupsPrediction>('SupsPrediction', supsPredictionSchema);
