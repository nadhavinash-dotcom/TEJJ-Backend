"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingWorker = void 0;
const mongoose_1 = require("mongoose");
const ratingWorkerSchema = new mongoose_1.Schema({
    match_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    overall_score: { type: Number, required: true, min: 1, max: 5 },
    skill_match: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    would_rehire: Boolean,
    on_time: Boolean,
    private_note: { type: String, maxlength: 200 },
}, { timestamps: { createdAt: 'created_at' } });
ratingWorkerSchema.index({ worker_id: 1, created_at: -1 });
exports.RatingWorker = (0, mongoose_1.model)('RatingWorker', ratingWorkerSchema);
//# sourceMappingURL=RatingWorker.js.map