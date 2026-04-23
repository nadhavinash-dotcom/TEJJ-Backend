"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingEmployer = void 0;
const mongoose_1 = require("mongoose");
const ratingEmployerSchema = new mongoose_1.Schema({
    match_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    worker_id_hash: { type: String, required: true },
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    overall_score: { type: Number, required: true, min: 1, max: 5 },
    pay_on_time: Boolean,
    respectful_treatment: Boolean,
    would_return: Boolean,
    private_note: { type: String, maxlength: 200 },
}, { timestamps: { createdAt: 'created_at' } });
ratingEmployerSchema.index({ employer_id: 1, created_at: -1 });
exports.RatingEmployer = (0, mongoose_1.model)('RatingEmployer', ratingEmployerSchema);
//# sourceMappingURL=RatingEmployer.js.map