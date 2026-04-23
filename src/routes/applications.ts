import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Application } from '../models/Application';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { Job } from '../models/Job';
import { computeSUPS } from '../services/dispatchService';
import { notificationService } from '../services/notificationService';
import { User } from '../models/User';

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
  const workerCoords = (worker.last_known_location || worker.home_location)?.coordinates;
  const jobCoords = job.location?.coordinates;

  let distanceAtApply: number | undefined;
  if (workerCoords && jobCoords) {
    const [workerLng, workerLat] = workerCoords;
    const [jobLng, jobLat] = jobCoords;
    const earthRadiusKm = 6371;
    const dLat = (jobLat - workerLat) * Math.PI / 180;
    const dLng = (jobLng - workerLng) * Math.PI / 180;
    const haversine = Math.sin(dLat / 2) ** 2
      + Math.cos(workerLat * Math.PI / 180) * Math.cos(jobLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    distanceAtApply = Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)) * 10) / 10;
  }

  const application = await Application.create({
    job_id,
    worker_id: worker._id,
    employer_id: job.employer_id,
    killer_answers: killer_answers || [],
    sups_at_apply: sups_score,
    distance_at_apply: distanceAtApply,
    status: 'APPLIED',
  });

  const [employerUser, workerUser] = await Promise.all([
    Employer.findById(job.employer_id).then((employer) => employer ? User.findById(employer.user_id) : null),
    User.findById(req.user!.userId),
  ]);

  if (employerUser) {
    await notificationService.createInAppNotification({
      user_id: employerUser._id.toString(),
      type: 'APPLICATION_RECEIVED',
      title: 'New application received',
      body: `A worker applied for ${job.job_title}.`,
      data: { application_id: application._id.toString(), job_id: job._id.toString() },
      deep_link: `/(employer)/applicants/${job._id.toString()}`,
    });
  }

  if (workerUser?.phone_number) {
    await notificationService.sendWhatsAppApplicationNotification({
      toPhoneNumber: workerUser.phone_number,
      jobTitle: job.job_title,
      lane: job.lane,
    });
  }

  res.status(201).json({ success: true, data: { _id: application._id, application_id: application._id } });
});

// GET /applications/my — Worker's own applications
async function getWorkerApplications(req: AuthRequest, res: Response) {
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker) {
    res.status(403).json({ success: false, error: 'No worker profile' });
    return;
  }

  const { status, page = 1, limit = 20 } = req.query;
  const query: Record<string, unknown> = { worker_id: worker._id };
  if (status) query.status = status;

  const applications = await Application.find(query)
    .populate({
      path: 'job_id',
      select: 'job_title primary_skill shift_start_time shift_duration_hours pay_rate lane status employer_id',
      populate: { path: 'employer_id', select: 'property_type area_locality' },
    })
    .sort({ applied_at: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: applications.map((application: any) => ({
      _id: application._id,
      applied_at: application.applied_at,
      status: application.status === 'APPLIED' ? 'PENDING' : application.status,
      job_title: application.job_id?.job_title ?? '',
      pay_rate: application.job_id?.pay_rate ?? 0,
      employer_property_type: application.job_id?.employer_id?.property_type ?? '',
      employer_area_locality: application.job_id?.employer_id?.area_locality ?? '',
      match_id: application.match_id ?? null,
    })),
  });
}

router.get('/my', authMiddleware, getWorkerApplications);
router.get('/mine', authMiddleware, getWorkerApplications);

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

  res.json({
    success: true,
    data: applications.map((application: any) => ({
      _id: application._id,
      status: application.status === 'APPLIED' ? 'PENDING' : application.status,
      worker_id: application.worker_id?._id,
      worker_name: application.worker_id?.full_name ?? 'Worker',
      worker_photo: application.worker_id?.profile_photo_url ?? null,
      worker_primary_skill: application.worker_id?.primary_skill ?? null,
      worker_years_experience: application.worker_id?.years_experience ?? 0,
      worker_trust_score: application.worker_id?.trust_score ?? 0,
      worker_sups_score: application.sups_at_apply ?? 0,
    })),
  });
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

// PATCH /applications/:id/shortlist — mobile-friendly alias
router.patch('/:id/shortlist', authMiddleware, async (req: AuthRequest, res: Response) => {
  req.body.status = 'SHORTLISTED';
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, employer_id: employer._id },
    { $set: { status: 'SHORTLISTED' } },
    { new: true }
  );

  if (!application) {
    res.status(404).json({ success: false, error: 'Application not found' });
    return;
  }

  res.json({ success: true, data: application });
});

export default router;
