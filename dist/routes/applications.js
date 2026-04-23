"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Application_1 = require("../models/Application");
const Worker_1 = require("../models/Worker");
const Employer_1 = require("../models/Employer");
const Job_1 = require("../models/Job");
const dispatchService_1 = require("../services/dispatchService");
const router = (0, express_1.Router)();
// POST /applications — Worker applies to job
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const worker = await Worker_1.Worker.findOne({ user_id: req.user.userId });
    if (!worker) {
        res.status(403).json({ success: false, error: 'No worker profile' });
        return;
    }
    const { job_id, killer_answers } = req.body;
    const job = await Job_1.Job.findById(job_id);
    if (!job || job.status !== 'BROADCASTING') {
        res.status(400).json({ success: false, error: 'Job not available' });
        return;
    }
    const existing = await Application_1.Application.findOne({ job_id, worker_id: worker._id });
    if (existing) {
        res.status(409).json({ success: false, error: 'Already applied' });
        return;
    }
    const sups_score = await (0, dispatchService_1.computeSUPS)(worker._id.toString(), job_id);
    const application = await Application_1.Application.create({
        job_id,
        worker_id: worker._id,
        employer_id: job.employer_id,
        killer_answers: killer_answers || [],
        sups_at_apply: sups_score,
        status: 'APPLIED',
    });
    res.status(201).json({ success: true, data: { application_id: application._id } });
});
// GET /applications/my — Worker's own applications
router.get('/my', auth_1.authMiddleware, async (req, res) => {
    const worker = await Worker_1.Worker.findOne({ user_id: req.user.userId });
    if (!worker) {
        res.status(403).json({ success: false, error: 'No worker profile' });
        return;
    }
    const { status, page = 1, limit = 20 } = req.query;
    const query = { worker_id: worker._id };
    if (status)
        query.status = status;
    const applications = await Application_1.Application.find(query)
        .populate('job_id', 'job_title primary_skill shift_start_time shift_duration_hours pay_rate lane status')
        .sort({ applied_at: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();
    res.json({ success: true, data: applications });
});
// GET /applications/job/:jobId — Employer views applicants
router.get('/job/:jobId', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    const { sort = 'sups_at_apply', page = 1, limit = 20 } = req.query;
    const applications = await Application_1.Application.find({ job_id: req.params.jobId, employer_id: employer._id })
        .populate('worker_id', 'full_name profile_photo_url primary_skill years_experience ai_score trust_score total_confirmed_arrivals city')
        .sort({ [sort]: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();
    res.json({ success: true, data: applications });
});
// PATCH /applications/:id/status — Employer shortlists/rejects
router.patch('/:id/status', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    const { status } = req.body;
    const allowed = ['SHORTLISTED', 'NOT_PROCEEDED', 'INTERVIEW_SCHEDULED', 'OFFER_MADE', 'HIRED', 'WITHDRAWN'];
    if (!allowed.includes(status)) {
        res.status(400).json({ success: false, error: 'Invalid status' });
        return;
    }
    const application = await Application_1.Application.findOneAndUpdate({ _id: req.params.id, employer_id: employer._id }, { $set: { status } }, { new: true });
    if (!application) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
    }
    res.json({ success: true, data: application });
});
exports.default = router;
//# sourceMappingURL=applications.js.map