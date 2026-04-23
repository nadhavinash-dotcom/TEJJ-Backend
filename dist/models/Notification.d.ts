import { Schema, Document } from 'mongoose';
export interface INotification extends Document {
    user_id: Schema.Types.ObjectId;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    read: boolean;
    read_at?: Date;
    deep_link?: string;
    created_at: Date;
}
export declare const Notification: import("mongoose").Model<INotification, {}, {}, {}, Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map