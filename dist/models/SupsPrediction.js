"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupsPrediction = void 0;
const mongoose_1 = require("mongoose");
const supsPredictionSchema = new mongoose_1.Schema({
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    job_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    features_snapshot: mongoose_1.Schema.Types.Mixed,
    predicted_at: { type: Date, default: Date.now },
    model_version: { type: String, default: 'v1-mock' },
});
supsPredictionSchema.index({ worker_id: 1, job_id: 1 });
exports.SupsPrediction = (0, mongoose_1.model)('SupsPrediction', supsPredictionSchema);
//# sourceMappingURL=SupsPrediction.js.map