"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Referral = void 0;
const mongoose_1 = require("mongoose");
const referralSchema = new mongoose_1.Schema({
    referrer_worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    referred_worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker' },
    referral_code_used: { type: String, required: true },
    referred_at: { type: Date, default: Date.now },
    first_arrival_at: Date,
    status: { type: String, default: 'PENDING', enum: ['PENDING', 'COMPLETED', 'EXPIRED'] },
    referrer_credit: { type: Number, default: 25 },
    referred_bonus: { type: Number, default: 50 },
    paid_at: Date,
});
exports.Referral = (0, mongoose_1.model)('Referral', referralSchema);
//# sourceMappingURL=Referral.js.map