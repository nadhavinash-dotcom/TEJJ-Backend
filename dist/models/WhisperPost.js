"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhisperPost = void 0;
const mongoose_1 = require("mongoose");
const whisperPostSchema = new mongoose_1.Schema({
    worker_id_hash: { type: String, required: true },
    employer_locality: { type: String, required: true, maxlength: 60 },
    employer_type: { type: String, required: true, maxlength: 50 },
    category: {
        type: String, required: true,
        enum: ['UNPAID_WAGES', 'ABUSIVE_BEHAVIOUR', 'FAKE_JOB_POST', 'UNSAFE_CONDITIONS', 'OTHER']
    },
    content: { type: String, required: true, maxlength: 300 },
    original_language: String,
    transcribed_english: String,
    status: { type: String, default: 'PENDING_REVIEW', enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REMOVED'] },
    helpful_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at' } });
whisperPostSchema.index({ status: 1, created_at: -1 });
exports.WhisperPost = (0, mongoose_1.model)('WhisperPost', whisperPostSchema);
//# sourceMappingURL=WhisperPost.js.map