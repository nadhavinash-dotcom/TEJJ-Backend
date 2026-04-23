import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { RatingWorker } from '../models/RatingWorker';
import { RatingEmployer } from '../models/RatingEmployer';
import { Match } from '../models/Match';
import { computeTrustScore, computeDignityScore, computeProfileDepthScore } from '../utils';

export async function recomputeWorkerTrustScore(workerId: string): Promise<void> {
  const worker = await Worker.findById(workerId);
  if (!worker) return;

  const completedMatches = await Match.countDocuments({
    worker_id: workerId,
    status: { $in: ['CONFIRMED', 'COMPLETED'] },
  });

  const noShowMatches = await Match.countDocuments({
    worker_id: workerId,
    status: 'NO_SHOW_WORKER',
  });

  const totalAccepted = completedMatches + noShowMatches;
  const show_up_rate = totalAccepted > 0 ? completedMatches / totalAccepted : 1.0;

  const ratings = await RatingWorker.find({ worker_id: workerId });
  const employer_rating_avg = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.overall_score, 0) / ratings.length
    : 0;

  const profile_depth_score = computeProfileDepthScore({
    profile_photo_url: worker.profile_photo_url,
    skill_video_url: worker.skill_video_url,
    cuisine_specialities: worker.cuisine_specialities,
    fssai_certified: worker.fssai_certified,
    highest_qualification: worker.highest_qualification,
    english_level: worker.english_level,
    transport_mode: worker.transport_mode,
  });

  const trust_score = computeTrustScore({
    show_up_rate,
    employer_rating_avg: employer_rating_avg || 3.0,
    profile_depth_score,
    conduct_score: worker.conduct_score,
  });

  await Worker.updateOne({ _id: workerId }, {
    $set: {
      trust_score,
      show_up_rate,
      employer_rating_avg,
      profile_depth_score,
      total_confirmed_arrivals: completedMatches,
      total_no_shows: noShowMatches,
    }
  });
}

export async function recomputeEmployerDignityScore(employerId: string): Promise<void> {
  const ratings = await RatingEmployer.find({ employer_id: employerId });
  if (ratings.length === 0) return;

  const avg = ratings.reduce((s, r) => s + r.overall_score, 0) / ratings.length;
  const pay_on_time_count = ratings.filter(r => r.pay_on_time).length;
  const respectful_count = ratings.filter(r => r.respectful_treatment).length;
  const would_return_count = ratings.filter(r => r.would_return).length;

  const employer = await Employer.findById(employerId);
  if (!employer) return;

  const dignity_score = computeDignityScore({
    avg_overall_score: avg,
    confirmation_rate: employer.confirmation_rate,
    whisper_flag_count: employer.whisper_flag_count,
  });

  let dignity_state = employer.dignity_state;
  if (employer.total_confirmed_arrivals >= 10 && dignity_state === 'NEW') dignity_state = 'ESTABLISHED';
  if (dignity_score < 3.5 || employer.whisper_flag_count >= 3) dignity_state = 'WARNING';

  await Employer.updateOne({ _id: employerId }, {
    $set: {
      dignity_score,
      dignity_state,
      pay_accuracy_rate: ratings.length > 0 ? pay_on_time_count / ratings.length : 1,
      fair_treatment_rate: ratings.length > 0 ? respectful_count / ratings.length : 1,
      worker_return_rate: ratings.length > 0 ? would_return_count / ratings.length : 0,
    }
  });
}
