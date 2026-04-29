import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Job } from '../models/Job';
import { Employer } from '../models/Employer';
import { Worker } from '../models/Worker';
import { MarketRate } from '../models/MarketRate';
import { Application } from '../models/Application';
import { JobTemplate } from '../models/JobTemplate';
import { broadcastFlashJob, computeSUPS } from '../services/dispatchService';
import type { FilterQuery } from 'mongoose';
import { deriveLaneExpiry } from '../utils/contract-helpers';

const router = Router();

function haversineKm(coords1: [number, number], coords2: [number, number]): number {
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// GET /jobs/feed — Worker job feed
router.get('/feed', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Fetch Worker (Use .lean() for faster reads since we don't need Mongoose documents)
    const worker = await Worker.findOne({ user_id: req.user!.userId }).lean();
    if (!worker) {
      res.status(404).json({ success: false, error: 'Worker profile not found' });
      return;
    }

    // 2. Sanitize and Extract Query Params
    const { lane, min_pay, page = 1, limit = 20, skill, lat, lng } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit))); // Cap limit to prevent server overload

    const overrideLat = lat !== undefined ? Number(lat) : undefined;
    const overrideLng = lng !== undefined ? Number(lng) : undefined;

    const workerCoords = Number.isFinite(overrideLat) && Number.isFinite(overrideLng)
      ? [overrideLng as number, overrideLat as number]
      : (worker.last_known_location || worker.home_location)?.coordinates;

    const max_distance_meters = (req.query.max_distance_km !== undefined
      ? Number(req.query.max_distance_km)
      : (worker.preferred_radius_km || 15)) * 1000;

    // 3. Construct Query Conditions
    const now = new Date();
    const andConditions: FilterQuery<typeof Job>[] = [
      { $or: [{ expires_at: { $exists: false } }, { expires_at: { $gt: now } }] },
    ];

    const effectiveMinPay = Math.max(
      min_pay ? Number(min_pay) : 0,
      worker.min_pay_per_shift ?? 0
    );

    if (effectiveMinPay > 0) {
      andConditions.push({
        $or: [{ pay_rate: { $gte: effectiveMinPay } }, { pay_min: { $gte: effectiveMinPay } }]
      });
    }

    const query: FilterQuery<typeof Job> = {
      status: { $in: ['BROADCASTING', 'PARTIALLY_FILLED'] },
      is_demo_post: { $ne: true },
      primary_skill: skill ? String(skill) : worker.primary_skill,
      $and: andConditions,
    };

    if (workerCoords) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: workerCoords },
          $maxDistance: max_distance_meters,
        },
      };
    }

    if (lane) query.lane = Number(lane);

    console.log((JSON.stringify(query)));

    // 4. Fetch Jobs
    const jobs = await Job.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    console.log(jobs);

    if (jobs.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    // 5. Parallel Data Fetching (Employers & Market Rates)
    const employerIds = [...new Set(jobs.map(j => j.employer_id.toString()))];
    const uniqueSkills = [...new Set(jobs.map(j => j.primary_skill))];

    // Fetch both datasets concurrently rather than sequentially
    const [employers, marketRates] = await Promise.all([
      Employer.find({ _id: { $in: employerIds } })
        .select('property_type area_locality dignity_score gstin_verified')
        .lean(),
      MarketRate.find({ city: worker.city, skill: { $in: uniqueSkills } }).lean()
    ]);

    const employerMap = new Map(employers.map(e => [e._id.toString(), e]));
    const marketRateMap = new Map(marketRates.map(r => [`${r.city}:${r.skill}`, r.median]));

    // 6. Map Feed Responses
    const feedPromises = jobs.map(async (job) => {
      const employer = employerMap.get(job.employer_id.toString());
      if (!employer) return null;

      // ⚠️ Note: Filtering here reduces the output size below the requested 'limit'
      if (employer.dignity_score < worker.min_dignity_score) return null;

      const distance_km = workerCoords && job.location?.coordinates
        ? haversineKm(workerCoords as [number, number], job.location.coordinates)
        : undefined;

      // ⚠️ Note: N+1 query vulnerability if computeSUPS makes DB calls
      const sups_score = await computeSUPS(worker._id.toString(), job._id.toString());

      const marketMedian = marketRateMap.get(`${worker.city}:${job.primary_skill}`);
      const market_rate_delta = marketMedian !== undefined && job.pay_rate !== undefined
        ? job.pay_rate - marketMedian
        : undefined;

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
        distance_km,
        sups_score,
        market_rate_delta,
        employer_property_type: employer.property_type,
        employer_area_locality: employer.area_locality,
        employer_dignity_score: employer.dignity_score,
        employer_gstin_verified: employer.gstin_verified,
      };
    });

    const feed = (await Promise.all(feedPromises)).filter(Boolean);

    res.json({ success: true, data: feed });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch job feed' });
  }
});

// GET /jobs/mine — List all jobs posted by the employer
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const employer = await Employer.findOne({ user_id: req.user!.userId });
    if (!employer) {
      res.status(403).json({ success: false, error: 'Not an employer' });
      return;
    }

    const jobs = await Job.find({ employer_id: employer._id })
      .sort({ created_at: -1 })
      .lean();

    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({ job_id: job._id });
      return {
        _id: job._id,
        job_title: job.job_title,
        lane: job.lane,
        status: job.status,
        applicant_count: applicantCount,
        pay_rate: job.pay_rate || job.pay_min
      };
    }));

    res.json({ success: true, data: jobsWithCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

// GET /jobs/templates — Employer job templates
router.get('/templates', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const templates = await JobTemplate.find({ employer_id: employer._id })
    .sort({ last_used_at: -1, created_at: -1 })
    .limit(20)
    .lean();

  res.json({
    success: true,
    data: templates.map((template) => ({
      _id: template._id,
      job_title: template.job_title,
      primary_skill: template.primary_skill,
      description: template.special_instructions ?? '',
      pay_rate: template.pay_rate ?? 0,
      shift_duration_hours: template.shift_duration_hours ?? 8,
      number_of_openings: 1,
      lane: template.lane,
    })),
  });
});

// GET /jobs/:id — Job detail
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const job = await Job.findById(req.params.id).lean();
  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found' });
    return;
  }

  const worker = await Worker.findOne({ user_id: req.user!.userId }).lean();
  const employer = await Employer.findById(job.employer_id)
    .select('-location_address -contact_name -contact_phone -entry_instructions -gstin')
    .lean();

  const workerCoords = (worker?.last_known_location || worker?.home_location)?.coordinates;
  const jobCoords = job.location?.coordinates;
  const distance_km = workerCoords && jobCoords
    ? haversineKm(workerCoords as [number, number], jobCoords)
    : null;

  res.json({
    success: true,
    data: {
      _id: job._id,
      lane: job.lane,
      job_title: job.job_title,
      primary_skill: job.primary_skill,
      description: job.job_description ?? '',
      pay_rate: job.pay_rate,
      pay_type: job.pay_type,
      shift_start_time: job.shift_start_time,
      shift_duration_hours: job.shift_duration_hours,
      number_of_openings: job.number_of_openings,
      openings_filled: job.openings_filled,
      distance_km,
      employer_id: employer?._id ?? job.employer_id,
      employer_property_type: employer?.property_type ?? '',
      employer_area_locality: employer?.area_locality ?? '',
      employer_dignity_score: employer?.dignity_score ?? 0,
      employer_gstin_verified: employer?.gstin_verified ?? false,
      meals_provided: job.meals_provided ?? false,
      uniform_provided: Boolean(job.uniform_required),
      transport_provided: job.transport_provided ?? false,
    },
  });
});

// POST /jobs — Create job (employer)
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
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

  const lane = Number(req.body.lane);
  const payRate = Number(req.body.pay_rate);
  const openings = req.body.number_of_openings !== undefined ? Number(req.body.number_of_openings) : 1;
  const durationHours = req.body.shift_duration_hours !== undefined ? Number(req.body.shift_duration_hours) : undefined;
  const shiftStartTime = req.body.shift_start_time ? new Date(req.body.shift_start_time) : undefined;

  if (![1, 2, 3, 4].includes(lane)) {
    res.status(400).json({ success: false, error: 'lane must be one of 1, 2, 3, or 4' });
    return;
  }
  if (typeof req.body.job_title !== 'string' || !req.body.job_title.trim()) {
    res.status(400).json({ success: false, error: 'job_title is required' });
    return;
  }
  if (typeof req.body.primary_skill !== 'string' || !req.body.primary_skill.trim()) {
    res.status(400).json({ success: false, error: 'primary_skill is required' });
    return;
  }
  if (!Number.isFinite(payRate) || payRate <= 0) {
    res.status(400).json({ success: false, error: 'pay_rate must be a positive number' });
    return;
  }
  if (!Number.isFinite(openings) || openings <= 0) {
    res.status(400).json({ success: false, error: 'number_of_openings must be at least 1' });
    return;
  }
  if (durationHours !== undefined && (!Number.isFinite(durationHours) || durationHours <= 0)) {
    res.status(400).json({ success: false, error: 'shift_duration_hours must be a positive number' });
    return;
  }
  if (shiftStartTime && Number.isNaN(shiftStartTime.getTime())) {
    res.status(400).json({ success: false, error: 'shift_start_time must be a valid date' });
    return;
  }

  const now = new Date();
  if (lane === 1 && shiftStartTime && shiftStartTime.getTime() > now.getTime() + 6 * 60 * 60 * 1000) {
    res.status(400).json({ success: false, error: 'Lane 1 jobs must start within the next 6 hours' });
    return;
  }
  if (lane === 2 && shiftStartTime && shiftStartTime.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
    res.status(400).json({ success: false, error: 'Lane 2 jobs must start within the next 24 hours' });
    return;
  }

  const jobData = {
    lane,
    job_title: req.body.job_title.trim(),
    job_description: typeof req.body.description === 'string' ? req.body.description.trim() : undefined,
    primary_skill: req.body.primary_skill.trim(),
    pay_rate: payRate,
    shift_duration_hours: durationHours,
    number_of_openings: openings,
    keywords_extracted: Array.isArray(req.body.keywords_extracted) ? req.body.keywords_extracted.filter((value: unknown) => typeof value === 'string') : [],
    employer_id: employer._id,
    location: employer.location,
    status: 'BROADCASTING',
    shift_start_time: shiftStartTime,
  };

  jobData.expires_at = deriveLaneExpiry({
    lane,
    now,
    shiftStartTime: shiftStartTime?.toISOString(),
  });

  const job = await Job.create(jobData);

  await JobTemplate.findOneAndUpdate(
    { employer_id: employer._id, lane, primary_skill: job.primary_skill, job_title: job.job_title },
    {
      $set: {
        pay_rate: job.pay_rate,
        shift_duration_hours: job.shift_duration_hours,
        special_instructions: job.job_description,
        last_used_at: new Date(),
      },
      $setOnInsert: {
        template_name: `${job.job_title} template`,
        killer_questions: [],
      },
      $inc: { usage_count: 1 },
    },
    { upsert: true, new: true }
  );

  await Employer.updateOne({ _id: employer._id }, { $inc: { posts_this_month: 1, total_jobs_posted: 1 } });

  // Fire L1 broadcast asynchronously
  if (job.lane === 1) {
    broadcastFlashJob(job._id.toString()).catch(console.error);
  }

  res.status(201).json({ success: true, data: { job_id: job._id } });
});

// PATCH /jobs/:id — Update job
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employer_id: employer._id },
    { $set: req.body },
    { new: true }
  );

  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found' });
    return;
  }

  res.json({ success: true, data: job });
});

export default router;
