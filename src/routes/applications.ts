import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Application } from '../models/Application';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { Job } from '../models/Job';
import { computeSUPS } from '../services/dispatchService';

const router = Router();

// POST /applications — Worker applies to job
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker) {
    res.status(403).json({ success: false, error: 'No worker profile' });
    return;
  }

  const { job_id, killer_answers } = req.body;
  const job = await Job.findById(job_id);
  if (!job || job.status !== 'BROADCASTING') {
    res.status(400).json({ success: false, error: 'Job not available' });
    return;
  }

  const existing = await Application.findOne({ job_id, worker_id: worker._id });
  if (existing) {
    res.status(409).json({ success: false, error: 'Already applied' });
    return;
  }

  const sups_score = await computeSUPS(worker._id.toString(), job_id);

  const application = await Application.create({
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
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker) {
    res.status(403).json({ success: false, error: 'No worker profile' });
    return;
  }

  const { status, page = 1, limit = 20 } = req.query;
  const query: Record<string, unknown> = { worker_id: worker._id };
  if (status) query.status = status;

  const applications = await Application.find(query)
    .populate('job_id', 'job_title primary_skill shift_start_time shift_duration_hours pay_rate lane status')
    .sort({ applied_at: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({ success: true, data: applications });
});

// GET /applications/job/:jobId — Employer views applicants
router.get('/job/:jobId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const { sort = 'sups_at_apply', page = 1, limit = 20 } = req.query;

  const applications = await Application.find({ job_id: req.params.jobId, employer_id: employer._id })
    .populate('worker_id', 'full_name profile_photo_url primary_skill years_experience ai_score trust_score total_confirmed_arrivals city')
    .sort({ [sort as string]: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({ success: true, data: applications });
});

// PATCH /applications/:id/status — Employer shortlists/rejects
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
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

  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, employer_id: employer._id },
    { $set: { status } },
    { new: true }
  );

  if (!application) {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }

  res.json({ success: true, data: application });
});

export default router;
