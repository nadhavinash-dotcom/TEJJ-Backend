import { Schema, Document } from 'mongoose';
export interface ICrewPool extends Document {
    employer_id: Schema.Types.ObjectId;
    pool_name: string;
    description?: string;
    created_at: Date;
}
export declare const CrewPool: import("mongoose").Model<ICrewPool, {}, {}, {}, Document<unknown, {}, ICrewPool, {}, {}> & ICrewPool & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CrewPool.d.ts.map