"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformEvent = void 0;
const mongoose_1 = require("mongoose");
const platformEventSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker' },
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer' },
    event_type: { type: String, required: true },
    metadata: mongoose_1.Schema.Types.Mixed,
    ip_address: String,
}, { timestamps: { createdAt: 'created_at' } });
platformEventSchema.index({ user_id: 1, created_at: -1 });
platformEventSchema.index({ event_type: 1, created_at: -1 });
exports.PlatformEvent = (0, mongoose_1.model)('PlatformEvent', platformEventSchema);
//# sourceMappingURL=PlatformEvent.js.map