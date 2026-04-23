import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminAuthMiddleware } from '../middleware/auth';
import { Match } from '../models/Match';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { RatingWorker } from '../models/RatingWorker';
import { RatingEmployer } from '../models/RatingEmployer';
import { Employer } from '../models/Employer';
import { User } from '../models/User';
import { Worker } from '../models/Worker';

const router = Router();

// GET /analytics/employer — employer analytics dashboard
router.get('/employer', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const user = await User.findOne({ firebase_uid: uid });
    if (!user) return res.status(404).json({ success: false });
    const employer = await Employer.findOne({ user_id: user._id });
    if (!employer) return res.status(404).json({ success: false });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [jobsPosted, matches, ratings] = await Promise.all([
      Job.countDocuments({ employer_id: employer._id, created_at: { $gte: thirtyDaysAgo } }),
      Match.find({ employer_id: employer._id, matched_at: { $gte: thirtyDaysAgo } }),
      RatingWorker.find({ employer_id: employer._id, created_at: { $gte: thirtyDaysAgo } }),
    ]);

    const arrivedMatches = matches.filter((m) => m.status === 'ARRIVED' || m.status === 'COMPLETED');
    const showUpRate = matches.length > 0 ? (arrivedMatches.length / matches.length) * 100 : 0;

    const matchesToday = matches.filter((m) => {
      const today = new Date();
      return m.matched_at.toDateString() === today.toDateString();
    }).length;

    // Average fill time
    const filledJobs = await Job.find({ employer_id: employer._id, status: 'FILLED', created_at: { $gte: thirtyDaysAgo } });
    const avgFillMs = filledJobs.length > 0
      ? filledJobs.reduce((acc, j) => acc + (j.updated_at.getTime() - j.created_at.getTime()), 0) / filledJobs.length
      : 0;

    // Skill breakdown
    const skillMap: Record<string, number> = {};
    matches.forEach((m: any) => { if (m.primary_skill) skillMap[m.primary_skill] = (skillMap[m.primary_skill] ?? 0) + 1; });
    const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([skill, count]) => ({ skill, matches: count }));

    res.json({
      success: true,
      data: {
        jobs_posted: jobsPosted,
        total_matches: matches.length,
        matches_today: matchesToday,
        show_up_rate: showUpRate,
        avg_fill_time_mins: Math.round(avgFillMs / 60000),
        dignity_score: employer.dignity_score ?? 0,
        repeat_workers: 0,
        top_skills: topSkills,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /analytics/platform — admin platform analytics
router.get('/platform', adminAuthMiddleware, async (_req: Request, res: Response) => {
  try {
    const [workers, employers, jobs, matches] = await Promise.all([
      Worker.countDocuments(),
      Employer.countDocuments(),
      Job.countDocuments(),
      Match.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { total_workers: workers, total_employers: employers, total_jobs: jobs, total_matches: matches },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
