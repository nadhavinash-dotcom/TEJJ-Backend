"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsurancePolicy = void 0;
const mongoose_1 = require("mongoose");
const insurancePolicySchema = new mongoose_1.Schema({
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    retain_enrollment_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RetainEnrollment', required: true },
    policy_number: { type: String, required: true, unique: true },
    provider: { type: String, default: 'Star Health' },
    cover_amount: { type: Number, default: 100000 },
    accident_cover: Number,
    opd_cover: Number,
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    card_url: String,
    active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at' } });
exports.InsurancePolicy = (0, mongoose_1.model)('InsurancePolicy', insurancePolicySchema);
//# sourceMappingURL=InsurancePolicy.js.map