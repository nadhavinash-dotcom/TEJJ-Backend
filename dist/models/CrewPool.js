"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewPool = void 0;
const mongoose_1 = require("mongoose");
const crewPoolSchema = new mongoose_1.Schema({
    employer_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employer', required: true },
    pool_name: { type: String, required: true },
    description: { type: String, maxlength: 200 },
}, { timestamps: { createdAt: 'created_at' } });
exports.CrewPool = (0, mongoose_1.model)('CrewPool', crewPoolSchema);
//# sourceMappingURL=CrewPool.js.map