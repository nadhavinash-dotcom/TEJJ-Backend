import { Schema, model, Document } from 'mongoose';

export interface IJobTemplate extends Document {
  employer_id: Schema.Types.ObjectId;
  template_name: string;
  lane: number;
  primary_skill: string;
  job_title: string;
  pay_rate?: number;
  shift_duration_hours?: number;
  killer_questions: unknown[];
  special_instructions?: string;
  usage_count: number;
  last_used_at?: Date;
  created_at: Date;
}

const jobTemplateSchema = new Schema<IJobTemplate>({
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  template_name: { type: String, required: true },
  lane: { type: Number, enum: [1, 2, 3, 4] },
  primary_skill: { type: String, required: true },
  job_title: { type: String, required: true },
  pay_rate: Number,
  shift_duration_hours: Number,
  killer_questions: [Schema.Types.Mixed],
  special_instructions: String,
  usage_count: { type: Number, default: 0 },
  last_used_at: Date,
}, { timestamps: { createdAt: 'created_at' } });

export const JobTemplate = model<IJobTemplate>('JobTemplate', jobTemplateSchema);
