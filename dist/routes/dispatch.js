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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Worker_1 = require("../models/Worker");
const dispatchService_1 = require("../services/dispatchService");
const Match_1 = require("../models/Match");
const Employer_1 = require("../models/Employer");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// POST /dispatch/accept — Worker accepts L1 Flash job (atomic)
router.post('/accept', auth_1.authMiddleware, async (req, res) => {
    const { job_id } = req.body;
    const worker = await Worker_1.Worker.findOne({ user_id: req.user.userId });
    if (!worker) {
        res.status(403).json({ success: false, error: 'No worker profile' });
        return;
    }
    if (worker.trust_score < 3.0 && worker.total_confirmed_arrivals > 5) {
        res.status(403).json({ success: false, error: 'Trust score too low for L1 jobs' });
        return;
    }
    const result = await (0, dispatchService_1.dispatchAccept)(job_id, worker._id.toString());
    res.json(result);
});
// POST /dispatch/confirm-arrival — Employer scans QR to confirm arrival
router.post('/confirm-arrival', auth_1.authMiddleware, async (req, res) => {
    const { qr_token } = req.body;
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    try {
        const payload = JSON.parse(Buffer.from(qr_token, 'base64').toString('utf-8'));
        const { worker_id, match_id, timestamp, signature } = payload;
        const secret = process.env.JWT_SECRET || 'default-secret';
        const expected = crypto_1.default.createHmac('sha256', secret)
            .update(`${worker_id}:${match_id}:${timestamp}`)
            .digest('hex');
        if (signature !== expected) {
            res.status(401).json({ success: false, error: 'Invalid QR signature' });
            return;
        }
        if (Date.now() - timestamp > 10 * 60 * 1000) {
            res.status(401).json({ success: false, error: 'QR expired' });
            return;
        }
        const match = await Match_1.Match.findOneAndUpdate({ _id: match_id, employer_id: employer._id, status: { $in: ['MATCHED', 'WORKER_EN_ROUTE', 'ARRIVED'] } }, { $set: { status: 'CONFIRMED', confirmed_at: new Date(), confirmed_method: 'QR_SCAN' } }, { new: true });
        if (!match) {
            res.status(404).json({ success: false, error: 'Match not found or already confirmed' });
            return;
        }
        await Employer_1.Employer.updateOne({ _id: employer._id }, {
            $set: { confirm_gate_blocked: false },
            $inc: { total_confirmed_arrivals: 1 },
        });
        await Worker_1.Worker.updateOne({ _id: worker_id }, {
            $inc: { total_confirmed_arrivals: 1 },
            $set: { last_seen: new Date() },
        });
        res.json({ success: true, data: { match_id, confirmed_at: match.confirmed_at } });
    }
    catch {
        res.status(400).json({ success: false, error: 'Invalid QR token' });
    }
});
// POST /dispatch/no-show — Employer reports worker no-show
router.post('/no-show', auth_1.authMiddleware, async (req, res) => {
    const { match_id } = req.body;
    const employer = await Employer_1.Employer.findOne({ user_id: req.user.userId });
    if (!employer) {
        res.status(403).json({ success: false, error: 'Not an employer' });
        return;
    }
    const match = await Match_1.Match.findOneAndUpdate({ _id: match_id, employer_id: employer._id, status: { $in: ['MATCHED', 'WORKER_EN_ROUTE'] } }, {
        $set: {
            status: 'NO_SHOW_WORKER',
            no_show_reported_at: new Date(),
            no_show_reported_by: 'EMPLOYER',
        }
    }, { new: true });
    if (!match) {
        res.status(404).json({ success: false, error: 'Match not found' });
        return;
    }
    await Employer_1.Employer.updateOne({ _id: employer._id }, { $set: { confirm_gate_blocked: false } });
    await Worker_1.Worker.updateOne({ _id: match.worker_id }, { $inc: { total_no_shows: 1 } });
    // Recompute trust score asynchronously
    const { recomputeWorkerTrustScore } = await Promise.resolve().then(() => __importStar(require('../services/trustScoreService')));
    recomputeWorkerTrustScore(match.worker_id.toString()).catch(console.error);
    res.json({ success: true });
});
// POST /dispatch/generate-qr — Generate QR token for worker
router.post('/generate-qr', auth_1.authMiddleware, async (req, res) => {
    const { match_id } = req.body;
    const worker = await Worker_1.Worker.findOne({ user_id: req.user.userId });
    if (!worker) {
        res.status(403).json({ success: false, error: 'No worker profile' });
        return;
    }
    const match = await Match_1.Match.findOne({ _id: match_id, worker_id: worker._id });
    if (!match) {
        res.status(404).json({ success: false, error: 'Match not found' });
        return;
    }
    const timestamp = Date.now();
    const secret = process.env.JWT_SECRET || 'default-secret';
    const signature = crypto_1.default.createHmac('sha256', secret)
        .update(`${worker._id}:${match_id}:${timestamp}`)
        .digest('hex');
    const payload = Buffer.from(JSON.stringify({
        worker_id: worker._id.toString(),
        match_id,
        timestamp,
        signature,
    })).toString('base64');
    res.json({ success: true, data: { qr_token: payload, expires_in: 300 } });
});
exports.default = router;
//# sourceMappingURL=dispatch.js.map