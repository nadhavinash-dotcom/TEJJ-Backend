import cron from 'node-cron';
import { Job } from '../models/Job';

// Run every 5 minutes — expire jobs past their expiry time
export function startExpireJobsCron() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const result = await Job.updateMany(
        {
          status: { $in: ['ACTIVE', 'BROADCASTING'] },
          expires_at: { $lt: new Date() },
        },
        { $set: { status: 'EXPIRED' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[CronJob] Expired ${result.modifiedCount} jobs`);
      }
    } catch (err) {
      console.error('[CronJob] expireJobs error:', err);
    }
  });
}
