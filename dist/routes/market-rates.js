"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const MarketRate_1 = require("../models/MarketRate");
const router = (0, express_1.Router)();
// GET /market-rates/:skill — get market rate for a skill
router.get('/:skill', auth_1.authMiddleware, async (req, res) => {
    try {
        const { skill } = req.params;
        const { city } = req.query;
        const query = { skill };
        if (city)
            query.city = city;
        const rate = await MarketRate_1.MarketRate.findOne(query).lean();
        if (!rate) {
            // Return defaults if no data
            return res.json({ success: true, data: { skill, median: 600, p25: 450, p75: 800 } });
        }
        res.json({ success: true, data: rate });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /market-rates — list all
router.get('/', auth_1.authMiddleware, async (_req, res) => {
    try {
        const rates = await MarketRate_1.MarketRate.find().lean();
        res.json({ success: true, data: rates });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /market-rates/:skill — admin upsert
router.put('/:skill', auth_2.adminAuthMiddleware, async (req, res) => {
    try {
        const { skill } = req.params;
        const { city = 'default', median, p25, p75 } = req.body;
        const rate = await MarketRate_1.MarketRate.findOneAndUpdate({ skill, city }, { $set: { median, p25, p75, updated_at: new Date() } }, { upsert: true, new: true });
        res.json({ success: true, data: rate });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=market-rates.js.map