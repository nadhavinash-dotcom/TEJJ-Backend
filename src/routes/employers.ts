import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Employer } from '../models/Employer';
import { User } from '../models/User';
import { Match } from '../models/Match';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { buildProfileRoutingState, ContractValidationError, EMPLOYER_PLANS, normalizeEmployerOnboardingPayload } from '../utils';
import { RetainEnrollment } from '../models/RetainEnrollment';
import { Worker } from '../models/Worker';

const router = Router();

// GET /employers/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId }).lean();
  if (!employer) {
    res.status(404).json({ success: false, error: 'Employer profile not found' });
    return;
  }
  res.json({
    success: true,
    data: {
      ...employer,
      lat: employer.location?.coordinates?.[1] ?? null,
      lng: employer.location?.coordinates?.[0] ?? null,
      address: employer.location_address ?? null,
    },
  });
});

// GET /employers/profile-status
router.get('/profile-status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId }).select('_id').lean();
  res.json({
    success: true,
    data: {
      employer_id: employer?._id ?? null,
      ...buildProfileRoutingState({ role: 'employer', hasProfile: Boolean(employer) }),
    },
  });
});

// POST /employers — Create employer profile
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const existing = await Employer.findOne({ user_id: req.user!.userId });
  if (existing) {
    res.status(409).json({ success: false, error: 'Employer profile already exists' });
    return;
  }

  try {
    const payload = normalizeEmployerOnboardingPayload(req.body);
    const employer = await Employer.create({
      user_id: req.user!.userId,
      ...payload,
      plan: 'FLASH_FREE',
      monthly_post_limit: 3,
      dignity_score: 4.0,
      dignity_state: 'NEW',
    });

    await User.updateOne({ _id: req.user!.userId }, { $set: { has_employer: true, active_role: 'employer' } });

    res.status(201).json({
      success: true,
      data: {
        _id: req.user!.userId,
        employer_id: employer._id,
        has_employer: true,
        active_role: 'employer',
      },
    });
  } catch (error) {
    if (error instanceof ContractValidationError) {
      res.status(400).json({ success: false, error: error.message, details: error.details });
      return;
    }
    console.error('Create Employer Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create employer profile' });
  }
});

// PATCH /employers/me — Update employer profile
router.patch('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const updates = req.body;
  delete updates.dignity_score;
  delete updates.plan;
  delete updates.posts_this_month;

  const employer = await Employer.findOneAndUpdate(
    { user_id: req.user!.userId },
    { $set: updates },
    { new: true }
  );

  if (!employer) {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }

  res.json({ success: true, data: employer });
});

// POST /employers/me/upgrade-plan — Change subscription plan
router.post('/me/upgrade-plan', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body;
  const validPlans = Object.keys(EMPLOYER_PLANS);
  if (!validPlans.includes(plan)) {
    res.status(400).json({ success: false, error: 'Invalid plan' });
    return;
  }

  const planConfig = EMPLOYER_PLANS[plan as keyof typeof EMPLOYER_PLANS];
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

  await Employer.updateOne(
    { user_id: req.user!.userId },
    { $set: { plan, monthly_post_limit, plan_started_at: new Date(), ...featureGates } }
  );

  res.json({ success: true, message: `Plan upgraded to ${plan}` });
});

// GET /employers/:id/public — Public employer profile (for job detail)
router.get('/:id/public', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findById(req.params.id)
    .select('property_type property_segment area_locality dignity_score dignity_state worker_return_rate gstin_verified meals_provided uniform_provided transport_provided brand_affiliation')
    .lean();

  if (!employer) {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }

  res.json({ success: true, data: employer });
});

// GET /employers/confirm-gate — Check for pending matches that need resolution
router.get('/confirm-gate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const employer = await Employer.findOne({ user_id: req.user!.userId });
    if (!employer) {
      res.status(404).json({ success: false, error: 'Employer not found' });
      return;
    }

    // Look for matches from the last 48 hours that are still 'MATCHED'
    const lookbackDate = new Date();
    lookbackDate.setHours(lookbackDate.getHours() - 48);

    const pendingMatch = await Match.findOne({
      employer_id: employer._id,
      status: 'MATCHED',
      arrived_at: { $exists: false },
      no_show_reported_at: { $exists: false },
      matched_at: { $gte: lookbackDate }
    })
    .populate('worker_id', 'full_name')
    .populate('job_id', 'job_title')
    .lean();

    if (pendingMatch) {
      res.json({
        success: true,
        data: {
          blocked: true,
          pending_match: {
            _id: pendingMatch._id,
            job_title: (pendingMatch.job_id as any)?.job_title,
            worker_name: (pendingMatch.worker_id as any)?.full_name
          }
        }
      });
    } else {
      res.json({ success: true, data: { blocked: false } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to check confirm gate' });
  }
});

// GET /employers/dashboard — Hiring summary for the employer dashboard
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const employer = await Employer.findOne({ user_id: req.user!.userId });
    if (!employer) {
      res.status(404).json({ success: false, error: 'Employer not found' });
      return;
    }

    const employerId = employer._id;

    // 1. Active Jobs Count
    const activeJobs = await Job.countDocuments({ 
      employer_id: employerId, 
      status: { $in: ['BROADCASTING', 'PARTIALLY_FILLED', 'MATCHED'] } 
    });

    // 2. Total Applicants (across active jobs)
    const activeJobIds = await Job.find({ 
      employer_id: employerId, 
      status: { $in: ['BROADCASTING', 'PARTIALLY_FILLED', 'MATCHED'] } 
    }).distinct('_id');
    const totalApplicants = await Application.countDocuments({ job_id: { $in: activeJobIds } });

    // 3. Matches Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchesToday = await Match.countDocuments({ 
      employer_id: employerId, 
      created_at: { $gte: today } 
    });

    // 4. Active Jobs List (3 most recent)
    const activeJobsList = await Job.find({ 
      employer_id: employerId, 
      status: { $in: ['BROADCASTING', 'PARTIALLY_FILLED', 'MATCHED'] } 
    })
    .sort({ created_at: -1 })
    .limit(3)
    .lean();

    // Map applicant counts to each job in the list
    const jobsWithCounts = await Promise.all(activeJobsList.map(async (job) => {
      const applicantCount = await Application.countDocuments({ job_id: job._id });
      return {
        _id: job._id,
        job_title: job.job_title,
        applicant_count: applicantCount,
        pay_rate: job.pay_rate || job.pay_min
      };
    }));

    res.json({
      success: true,
      data: {
        active_jobs: activeJobs,
        total_applicants: totalApplicants,
        matches_today: matchesToday,
        active_jobs_list: jobsWithCounts
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
});

// GET /employers/retain — Retain dashboard summary
router.get('/retain', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const employer = await Employer.findOne({ user_id: req.user!.userId });
    if (!employer) {
      res.status(404).json({ success: false, error: 'Employer not found' });
      return;
    }

    const enrollments = await RetainEnrollment.find({ employer_id: employer._id, status: 'ACTIVE' })
      .sort({ enrolled_at: -1 })
      .lean();

    const workerIds = enrollments.map((enrollment) => enrollment.worker_id);
    const workers = await Worker.find({ _id: { $in: workerIds } }).select('primary_skill').lean();
    const workerSkillMap = new Map(workers.map((worker) => [worker._id.toString(), worker.primary_skill ?? 'worker']));

    const avgRetentionDays = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, enrollment) => sum + (enrollment.days_with_employer ?? 0), 0) / enrollments.length)
      : 0;

    res.json({
      success: true,
      data: {
        enrolled_workers: enrollments.length,
        avg_retention_days: avgRetentionDays,
        workers: enrollments.map((enrollment) => ({
          _id: enrollment._id,
          worker_skill: workerSkillMap.get(enrollment.worker_id.toString()) ?? 'worker',
          days_with_employer: enrollment.days_with_employer ?? 0,
          plan_tier: enrollment.plan_tier,
          insurance_active: enrollment.insurance_active,
          loan_eligible: enrollment.loan_eligible,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch retain data' });
  }
});

export default router;
