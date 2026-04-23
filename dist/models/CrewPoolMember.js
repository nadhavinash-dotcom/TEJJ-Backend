"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewPoolMember = void 0;
const mongoose_1 = require("mongoose");
const crewPoolMemberSchema = new mongoose_1.Schema({
    pool_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CrewPool', required: true },
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    added_at: { type: Date, default: Date.now },
    added_reason: String,
    is_active: { type: Boolean, default: true },
});
crewPoolMemberSchema.index({ pool_id: 1, worker_id: 1 }, { unique: true });
exports.CrewPoolMember = (0, mongoose_1.model)('CrewPoolMember', crewPoolMemberSchema);
//# sourceMappingURL=CrewPoolMember.js.map