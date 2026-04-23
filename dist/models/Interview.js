"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interview = void 0;
const mongoose_1 = require("mongoose");
const interviewSchema = new mongoose_1.Schema({
    application_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Application', required: true },
    job_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    scheduled_date: { type: Date, required: true },
    scheduled_time: { type: String, required: true },
    interview_type: { type: String, enum: ['In-Person', 'Video Call'], required: true },
    location_or_link: String,
    interviewer_name: String,
    pre_interview_brief: { type: String, maxlength: 500 },
    ics_url: String,
    status: {
        type: String, default: 'SCHEDULED',
        enum: ['SCHEDULED', 'COMPLETED', 'NO_SHOW_CANDIDATE', 'NO_SHOW_EMPLOYER', 'RESCHEDULED', 'CANCELLED']
    },
    reminder_24h_sent: { type: Boolean, default: false },
    reminder_2h_sent: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at' } });
exports.Interview = (0, mongoose_1.model)('Interview', interviewSchema);
//# sourceMappingURL=Interview.js.map