import { Schema, model, Document } from 'mongoose';

export interface IWhisperPost extends Document {
  worker_id_hash: string;
  employer_locality: string;
  employer_type: string;
  category: string;
  content: string;
  original_language?: string;
  transcribed_english?: string;
  status: string;
  helpful_count: number;
  created_at: Date;
}

const whisperPostSchema = new Schema<IWhisperPost>({
  worker_id_hash: { type: String, required: true },
  employer_locality: { type: String, required: true, maxlength: 60 },
  employer_type: { type: String, required: true, maxlength: 50 },
  category: {
    type: String, required: true,
    enum: ['UNPAID_WAGES', 'ABUSIVE_BEHAVIOUR', 'FAKE_JOB_POST', 'UNSAFE_CONDITIONS', 'OTHER']
  },
  content: { type: String, required: true, maxlength: 300 },
  original_language: String,
  transcribed_english: String,
  status: { type: String, default: 'PENDING_REVIEW', enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REMOVED'] },
  helpful_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at' } });

whisperPostSchema.index({ status: 1, created_at: -1 });

export const WhisperPost = model<IWhisperPost>('WhisperPost', whisperPostSchema);
