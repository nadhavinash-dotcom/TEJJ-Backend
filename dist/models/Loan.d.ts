import { Schema, Document } from 'mongoose';
export interface ILoan extends Document {
    worker_id: Schema.Types.ObjectId;
    retain_enrollment_id: Schema.Types.ObjectId;
    loan_amount: number;
    emi_total: number;
    emi_employer_contribution: number;
    emi_worker: number;
    disbursement_date?: Date;
    loan_partner: string;
    status: string;
    created_at: Date;
}
export declare const Loan: import("mongoose").Model<ILoan, {}, {}, {}, Document<unknown, {}, ILoan, {}, {}> & ILoan & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Loan.d.ts.map