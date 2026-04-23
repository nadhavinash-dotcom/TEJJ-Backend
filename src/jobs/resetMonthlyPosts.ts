import cron from 'node-cron';
import { Employer } from '../models/Employer';

// Run at midnight on 1st of every month — reset monthly post counts
export function startResetMonthlyPostsCron() {
  cron.schedule('0 0 1 * *', async () => {
    try {
      const result = await Employer.updateMany({}, { $set: { monthly_posts_used: 0 } });
      console.log(`[CronJob] Reset monthly posts for ${result.modifiedCount} employers`);
    } catch (err) {
      console.error('[CronJob] resetMonthlyPosts error:', err);
    }
  });
}
