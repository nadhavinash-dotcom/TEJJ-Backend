import { Schema, Document } from 'mongoose';
export interface IJobTemplate extends Document {
    employer_id: Schema.Types.ObjectId;
    template_name: string;
    lane: number;
    primary_skill: string;
    job_title: string;
    pay_rate?: number;
    shift_duration_hours?: number;
    killer_questions: unknown[];
    special_instructions?: string;
    usage_count: number;
    last_used_at?: Date;
    created_at: Date;
}
export declare const JobTemplate: import("mongoose").Model<IJobTemplate, {}, {}, {}, Document<unknown, {}, IJobTemplate, {}, {}> & IJobTemplate & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=JobTemplate.d.ts.map