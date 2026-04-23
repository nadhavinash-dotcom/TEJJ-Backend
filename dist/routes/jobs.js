"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Job_1 = require("../models/Job");
const Employer_1 = require("../models/Employer");
const Worker_1 = require("../models/Worker");
const MarketRate_1 = require("../models/MarketRate");
const dispatchService_1 = require("../services/dispatchService");
const router = (0, express_1.Router)();
// GET /jobs/feed — Worker job feed
router.get('/feed', auth_1.authMiddleware, async (req, res) => {
    const worker = await Worker_1.Worker.findOne({ user_id: req.user.userId });
    if (!worker?.home_location && !worker?.last_known_location) {
        res.status(400).json({ success: false, error: 'Worker location not set' });
        return;
    }
    const { lane, min_pay, max_distance_km = 15, page = 1, limit = 20 } = req.query;
    const workerCoords = (worker.last_known_location || worker.home_location).coordinates;
    const query = {
        status: 'BROADCASTING',
        primary_skill: worker.primary_skill,
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: workerCoords },
                $maxDistance: Number(max_distance_km) * 1000,
            },
        },
    };
    if (lane)
        query.lane = Number(lane);
    if (min_pay)
        query.pay_rate = { $gte: Number(min_pay) };
    if (worker.min_pay_per_shift) {
        query.pay_rate = { ...(query.pay_rate || {}), $gte: worker.min_pay_per_shift };
    }
    const jobs = await Job_1.Job.find(query)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();
    const employerIds = [...new Set(jobs.map(j => j.employer_id.toString()))];
    const employers = await Employer_1.Employer.find({ _id: { $in: employerIds } })
        .select('property_type area_locality dignity_score gstin_verified uniform_provided meals_provided dignity_state min_dignity_score')
        .lean();
    const employerMap = new Map(employers.map(e => [e._id.toString(), e]));
    const feed = await Promise.all(jobs.map(async (job) => {
        const employer = employerMap.get(job.employer_id.toString());
        if (!employer)
            return null;
        // Apply dignity gate
        if (employer.dignity_score < worker.min_dignity_score)
            return null;
        const [lng1, lat1] = workerCoords;
        const [lng2, lat2] = job.location?.coordinates ?? [0, 0];
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        const distance_km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const sups_score = await (0, dispatchService_1.computeSUPS)(worker._id.toString(), job._id.toString());
        const marketRate = await MarketRate_1.MarketRate.findOne({ city: worker.city, skill: job.primary_skill });
        const market_rate_delta = marketRate ? (job.pay_rate ?? 0) - marketRate.median : undefined;
        return {
            _id: job._id,
            job_title: job.job_title,
            primary_skill: job.primary_skill,
            pay_rate: job.pay_rate,
            pay_type: job.pay_type,
            shift_start_time: job.shift_start_time,
            shift_duration_hours: job.shift_duration_hours,
            number_of_openings: job.number_of_openings,
            openings_filled: job.openings_filled,
            lane: job.lane,
            expires_at: job.expires_at,
            distance_km: Math.round(distance_km * 10) / 10,
            sups_score,
            market_rate_delta,
            employer_property_type: employer.property_type,
            employer_area_locality: employer.area_locality,
            employer_dignity_score: employer.dignity_score,
            employer_gstin_verified: employer.gstin_verified,
        };
    }));
    res.json({ success: true, data: feed.filter(Boolean) });
});
// GET /jobs/:id — Job detail
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    const job = await Job_1.Job.findById(req.params.id).lean();
    if (!job) {
        res.status(404).json({ success: false, error: 'Job not found' });
        return;
    }
    const employer = await Employer_1.Employer.findById(job.employer_id)
        .select('-location_address -contact_name -contact_phone -entry_instructions -gstin')
        .lean();
    res.json({ success: true, data: { job, employer } });
});
// POST /jobs — Create job (employer)
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    if (employer.confirm_gate_blocked) {
        res.status(403).json({ success: false, error: 'Confirm gate blocked', confirm_gate_reason: employer.confirm_gate_reason });
        return;
    }
    if (employer.posts_this_month >= employer.monthly_post_limit && employer.monthly_post_limit !== -1) {
        res.status(403).json({ success: false, error: 'Monthly post limit reached' });
        return;
    }
    const jobData = {
        ...req.body,
        employer_id: employer._id,
        location: employer.location,
        status: 'BROADCASTING',
    };
    // Set expiry based on lane
    const now = new Date();
    if (jobData.lane === 1) {
        jobData.expires_at = jobData.shift_start_time
            ? new Date(new Date(jobData.shift_start_time).getTime() + 30 * 60 * 1000)
            : new Date(now.getTime() + 6 * 60 * 60 * 1000);
    }
    else if (jobData.lane === 2) {
        jobData.expires_at = jobData.shift_start_time || new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    else {
        jobData.expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    const job = await Job_1.Job.create(jobData);
    await Employer_1.Employer.updateOne({ _id: employer._id }, { $inc: { posts_this_month: 1, total_jobs_posted: 1 } });
    // Fire L1 broadcast asynchronously
    if (job.lane === 1) {
        (0, dispatchService_1.broadcastFlashJob)(job._id.toString()).catch(console.error);
    }
    res.status(201).json({ success: true, data: { job_id: job._id } });
});
// PATCH /jobs/:id — Update job
router.patch('/:id', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    const job = await Job_1.Job.findOneAndUpdate({ _id: req.params.id, employer_id: employer._id }, { $set: req.body }, { new: true });
    if (!job) {
        res.status(404).json({ success: false, error: 'Job not found' });
        return;
    }
    res.json({ success: true, data: job });
});
exports.default = router;
//# sourceMappingURL=jobs.js.map