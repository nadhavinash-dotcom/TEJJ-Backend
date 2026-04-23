"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchEvent = void 0;
const mongoose_1 = require("mongoose");
const dispatchEventSchema = new mongoose_1.Schema({
    job_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    event_type: { type: String, required: true, enum: ['PINGED', 'NOTIFIED_WHATSAPP', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'NO_RESPONSE'] },
    channel: { type: String, required: true, enum: ['PUSH', 'WHATSAPP', 'SMS'] },
    sent_at: { type: Date, default: Date.now },
    responded_at: Date,
    response_latency_seconds: Number,
});
dispatchEventSchema.index({ job_id: 1 });
dispatchEventSchema.index({ worker_id: 1, sent_at: -1 });
exports.DispatchEvent = (0, mongoose_1.model)('DispatchEvent', dispatchEventSchema);
//# sourceMappingURL=DispatchEvent.js.map