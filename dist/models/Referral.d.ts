import { Schema, Document } from 'mongoose';
export interface IReferral extends Document {
    referrer_worker_id: Schema.Types.ObjectId;
    referred_worker_id?: Schema.Types.ObjectId;
    referral_code_used: string;
    referred_at: Date;
    first_arrival_at?: Date;
    status: string;
    referrer_credit: number;
    referred_bonus: number;
    paid_at?: Date;
}
export declare const Referral: import("mongoose").Model<IReferral, {}, {}, {}, Document<unknown, {}, IReferral, {}, {}> & IReferral & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Referral.d.ts.map