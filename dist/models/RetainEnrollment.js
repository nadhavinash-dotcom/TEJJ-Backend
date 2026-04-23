"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetainEnrollment = void 0;
const mongoose_1 = require("mongoose");
const retainEnrollmentSchema = new mongoose_1.Schema({
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    plan_tier: { type: String, required: true, enum: ['BASIC', 'PLUS', 'PREMIUM'] },
    enrolled_at: { type: Date, default: Date.now },
    days_with_employer: { type: Number, default: 0 },
    insurance_active: { type: Boolean, default: false },
    insurance_activated_at: Date,
    loan_eligible: { type: Boolean, default: false },
    loan_initiated: { type: Boolean, default: false },
    loan_amount: Number,
    loan_emi_employer: Number,
    status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'PAUSED', 'CANCELLED'] },
});
retainEnrollmentSchema.index({ employer_id: 1, worker_id: 1 });
exports.RetainEnrollment = (0, mongoose_1.model)('RetainEnrollment', retainEnrollmentSchema);
//# sourceMappingURL=RetainEnrollment.js.map