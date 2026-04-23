"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpireJobsCron = startExpireJobsCron;
const node_cron_1 = __importDefault(require("node-cron"));
const Job_1 = require("../models/Job");
// Run every 5 minutes — expire jobs past their expiry time
function startExpireJobsCron() {
    node_cron_1.default.schedule('*/5 * * * *', async () => {
        try {
            const result = await Job_1.Job.updateMany({
                status: { $in: ['ACTIVE', 'BROADCASTING'] },
                expires_at: { $lt: new Date() },
            }, { $set: { status: 'EXPIRED' } });
            if (result.modifiedCount > 0) {
                console.log(`[CronJob] Expired ${result.modifiedCount} jobs`);
            }
        }
        catch (err) {
            console.error('[CronJob] expireJobs error:', err);
        }
    });
}
//# sourceMappingURL=expireJobs.js.map