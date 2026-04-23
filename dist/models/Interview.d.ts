import { Schema, Document } from 'mongoose';
export interface IInterview extends Document {
    application_id: Schema.Types.ObjectId;
    job_id: Schema.Types.ObjectId;
    employer_id: Schema.Types.ObjectId;
    worker_id: Schema.Types.ObjectId;
    scheduled_date: Date;
    scheduled_time: string;
    interview_type: string;
    location_or_link?: string;
    interviewer_name?: string;
    pre_interview_brief?: string;
    ics_url?: string;
    status: string;
    reminder_24h_sent: boolean;
    reminder_2h_sent: boolean;
    created_at: Date;
}
export declare const Interview: import("mongoose").Model<IInterview, {}, {}, {}, Document<unknown, {}, IInterview, {}, {}> & IInterview & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Interview.d.ts.map