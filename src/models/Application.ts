import { Schema, model, Document } from 'mongoose';

export interface IApplication extends Document {
  job_id: Schema.Types.ObjectId;
  worker_id: Schema.Types.ObjectId;
  employer_id: Schema.Types.ObjectId;
  applied_at: Date;
  killer_answers: Array<{ question_id: string; answer: string }>;
  status: string;
  distance_at_apply?: number;
  sups_at_apply?: number;
  created_at: Date;
  updated_at: Date;
}

const applicationSchema = new Schema<IApplication>({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  applied_at: { type: Date, default: Date.now },
  killer_answers: [{ question_id: String, answer: String }],
  status: {
    type: String, default: 'APPLIED',
    enum: ['APPLIED', 'SHORTLISTED', 'MATCHED', 'INTERVIEW_SCHEDULED', 'DEMO_SCHEDULED',
           'OFFER_MADE', 'HIRED', 'NOT_PROCEEDED', 'NO_SHOW_INTERVIEW', 'EXPIRED', 'WITHDRAWN']
  },
  distance_at_apply: Number,
  sups_at_apply: Number,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

applicationSchema.index({ job_id: 1, worker_id: 1 }, { unique: true });
applicationSchema.index({ worker_id: 1, status: 1 });
applicationSchema.index({ job_id: 1, status: 1 });

export const Application = model<IApplication>('Application', applicationSchema);
