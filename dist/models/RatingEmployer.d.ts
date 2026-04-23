import { Schema, Document } from 'mongoose';
export interface IRatingEmployer extends Document {
    match_id: Schema.Types.ObjectId;
    worker_id_hash: string;
    employer_id: Schema.Types.ObjectId;
    overall_score: number;
    pay_on_time?: boolean;
    respectful_treatment?: boolean;
    would_return?: boolean;
    private_note?: string;
    created_at: Date;
}
export declare const RatingEmployer: import("mongoose").Model<IRatingEmployer, {}, {}, {}, Document<unknown, {}, IRatingEmployer, {}, {}> & IRatingEmployer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RatingEmployer.d.ts.map