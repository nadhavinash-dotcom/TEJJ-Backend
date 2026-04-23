"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = require("mongoose");
const geoPointSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
}, { _id: false });
const killerQuestionSchema = new mongoose_1.Schema({
    question: String,
    answer_type: { type: String, enum: ['YES_NO', 'TEXT', 'CHOICE'] },
    required: Boolean,
    choices: [String],
}, { _id: false });
const jobSchema = new mongoose_1.Schema({
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    lane: { type: Number, required: true, enum: [1, 2, 3, 4] },
    is_demo_post: { type: Boolean, default: false },
    job_title: { type: String, required: true },
    job_description: String,
    primary_skill: { type: String, required: true },
    secondary_skills_preferred: [String],
    cuisine_preferred: [String],
    pay_rate: Number,
    pay_type: { type: String, default: 'PER_SHIFT', enum: ['PER_SHIFT', 'DAILY', 'MONTHLY', 'ANNUAL'] },
    pay_min: Number,
    pay_max: Number,
    shift_start_time: Date,
    shift_end_time: Date,
    shift_duration_hours: Number,
    number_of_openings: { type: Number, default: 1 },
    openings_filled: { type: Number, default: 0 },
    geofence_radius_m: { type: Number, default: 10000 },
    location: { type: geoPointSchema, index: '2dsphere' },
    uniform_required: String,
    experience_years_min: Number,
    minimum_qualification: String,
    killer_questions: [killerQuestionSchema],
    special_instructions: String,
    accommodation_provided: { type: Boolean, default: false },
    meals_provided: { type: Boolean, default: false },
    transport_provided: { type: Boolean, default: false },
    contract_start_date: Date,
    contract_duration: String,
    notice_period_max_days: Number,
    interview_required: { type: Boolean, default: false },
    interview_format: { type: String, enum: ['In-Person', 'Video Call', 'Both'] },
    cream_pool_first: { type: Boolean, default: false },
    status: { type: String, default: 'BROADCASTING', enum: ['DRAFT', 'BROADCASTING', 'MATCHED', 'PARTIALLY_FILLED', 'FILLED', 'EXPIRED', 'CANCELLED', 'PAUSED'] },
    expires_at: Date,
    template_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'JobTemplate' },
    boost_active: { type: Boolean, default: false },
    boost_count: { type: Number, default: 0 },
    pay_vs_market: Number,
    demo_evaluation_criteria: [String],
    demo_hiring_standard: String,
    demo_fulltime_salary: Number,
    demo_conversion_count: { type: Number, default: 0 },
    keywords_extracted: [String],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ status: 1, lane: 1, created_at: -1 });
jobSchema.index({ employer_id: 1 });
jobSchema.index({ primary_skill: 1, status: 1 });
jobSchema.index({ expires_at: 1 });
exports.Job = (0, mongoose_1.model)('Job', jobSchema);
//# sourceMappingURL=Job.js.map