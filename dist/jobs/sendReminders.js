"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSendRemindersCron = startSendRemindersCron;
const node_cron_1 = __importDefault(require("node-cron"));
const Match_1 = require("../models/Match");
const Worker_1 = require("../models/Worker");
const notificationService_1 = require("../services/notificationService");
// Run every 5 minutes — send T-30min shift reminders
function startSendRemindersCron() {
    node_cron_1.default.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date();
            const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60 * 1000);
            const thirtyFiveMinsFromNow = new Date(now.getTime() + 35 * 60 * 1000);
            const matches = await Match_1.Match.find({
                status: 'MATCHED',
                shift_start_time: { $gte: thirtyMinsFromNow, $lte: thirtyFiveMinsFromNow },
                reminder_sent: { $ne: true },
            });
            for (const match of matches) {
                const worker = await Worker_1.Worker.findById(match.worker_id);
                if (worker?.fcm_token) {
                    await notificationService_1.notificationService.sendPushNotification(worker.fcm_token, '⏰ Shift in 30 minutes!', `Your shift at ${match.venue_address ?? 'the venue'} starts soon. Get ready!`, { matchId: String(match._id), type: 'shift_reminder' });
                    await Match_1.Match.findByIdAndUpdate(match._id, { $set: { reminder_sent: true } });
                }
            }
            if (matches.length > 0)
                console.log(`[CronJob] Sent ${matches.length} shift reminders`);
        }
        catch (err) {
            console.error('[CronJob] sendReminders error:', err);
        }
    });
}
//# sourceMappingURL=sendReminders.js.map