import { Schema, model, Document } from 'mongoose';

export interface IDispatchEvent extends Document {
  job_id: Schema.Types.ObjectId;
  worker_id: Schema.Types.ObjectId;
  event_type: string;
  channel: string;
  sent_at: Date;
  responded_at?: Date;
  response_latency_seconds?: number;
}

const dispatchEventSchema = new Schema<IDispatchEvent>({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  event_type: { type: String, required: true, enum: ['PINGED', 'NOTIFIED_WHATSAPP', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'NO_RESPONSE'] },
  channel: { type: String, required: true, enum: ['PUSH', 'WHATSAPP', 'SMS'] },
  sent_at: { type: Date, default: Date.now },
  responded_at: Date,
  response_latency_seconds: Number,
});

dispatchEventSchema.index({ job_id: 1 });
dispatchEventSchema.index({ worker_id: 1, sent_at: -1 });

export const DispatchEvent = model<IDispatchEvent>('DispatchEvent', dispatchEventSchema);
