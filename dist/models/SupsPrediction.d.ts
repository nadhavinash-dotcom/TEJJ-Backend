import { Schema, Document } from 'mongoose';
export interface ISupsPrediction extends Document {
    worker_id: Schema.Types.ObjectId;
    job_id: Schema.Types.ObjectId;
    score: number;
    features_snapshot: Record<string, unknown>;
    predicted_at: Date;
    model_version: string;
}
export declare const SupsPrediction: import("mongoose").Model<ISupsPrediction, {}, {}, {}, Document<unknown, {}, ISupsPrediction, {}, {}> & ISupsPrediction & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=SupsPrediction.d.ts.map