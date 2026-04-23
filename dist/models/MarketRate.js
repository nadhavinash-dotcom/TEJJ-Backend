"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketRate = void 0;
const mongoose_1 = require("mongoose");
const marketRateSchema = new mongoose_1.Schema({
    city: { type: String, required: true },
    skill: { type: String, required: true },
    median: { type: Number, required: true },
    p25: { type: Number, required: true },
    p75: { type: Number, required: true },
}, { timestamps: { updatedAt: 'updated_at' } });
marketRateSchema.index({ city: 1, skill: 1 }, { unique: true });
exports.MarketRate = (0, mongoose_1.model)('MarketRate', marketRateSchema);
//# sourceMappingURL=MarketRate.js.map