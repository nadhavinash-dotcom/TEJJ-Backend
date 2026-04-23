import { Schema, model, Document } from 'mongoose';

export interface IInterview extends Document {
  application_id: Schema.Types.ObjectId;
  job_id: Schema.Types.ObjectId;
  employer_id: Schema.Types.ObjectId;
  worker_id: Schema.Types.ObjectId;
  scheduled_date: Date;
  scheduled_time: string;
  interview_type: string;
  location_or_link?: string;
  interviewer_name?: string;
  pre_interview_brief?: string;
  ics_url?: string;
  status: string;
  reminder_24h_sent: boolean;
  reminder_2h_sent: boolean;
  created_at: Date;
}

const interviewSchema = new Schema<IInterview>({
  application_id: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  scheduled_date: { type: Date, required: true },
  scheduled_time: { type: String, required: true },
  interview_type: { type: String, enum: ['In-Person', 'Video Call'], required: true },
  location_or_link: String,
  interviewer_name: String,
  pre_interview_brief: { type: String, maxlength: 500 },
  ics_url: String,
  status: {
    type: String, default: 'SCHEDULED',
    enum: ['SCHEDULED', 'COMPLETED', 'NO_SHOW_CANDIDATE', 'NO_SHOW_EMPLOYER', 'RESCHEDULED', 'CANCELLED']
  },
  reminder_24h_sent: { type: Boolean, default: false },
  reminder_2h_sent: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at' } });

export const Interview = model<IInterview>('Interview', interviewSchema);
