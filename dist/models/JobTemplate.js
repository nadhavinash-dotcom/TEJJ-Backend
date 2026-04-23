"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobTemplate = void 0;
const mongoose_1 = require("mongoose");
const jobTemplateSchema = new mongoose_1.Schema({
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    template_name: { type: String, required: true },
    lane: { type: Number, enum: [1, 2, 3, 4] },
    primary_skill: { type: String, required: true },
    job_title: { type: String, required: true },
    pay_rate: Number,
    shift_duration_hours: Number,
    killer_questions: [mongoose_1.Schema.Types.Mixed],
    special_instructions: String,
    usage_count: { type: Number, default: 0 },
    last_used_at: Date,
}, { timestamps: { createdAt: 'created_at' } });
exports.JobTemplate = (0, mongoose_1.model)('JobTemplate', jobTemplateSchema);
//# sourceMappingURL=JobTemplate.js.map