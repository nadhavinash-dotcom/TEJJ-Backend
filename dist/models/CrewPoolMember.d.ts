import { Schema, Document } from 'mongoose';
export interface ICrewPoolMember extends Document {
    pool_id: Schema.Types.ObjectId;
    worker_id: Schema.Types.ObjectId;
    added_at: Date;
    added_reason?: string;
    is_active: boolean;
}
export declare const CrewPoolMember: import("mongoose").Model<ICrewPoolMember, {}, {}, {}, Document<unknown, {}, ICrewPoolMember, {}, {}> & ICrewPoolMember & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CrewPoolMember.d.ts.map