import { Schema, Document } from 'mongoose';
export interface ICommunityAdmin extends Document {
    name: string;
    phone: string;
    worker_id?: Schema.Types.ObjectId;
    group_name: string;
    group_member_count: number;
    dominant_skill?: string;
    city: string;
    area_locality?: string;
    partnership_tier: string;
    referral_rate: number;
    total_referrals: number;
    total_successful_onboardings: number;
    total_earnings_paid: number;
    status: string;
    notes?: string;
    created_at: Date;
}
export declare const CommunityAdmin: import("mongoose").Model<ICommunityAdmin, {}, {}, {}, Document<unknown, {}, ICommunityAdmin, {}, {}> & ICommunityAdmin & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CommunityAdmin.d.ts.map