"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Employer_1 = require("../models/Employer");
const User_1 = require("../models/User");
const utils_1 = require("@tejj/utils");
const router = (0, express_1.Router)();
// GET /employers/me
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId }).lean();
    if (!employer) {
        res.status(404).json({ success: false, error: 'Employer profile not found' });
        return;
    }
    res.json({ success: true, data: employer });
});
// POST /employers — Create employer profile
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const existing = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (existing) {
        res.status(409).json({ success: false, error: 'Employer profile already exists' });
        return;
    }
    const employer = await Employer_1.Employer.create({
        user_id: req.user.userId,
        ...req.body,
        plan: 'FLASH_FREE',
        monthly_post_limit: 3,
        dignity_score: 4.0,
        dignity_state: 'NEW',
    });
    await User_1.User.updateOne({ _id: req.user.userId }, { $set: { has_employer: true, active_role: 'employer' } });
    res.status(201).json({ success: true, data: { employer_id: employer._id } });
});
// PATCH /employers/me — Update employer profile
router.patch('/me', auth_1.authMiddleware, async (req, res) => {
    const updates = req.body;
    delete updates.dignity_score;
    delete updates.plan;
    delete updates.posts_this_month;
    const employer = await Employer_1.Employer.findOneAndUpdate({ user_id: req.user.userId }, { $set: updates }, { new: true });
    if (!employer) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
    }
    res.json({ success: true, data: employer });
});
// POST /employers/me/upgrade-plan — Change subscription plan
router.post('/me/upgrade-plan', auth_1.authMiddleware, async (req, res) => {
    const { plan } = req.body;
    const validPlans = Object.keys(utils_1.EMPLOYER_PLANS);
    if (!validPlans.includes(plan)) {
        res.status(400).json({ success: false, error: 'Invalid plan' });
        return;
    }
    const planConfig = utils_1.EMPLOYER_PLANS[plan];
    const monthly_post_limit = planConfig.price === 0 ? 3 : (plan === 'PRO' ? -1 : planConfig.post_limit);
    const featureGates = {
        cream_pool_access: ['GROWTH', 'PRO', 'ENTERPRISE'].includes(plan),
        analytics_access: ['GROWTH', 'PRO', 'ENTERPRISE'].includes(plan),
        interview_scheduler_access: ['STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'].includes(plan),
        agent_recruiter_access: ['PRO', 'ENTERPRISE'].includes(plan),
        demo_post_access: ['GROWTH', 'PRO', 'ENTERPRISE'].includes(plan),
        multi_property_access: ['PRO', 'ENTERPRISE'].includes(plan),
        database_search_access: ['GROWTH', 'PRO', 'ENTERPRISE'].includes(plan),
        database_unlocks_remaining: plan === 'GROWTH' ? 100 : plan === 'PRO' ? 500 : 0,
    };
    await Employer_1.Employer.updateOne({ user_id: req.user.userId }, { $set: { plan, monthly_post_limit, plan_started_at: new Date(), ...featureGates } });
    res.json({ success: true, message: `Plan upgraded to ${plan}` });
});
// GET /employers/:id/public — Public employer profile (for job detail)
router.get('/:id/public', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findById(req.params.id)
        .select('property_type property_segment area_locality dignity_score dignity_state worker_return_rate gstin_verified meals_provided uniform_provided transport_provided brand_affiliation')
        .lean();
    if (!employer) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
    }
    res.json({ success: true, data: employer });
});
exports.default = router;
//# sourceMappingURL=employers.js.map