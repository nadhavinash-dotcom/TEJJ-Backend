import { Schema, Document } from 'mongoose';
export interface IRetainEnrollment extends Document {
    employer_id: Schema.Types.ObjectId;
    worker_id: Schema.Types.ObjectId;
    plan_tier: string;
    enrolled_at: Date;
    days_with_employer: number;
    insurance_active: boolean;
    insurance_activated_at?: Date;
    loan_eligible: boolean;
    loan_initiated: boolean;
    loan_amount?: number;
    loan_emi_employer?: number;
    status: string;
}
export declare const RetainEnrollment: import("mongoose").Model<IRetainEnrollment, {}, {}, {}, Document<unknown, {}, IRetainEnrollment, {}, {}> & IRetainEnrollment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RetainEnrollment.d.ts.map