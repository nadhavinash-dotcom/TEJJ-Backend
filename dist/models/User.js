"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    phone_number: { type: String, required: true, unique: true, trim: true },
    firebase_uid: { type: String, required: true, unique: true },
    language: { type: String, default: 'hi' },
    has_worker: { type: Boolean, default: false },
    has_employer: { type: Boolean, default: false },
    active_role: { type: String, enum: ['worker', 'employer'] },
    fcm_token: String,
    notification_permission: { type: String, default: 'PENDING', enum: ['GRANTED', 'DENIED', 'PENDING'] },
    last_active: Date,
    device_type: { type: String, enum: ['ANDROID', 'IOS', 'FEATURE_PHONE'] },
    app_version: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
exports.User = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.js.map