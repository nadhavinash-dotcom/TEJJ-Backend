"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startResetMonthlyPostsCron = startResetMonthlyPostsCron;
const node_cron_1 = __importDefault(require("node-cron"));
const Employer_1 = require("../models/Employer");
// Run at midnight on 1st of every month — reset monthly post counts
function startResetMonthlyPostsCron() {
    node_cron_1.default.schedule('0 0 1 * *', async () => {
        try {
            const result = await Employer_1.Employer.updateMany({}, { $set: { monthly_posts_used: 0 } });
            console.log(`[CronJob] Reset monthly posts for ${result.modifiedCount} employers`);
        }
        catch (err) {
            console.error('[CronJob] resetMonthlyPosts error:', err);
        }
    });
}
//# sourceMappingURL=resetMonthlyPosts.js.map