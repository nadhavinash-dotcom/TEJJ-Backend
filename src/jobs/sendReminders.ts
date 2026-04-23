import cron from 'node-cron';
import { Match } from '../models/Match';
import { Worker } from '../models/Worker';
import { notificationService } from '../services/notificationService';

// Run every 5 minutes — send T-30min shift reminders
export function startSendRemindersCron() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      const thirtyFiveMinsFromNow = new Date(now.getTime() + 35 * 60 * 1000);

      const matches = await Match.find({
        status: 'MATCHED',
        shift_start_time: { $gte: thirtyMinsFromNow, $lte: thirtyFiveMinsFromNow },
        reminder_sent: { $ne: true },
      });

      for (const match of matches) {
        const worker = await Worker.findById(match.worker_id);
        if (worker?.fcm_token) {
          await notificationService.sendPushNotification(
            worker.fcm_token,
            '⏰ Shift in 30 minutes!',
            `Your shift at ${(match as any).venue_address ?? 'the venue'} starts soon. Get ready!`,
            { matchId: String(match._id), type: 'shift_reminder' }
          );
          await Match.findByIdAndUpdate(match._id, { $set: { reminder_sent: true } });
        }
      }

      if (matches.length > 0) console.log(`[CronJob] Sent ${matches.length} shift reminders`);
    } catch (err) {
      console.error('[CronJob] sendReminders error:', err);
    }
  });
}
