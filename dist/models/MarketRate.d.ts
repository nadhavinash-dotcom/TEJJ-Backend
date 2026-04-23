import { Document } from 'mongoose';
export interface IMarketRate extends Document {
    city: string;
    skill: string;
    median: number;
    p25: number;
    p75: number;
    updated_at: Date;
}
export declare const MarketRate: import("mongoose").Model<IMarketRate, {}, {}, {}, Document<unknown, {}, IMarketRate, {}, {}> & IMarketRate & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MarketRate.d.ts.map