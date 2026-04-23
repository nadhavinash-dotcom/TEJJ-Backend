import { Schema, Document } from 'mongoose';
export interface IPlatformEvent extends Document {
    user_id?: Schema.Types.ObjectId;
    worker_id?: Schema.Types.ObjectId;
    employer_id?: Schema.Types.ObjectId;
    event_type: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    created_at: Date;
}
export declare const PlatformEvent: import("mongoose").Model<IPlatformEvent, {}, {}, {}, Document<unknown, {}, IPlatformEvent, {}, {}> & IPlatformEvent & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PlatformEvent.d.ts.map