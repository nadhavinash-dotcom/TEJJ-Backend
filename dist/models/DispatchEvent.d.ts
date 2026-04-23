import { Schema, Document } from 'mongoose';
export interface IDispatchEvent extends Document {
    job_id: Schema.Types.ObjectId;
    worker_id: Schema.Types.ObjectId;
    event_type: string;
    channel: string;
    sent_at: Date;
    responded_at?: Date;
    response_latency_seconds?: number;
}
export declare const DispatchEvent: import("mongoose").Model<IDispatchEvent, {}, {}, {}, Document<unknown, {}, IDispatchEvent, {}, {}> & IDispatchEvent & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=DispatchEvent.d.ts.map