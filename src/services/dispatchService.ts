import { Match } from '../models/Match';
import { Job } from '../models/Job';
import { Worker } from '../models/Worker';
import { DispatchEvent } from '../models/DispatchEvent';
import { notificationService } from './notificationService';
import type { Types } from 'mongoose';

interface DispatchResult {
  success: boolean;
  match_id?: string;
  already_matched?: boolean;
  message?: string;
}

export async function dispatchAccept(jobId: string, workerId: string): Promise<DispatchResult> {
  // Atomic check: only one worker can match a job opening
  const job = await Job.findById(jobId);
  if (!job) return { success: false, message: 'Job not found' };
  if (job.status !== 'BROADCASTING') return { success: false, already_matched: true, message: 'Job no longer available' };

  const existingMatch = await Match.findOne({ job_id: jobId, worker_id: workerId });
  if (existingMatch) return { success: false, already_matched: true };

  // Check if all openings are filled
  const matchCount = await Match.countDocuments({
    job_id: jobId,
    status: { $in: ['MATCHED', 'WORKER_EN_ROUTE', 'ARRIVED', 'CONFIRMED'] }
  });
  if (matchCount >= job.number_of_openings) {
    return { success: false, already_matched: true, message: 'Job already filled' };
  }

  const worker = await Worker.findById(workerId);
  if (!worker) return { success: false, message: 'Worker not found' };

  const match = await Match.create({
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
  await Job.updateOne({ _id: jobId }, { $set: { openings_filled: newFilled, status: newStatus } });

  // Log dispatch event
  await DispatchEvent.create({
    job_id: jobId,
    worker_id: workerId,
    event_type: 'ACCEPTED',
    channel: 'PUSH',
    responded_at: new Date(),
  });

  // Notify employer
  await notificationService.notifyMatchConfirmed(match._id.toString(), job.employer_id.toString());

  return { success: true, match_id: match._id.toString() };
}

export async function broadcastFlashJob(jobId: string): Promise<void> {
  const job = await Job.findById(jobId);
  if (!job || job.lane !== 1) return;

  const radiusMeters = job.geofence_radius_m || 10000;
  const jobCoords = job.location?.coordinates;
  if (!jobCoords) return;

  const workers = await Worker.find({
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
    if (!worker.fcm_token) continue;

    await notificationService.sendFlashJobNotification(
      worker.fcm_token,
      worker._id.toString(),
      {
        job_id: job._id.toString(),
        job_title: job.job_title,
        pay_rate: job.pay_rate ?? 0,
        skill: job.primary_skill,
      }
    );

    await DispatchEvent.create({
      job_id: job._id,
      worker_id: worker._id,
      event_type: 'PINGED',
      channel: 'PUSH',
    });
  }
}

export async function computeSUPS(workerId: string, jobId: string): Promise<number> {
  const worker = await Worker.findById(workerId);
  if (!worker) return 50;

  // Mock SUPS: weighted combination of trust signals
  const showUpWeight = worker.show_up_rate * 40;
  const ratingWeight = (worker.employer_rating_avg / 5) * 30;
  const activityWeight = worker.last_seen
    ? Math.max(0, 1 - (Date.now() - worker.last_seen.getTime()) / (2 * 60 * 60 * 1000)) * 30
    : 0;

  const score = Math.min(99, Math.max(10, showUpWeight + ratingWeight + activityWeight));
  return Math.round(score);
}
