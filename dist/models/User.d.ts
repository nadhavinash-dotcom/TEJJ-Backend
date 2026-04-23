import { Document } from 'mongoose';
export interface IUser extends Document {
    phone_number: string;
    firebase_uid: string;
    language: string;
    has_worker: boolean;
    has_employer: boolean;
    active_role?: 'worker' | 'employer';
    fcm_token?: string;
    notification_permission: string;
    last_active?: Date;
    device_type?: string;
    app_version?: string;
    created_at: Date;
    updated_at: Date;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map