import { Schema, model, Document } from 'mongoose';

export interface ICrewPoolMember extends Document {
  pool_id: Schema.Types.ObjectId;
  worker_id: Schema.Types.ObjectId;
  added_at: Date;
  added_reason?: string;
  is_active: boolean;
}

const crewPoolMemberSchema = new Schema<ICrewPoolMember>({
  pool_id: { type: Schema.Types.ObjectId, ref: 'CrewPool', required: true },
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  added_at: { type: Date, default: Date.now },
  added_reason: String,
  is_active: { type: Boolean, default: true },
});

crewPoolMemberSchema.index({ pool_id: 1, worker_id: 1 }, { unique: true });

export const CrewPoolMember = model<ICrewPoolMember>('CrewPoolMember', crewPoolMemberSchema);
