"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Interview_1 = require("../models/Interview");
const Application_1 = require("../models/Application");
const Employer_1 = require("../models/Employer");
const Worker_1 = require("../models/Worker");
const notificationService_1 = require("../services/notificationService");
const router = (0, express_1.Router)();
// POST /interviews — Schedule interview (employer)
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    const { application_id, scheduled_date, scheduled_time, interview_type, location_or_link, interviewer_name, pre_interview_brief } = req.body;
    const application = await Application_1.Application.findOne({ _id: application_id, employer_id: employer._id });
    if (!application) {
        res.status(404).json({ success: false, error: 'Application not found' });
        return;
    }
    const interview = await Interview_1.Interview.create({
        application_id,
        job_id: application.job_id,
        employer_id: employer._id,
        worker_id: application.worker_id,
        scheduled_date: new Date(scheduled_date),
        scheduled_time,
        interview_type,
        location_or_link,
        interviewer_name,
        pre_interview_brief,
    });
    await Application_1.Application.updateOne({ _id: application_id }, { $set: { status: 'INTERVIEW_SCHEDULED' } });
    // Notify worker
    const worker = await Worker_1.Worker.findById(application.worker_id);
    const workerUser = worker ? await Promise.resolve().then(() => __importStar(require('../models/User'))).then(m => m.User.findById(worker.user_id)) : null;
    if (workerUser?.fcm_token) {
        await notificationService_1.notificationService.createInAppNotification({
            user_id: workerUser._id.toString(),
            type: 'INTERVIEW_SCHEDULED',
            title: 'Interview Scheduled!',
            body: `${interview_type} interview on ${scheduled_date} at ${scheduled_time}`,
            data: { interview_id: interview._id.toString() },
        });
    }
    res.status(201).json({ success: true, data: { interview_id: interview._id } });
});
// PATCH /interviews/:id/outcome — Record interview outcome
router.patch('/:id/outcome', auth_1.authMiddleware, async (req, res) => {
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    const { status, offer_salary, offer_start_date } = req.body;
    await Interview_1.Interview.updateOne({ _id: req.params.id, employer_id: employer._id }, { $set: { status } });
    if (status === 'COMPLETED' && offer_salary) {
        const interview = await Interview_1.Interview.findById(req.params.id);
        if (interview) {
            await Application_1.Application.updateOne({ _id: interview.application_id }, { $set: { status: 'OFFER_MADE' } });
        }
    }
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=interviews.js.map