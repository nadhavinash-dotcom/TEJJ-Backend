import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Match } from '../models/Match';
import { Employer } from '../models/Employer';
import { recomputeWorkerTrustScore } from '../services/trustScoreService';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { Worker } from '../models/Worker';
import { notificationService } from '../services/notificationService';
import { User } from '../models/User';

const router = Router();

// POST /matches — Employer converts an application into a match
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Employer profile required' });
    return;
  }

  const applicationId = req.body.application_id;
  if (!applicationId) {
    res.status(400).json({ success: false, error: 'application_id is required' });
    return;
  }

  const application = await Application.findOne({ _id: applicationId, employer_id: employer._id });
  if (!application) {
    res.status(404).json({ success: false, error: 'Application not found' });
    return;
  }

  const existingMatch = await Match.findOne({ job_id: application.job_id, worker_id: application.worker_id });
  if (existingMatch) {
    res.json({ success: true, data: { match_id: existingMatch._id } });
    return;
  }

  const job = await Job.findById(application.job_id);
  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found' });
    return;
  }

  const activeMatchCount = await Match.countDocuments({
    job_id: job._id,
    status: { $in: ['MATCHED', 'WORKER_EN_ROUTE', 'ARRIVED', 'CONFIRMED'] },
  });
  if (activeMatchCount >= job.number_of_openings) {
    res.status(409).json({ success: false, error: 'Job has already been filled' });
    return;
  }

  const laneMethodMap: Record<number, 'L1_FLASH' | 'L2_SAME_DAY' | 'L3_CONTRACT' | 'L4_PERMANENT'> = {
    1: 'L1_FLASH',
    2: 'L2_SAME_DAY',
    3: 'L3_CONTRACT',
    4: 'L4_PERMANENT',
  };

  const match = await Match.create({
    job_id: application.job_id,
    worker_id: application.worker_id,
    employer_id: employer._id,
    match_method: laneMethodMap[job.lane] ?? 'L2_SAME_DAY',
    worker_distance_m: application.distance_at_apply ? Math.round(application.distance_at_apply * 1000) : undefined,
    worker_sups_at_match: application.sups_at_apply,
    status: 'MATCHED',
  });

  const nextFilledCount = activeMatchCount + 1;
  await Promise.all([
    Application.updateOne({ _id: application._id }, { $set: { status: 'MATCHED', match_id: match._id } }),
    Job.updateOne(
      { _id: job._id },
      {
        $set: {
          openings_filled: nextFilledCount,
          status: nextFilledCount >= job.number_of_openings ? 'MATCHED' : 'PARTIALLY_FILLED',
        },
      }
    ),
  ]);

  const worker = await Worker.findById(application.worker_id);
  if (worker) {
    const workerUser = await User.findById(worker.user_id);
    if (workerUser) {
      await notificationService.createInAppNotification({
        user_id: workerUser._id.toString(),
        type: 'MATCH_CONFIRMED',
        title: 'You got the job',
        body: `You were matched for ${job.job_title}.`,
        data: { match_id: match._id.toString(), job_id: job._id.toString() },
        deep_link: `/(worker)/match/${match._id.toString()}`,
      });
    }
  }

  res.status(201).json({ success: true, data: { _id: match._id, match_id: match._id } });
});

// GET /matches/:id — Worker-facing match detail
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const match = await Match.findById(req.params.id).lean();
  if (!match) {
    res.status(404).json({ success: false, error: 'Match not found' });
    return;
  }

  const [job, employer] = await Promise.all([
    Job.findById(match.job_id).lean(),
    Employer.findById(match.employer_id).lean(),
  ]);

  if (!job || !employer) {
    res.status(404).json({ success: false, error: 'Associated records not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      _id: match._id,
      status: match.status,
      job_title: job.job_title,
      employer_property_type: employer.property_type,
      venue_address: employer.location_address ?? employer.area_locality ?? 'Venue details unavailable',
      shift_start_time: job.shift_start_time ?? null,
      shift_duration_hours: job.shift_duration_hours ?? null,
      pay_rate: job.pay_rate ?? 0,
      contact_name: employer.contact_name ?? null,
    },
  });
});

// POST /matches/:id/no-show — Report worker as no-show
router.post('/:id/no-show', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const employer = await Employer.findOne({ user_id: req.user!.userId });
    if (!employer) {
      res.status(403).json({ success: false, error: 'Employer profile required' });
      return;
    }

    const match = await Match.findById(id);
    if (!match) {
      res.status(404).json({ success: false, error: 'Match not found' });
      return;
    }

    if (match.employer_id.toString() !== employer._id.toString()) {
      res.status(403).json({ success: false, error: 'Unauthorized to report for this match' });
      return;
    }

    if (match.status !== 'MATCHED' && match.status !== 'WORKER_EN_ROUTE') {
      res.status(400).json({ success: false, error: 'Match is already resolved' });
      return;
    }

    match.status = 'NO_SHOW_WORKER';
    match.no_show_reported_at = new Date();
    match.no_show_reported_by = 'EMPLOYER';
    await match.save();

    // Trigger score recomputation for the worker
    await recomputeWorkerTrustScore(match.worker_id.toString());

    res.json({ success: true, message: 'Match marked as no-show.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to report no-show' });
  }
});

export default router;
