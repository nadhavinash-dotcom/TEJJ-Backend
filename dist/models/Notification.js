"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String, required: true,
        enum: ['FLASH_JOB', 'MATCH_CONFIRMED', 'ARRIVAL_REMINDER', 'RATE_REQUEST', 'INSURANCE_UPDATE',
            'LOAN_UPDATE', 'TRUST_SCORE_CHANGE', 'INTERVIEW_SCHEDULED', 'SYSTEM']
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: mongoose_1.Schema.Types.Mixed,
    read: { type: Boolean, default: false },
    read_at: Date,
    deep_link: String,
}, { timestamps: { createdAt: 'created_at' } });
notificationSchema.index({ user_id: 1, read: 1, created_at: -1 });
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
//# sourceMappingURL=Notification.js.map