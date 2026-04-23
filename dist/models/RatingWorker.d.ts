import { Schema, Document } from 'mongoose';
export interface IRatingWorker extends Document {
    match_id: Schema.Types.ObjectId;
    worker_id: Schema.Types.ObjectId;
    employer_id: Schema.Types.ObjectId;
    overall_score: number;
    skill_match?: number;
    punctuality?: number;
    professionalism?: number;
    would_rehire?: boolean;
    on_time?: boolean;
    private_note?: string;
    created_at: Date;
}
export declare const RatingWorker: import("mongoose").Model<IRatingWorker, {}, {}, {}, Document<unknown, {}, IRatingWorker, {}, {}> & IRatingWorker & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RatingWorker.d.ts.map