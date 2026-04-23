import { Schema, model, Document } from 'mongoose';

export interface IMarketRate extends Document {
  city: string;
  skill: string;
  median: number;
  p25: number;
  p75: number;
  updated_at: Date;
}

const marketRateSchema = new Schema<IMarketRate>({
  city: { type: String, required: true },
  skill: { type: String, required: true },
  median: { type: Number, required: true },
  p25: { type: Number, required: true },
  p75: { type: Number, required: true },
}, { timestamps: { updatedAt: 'updated_at' } });

marketRateSchema.index({ city: 1, skill: 1 }, { unique: true });

export const MarketRate = model<IMarketRate>('MarketRate', marketRateSchema);
