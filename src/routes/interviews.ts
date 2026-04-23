import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Interview } from '../models/Interview';
import { Application } from '../models/Application';
import { Employer } from '../models/Employer';
import { Worker } from '../models/Worker';
import { notificationService } from '../services/notificationService';

const router = Router();

// POST /interviews — Schedule interview (employer)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const { application_id, scheduled_date, scheduled_time, interview_type, location_or_link, interviewer_name, pre_interview_brief } = req.body;

  const application = await Application.findOne({ _id: application_id, employer_id: employer._id });
  if (!application) {
    res.status(404).json({ success: false, error: 'Application not found' });
    return;
  }

  const interview = await Interview.create({
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

  await Application.updateOne({ _id: application_id }, { $set: { status: 'INTERVIEW_SCHEDULED' } });

  // Notify worker
  const worker = await Worker.findById(application.worker_id);
  const workerUser = worker ? await import('../models/User').then(m => m.User.findById(worker.user_id)) : null;
  if (workerUser?.fcm_token) {
    await notificationService.createInAppNotification({
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
router.patch('/:id/outcome', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const { status, offer_salary, offer_start_date } = req.body;
  await Interview.updateOne({ _id: req.params.id, employer_id: employer._id }, { $set: { status } });

  if (status === 'COMPLETED' && offer_salary) {
    const interview = await Interview.findById(req.params.id);
    if (interview) {
      await Application.updateOne({ _id: interview.application_id }, { $set: { status: 'OFFER_MADE' } });
    }
  }

  res.json({ success: true });
});

export default router;
