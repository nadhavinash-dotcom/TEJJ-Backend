import { Schema, model, Document } from 'mongoose';

export interface ICrewPool extends Document {
  employer_id: Schema.Types.ObjectId;
  pool_name: string;
  description?: string;
  created_at: Date;
}

const crewPoolSchema = new Schema<ICrewPool>({
  employer_id: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  pool_name: { type: String, required: true },
  description: { type: String, maxlength: 200 },
}, { timestamps: { createdAt: 'created_at' } });

export const CrewPool = model<ICrewPool>('CrewPool', crewPoolSchema);
