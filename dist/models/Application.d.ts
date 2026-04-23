import { Schema, Document } from 'mongoose';
export interface IApplication extends Document {
    job_id: Schema.Types.ObjectId;
    worker_id: Schema.Types.ObjectId;
    employer_id: Schema.Types.ObjectId;
    applied_at: Date;
    killer_answers: Array<{
        question_id: string;
        answer: string;
    }>;
    status: string;
    distance_at_apply?: number;
    sups_at_apply?: number;
    created_at: Date;
    updated_at: Date;
}
export declare const Application: import("mongoose").Model<IApplication, {}, {}, {}, Document<unknown, {}, IApplication, {}, {}> & IApplication & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Application.d.ts.map