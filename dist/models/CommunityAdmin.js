"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityAdmin = void 0;
const mongoose_1 = require("mongoose");
const communityAdminSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker' },
    group_name: { type: String, required: true },
    group_member_count: { type: Number, default: 0 },
    dominant_skill: String,
    city: { type: String, required: true },
    area_locality: String,
    partnership_tier: { type: String, default: 'C', enum: ['A', 'B', 'C'] },
    referral_rate: { type: Number, default: 25.0 },
    total_referrals: { type: Number, default: 0 },
    total_successful_onboardings: { type: Number, default: 0 },
    total_earnings_paid: { type: Number, default: 0 },
    status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'CHURNED', 'BLOCKED'] },
    notes: String,
}, { timestamps: { createdAt: 'created_at' } });
exports.CommunityAdmin = (0, mongoose_1.model)('CommunityAdmin', communityAdminSchema);
//# sourceMappingURL=CommunityAdmin.js.map