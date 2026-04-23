import { Schema, Document } from 'mongoose';
export interface IMatch extends Document {
    job_id: Schema.Types.ObjectId;
    worker_id: Schema.Types.ObjectId;
    employer_id: Schema.Types.ObjectId;
    matched_at: Date;
    match_method: string;
    worker_distance_m?: number;
    worker_sups_at_match?: number;
    worker_location_at_match?: {
        type: string;
        coordinates: [number, number];
    };
    status: string;
    arrived_at?: Date;
    confirmed_at?: Date;
    confirmed_method?: string;
    shift_end_confirmed_at?: Date;
    no_show_reported_at?: Date;
    no_show_reported_by?: string;
    cancellation_reason?: string;
    worker_rating_id?: Schema.Types.ObjectId;
    employer_rating_id?: Schema.Types.ObjectId;
    placement_fee_charged?: number;
    placement_fee_paid: boolean;
    created_at: Date;
}
export declare const Match: import("mongoose").Model<IMatch, {}, {}, {}, Document<unknown, {}, IMatch, {}, {}> & IMatch & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Match.d.ts.map