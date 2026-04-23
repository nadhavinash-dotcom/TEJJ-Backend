"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = require("mongoose");
const applicationSchema = new mongoose_1.Schema({
    job_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    applied_at: { type: Date, default: Date.now },
    killer_answers: [{ question_id: String, answer: String }],
    status: {
        type: String, default: 'APPLIED',
        enum: ['APPLIED', 'SHORTLISTED', 'MATCHED', 'INTERVIEW_SCHEDULED', 'DEMO_SCHEDULED',
            'OFFER_MADE', 'HIRED', 'NOT_PROCEEDED', 'NO_SHOW_INTERVIEW', 'EXPIRED', 'WITHDRAWN']
    },
    distance_at_apply: Number,
    sups_at_apply: Number,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
applicationSchema.index({ job_id: 1, worker_id: 1 }, { unique: true });
applicationSchema.index({ worker_id: 1, status: 1 });
applicationSchema.index({ job_id: 1, status: 1 });
exports.Application = (0, mongoose_1.model)('Application', applicationSchema);
//# sourceMappingURL=Application.js.map