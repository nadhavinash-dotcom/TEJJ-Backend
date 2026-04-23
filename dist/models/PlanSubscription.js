"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSubscription = void 0;
const mongoose_1 = require("mongoose");
const planSubscriptionSchema = new mongoose_1.Schema({
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    payment_id: String,
    started_at: { type: Date, default: Date.now },
    expires_at: Date,
    status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'] },
}, { timestamps: { createdAt: 'created_at' } });
planSubscriptionSchema.index({ employer_id: 1, status: 1 });
exports.PlanSubscription = (0, mongoose_1.model)('PlanSubscription', planSubscriptionSchema);
//# sourceMappingURL=PlanSubscription.js.map