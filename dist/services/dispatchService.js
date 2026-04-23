"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchAccept = dispatchAccept;
exports.broadcastFlashJob = broadcastFlashJob;
exports.computeSUPS = computeSUPS;
const Match_1 = require("../models/Match");
const Job_1 = require("../models/Job");
const Worker_1 = require("../models/Worker");
const DispatchEvent_1 = require("../models/DispatchEvent");
const notificationService_1 = require("./notificationService");
async function dispatchAccept(jobId, workerId) {
    // Atomic check: only one worker can match a job opening
    const job = await Job_1.Job.findById(jobId);
    if (!job)
        return { success: false, message: 'Job not found' };
    if (job.status !== 'BROADCASTING')
        return { success: false, already_matched: true, message: 'Job no longer available' };
    const existingMatch = await Match_1.Match.findOne({ job_id: jobId, worker_id: workerId });
    if (existingMatch)
        return { success: false, already_matched: true };
    // Check if all openings are filled
    const matchCount = await Match_1.Match.countDocuments({
        job_id: jobId,
        status: { $in: ['MATCHED', 'WORKER_EN_ROUTE', 'ARRIVED', 'CONFIRMED'] }
    });
    if (matchCount >= job.number_of_openings) {
        return { success: false, already_matched: true, message: 'Job already filled' };
    }
    const worker = await Worker_1.Worker.findById(workerId);
    if (!worker)
        return { success: false, message: 'Worker not found' };
    const match = await Match_1.Match.create({
        job_id: jobId,
        worker_id: workerId,
        employer_id: job.employer_id,
        match_method: `L${job.lane}_${['FLASH', 'SAME_DAY', 'CONTRACT', 'PERMANENT'][job.lane - 1]}`,
        worker_location_at_match: worker.last_known_location || worker.home_location,
        status: 'MATCHED',
    });
    // Update job openings
    const newFilled = matchCount + 1;
    const newStatus = newFilled >= job.number_of_openings ? 'MATCHED' : 'PARTIALLY_FILLED';
    await Job_1.Job.updateOne({ _id: jobId }, { $set: { openings_filled: newFilled, status: newStatus } });
    // Log dispatch event
    await DispatchEvent_1.DispatchEvent.create({
        job_id: jobId,
        worker_id: workerId,
        event_type: 'ACCEPTED',
        channel: 'PUSH',
        responded_at: new Date(),
    });
    // Notify employer
    await notificationService_1.notificationService.notifyMatchConfirmed(match._id.toString(), job.employer_id.toString());
    return { success: true, match_id: match._id.toString() };
}
async function broadcastFlashJob(jobId) {
    const job = await Job_1.Job.findById(jobId);
    if (!job || job.lane !== 1)
        return;
    const radiusMeters = job.geofence_radius_m || 10000;
    const jobCoords = job.location?.coordinates;
    if (!jobCoords)
        return;
    const workers = await Worker_1.Worker.find({
        home_location: {
            $near: {
                $geometry: { type: 'Point', coordinates: jobCoords },
                $maxDistance: radiusMeters,
            },
        },
        primary_skill: job.primary_skill,
        status: 'ACTIVE',
        'agent_enabled': false,
    }).limit(50);
    for (const worker of workers) {
        if (!worker.fcm_token)
            continue;
        await notificationService_1.notificationService.sendFlashJobNotification(worker.fcm_token, worker._id.toString(), {
            job_id: job._id.toString(),
            job_title: job.job_title,
            pay_rate: job.pay_rate ?? 0,
            skill: job.primary_skill,
        });
        await DispatchEvent_1.DispatchEvent.create({
            job_id: job._id,
            worker_id: worker._id,
            event_type: 'PINGED',
            channel: 'PUSH',
        });
    }
}
async function computeSUPS(workerId, jobId) {
    const worker = await Worker_1.Worker.findById(workerId);
    if (!worker)
        return 50;
    // Mock SUPS: weighted combination of trust signals
    const showUpWeight = worker.show_up_rate * 40;
    const ratingWeight = (worker.employer_rating_avg / 5) * 30;
    const activityWeight = worker.last_seen
        ? Math.max(0, 1 - (Date.now() - worker.last_seen.getTime()) / (2 * 60 * 60 * 1000)) * 30
        : 0;
    const score = Math.min(99, Math.max(10, showUpWeight + ratingWeight + activityWeight));
    return Math.round(score);
}
//# sourceMappingURL=dispatchService.js.map