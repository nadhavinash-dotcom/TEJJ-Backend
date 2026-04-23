import { Schema, Document } from 'mongoose';
export interface IPlanSubscription extends Document {
    employer_id: Schema.Types.ObjectId;
    plan: string;
    amount: number;
    currency: string;
    payment_id?: string;
    started_at: Date;
    expires_at?: Date;
    status: string;
    created_at: Date;
}
export declare const PlanSubscription: import("mongoose").Model<IPlanSubscription, {}, {}, {}, Document<unknown, {}, IPlanSubscription, {}, {}> & IPlanSubscription & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PlanSubscription.d.ts.map