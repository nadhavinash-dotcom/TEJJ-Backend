import { Schema, Document } from 'mongoose';
export interface IInsurancePolicy extends Document {
    worker_id: Schema.Types.ObjectId;
    retain_enrollment_id: Schema.Types.ObjectId;
    policy_number: string;
    provider: string;
    cover_amount: number;
    accident_cover?: number;
    opd_cover?: number;
    start_date: Date;
    end_date: Date;
    card_url?: string;
    active: boolean;
    created_at: Date;
}
export declare const InsurancePolicy: import("mongoose").Model<IInsurancePolicy, {}, {}, {}, Document<unknown, {}, IInsurancePolicy, {}, {}> & IInsurancePolicy & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=InsurancePolicy.d.ts.map