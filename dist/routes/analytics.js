"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const Match_1 = require("../models/Match");
const Job_1 = require("../models/Job");
const RatingWorker_1 = require("../models/RatingWorker");
const Employer_1 = require("../models/Employer");
const User_1 = require("../models/User");
const Worker_1 = require("../models/Worker");
const router = (0, express_1.Router)();
// GET /analytics/employer — employer analytics dashboard
router.get('/employer', auth_1.authMiddleware, async (req, res) => {
    try {
        const uid = req.uid;
        const user = await User_1.User.findOne({ firebase_uid: uid });
        if (!user)
            return res.status(404).json({ success: false });
        const employer = await Employer_1.Employer.findOne({ user_id: user._id });
        if (!employer)
            return res.status(404).json({ success: false });
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [jobsPosted, matches, ratings] = await Promise.all([
            Job_1.Job.countDocuments({ employer_id: employer._id, created_at: { $gte: thirtyDaysAgo } }),
            Match_1.Match.find({ employer_id: employer._id, matched_at: { $gte: thirtyDaysAgo } }),
            RatingWorker_1.RatingWorker.find({ employer_id: employer._id, created_at: { $gte: thirtyDaysAgo } }),
        ]);
        const arrivedMatches = matches.filter((m) => m.status === 'ARRIVED' || m.status === 'COMPLETED');
        const showUpRate = matches.length > 0 ? (arrivedMatches.length / matches.length) * 100 : 0;
        const matchesToday = matches.filter((m) => {
            const today = new Date();
            return m.matched_at.toDateString() === today.toDateString();
        }).length;
        // Average fill time
        const filledJobs = await Job_1.Job.find({ employer_id: employer._id, status: 'FILLED', created_at: { $gte: thirtyDaysAgo } });
        const avgFillMs = filledJobs.length > 0
            ? filledJobs.reduce((acc, j) => acc + (j.updated_at.getTime() - j.created_at.getTime()), 0) / filledJobs.length
            : 0;
        // Skill breakdown
        const skillMap = {};
        matches.forEach((m) => { if (m.primary_skill)
            skillMap[m.primary_skill] = (skillMap[m.primary_skill] ?? 0) + 1; });
        const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([skill, count]) => ({ skill, matches: count }));
        res.json({
            success: true,
            data: {
                jobs_posted: jobsPosted,
                total_matches: matches.length,
                matches_today: matchesToday,
                show_up_rate: showUpRate,
                avg_fill_time_mins: Math.round(avgFillMs / 60000),
                dignity_score: employer.dignity_score ?? 0,
                repeat_workers: 0,
                top_skills: topSkills,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /analytics/platform — admin platform analytics
router.get('/platform', auth_2.adminAuthMiddleware, async (_req, res) => {
    try {
        const [workers, employers, jobs, matches] = await Promise.all([
            Worker_1.Worker.countDocuments(),
            Employer_1.Employer.countDocuments(),
            Job_1.Job.countDocuments(),
            Match_1.Match.countDocuments(),
        ]);
        res.json({
            success: true,
            data: { total_workers: workers, total_employers: employers, total_jobs: jobs, total_matches: matches },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map