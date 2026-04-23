"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const firebase_admin_1 = require("./config/firebase-admin");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const workers_1 = __importDefault(require("./routes/workers"));
const employers_1 = __importDefault(require("./routes/employers"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const applications_1 = __importDefault(require("./routes/applications"));
const dispatch_1 = __importDefault(require("./routes/dispatch"));
const ratings_1 = __importDefault(require("./routes/ratings"));
const interviews_1 = __importDefault(require("./routes/interviews"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const whisper_1 = __importDefault(require("./routes/whisper"));
const voice_1 = __importDefault(require("./routes/voice"));
const admin_1 = __importDefault(require("./routes/admin"));
const market_rates_1 = __importDefault(require("./routes/market-rates"));
const referrals_1 = __importDefault(require("./routes/referrals"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const app = (0, express_1.default)();
const PORT = process.env.API_PORT || 4000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://tejj.app', 'https://admin.tejj.app']
        : true,
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined'));
// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
// API routes
app.use('/auth', auth_1.default);
app.use('/workers', workers_1.default);
app.use('/employers', employers_1.default);
app.use('/jobs', jobs_1.default);
app.use('/applications', applications_1.default);
app.use('/dispatch', dispatch_1.default);
app.use('/ratings', ratings_1.default);
app.use('/interviews', interviews_1.default);
app.use('/notifications', notifications_1.default);
app.use('/whisper', whisper_1.default);
app.use('/voice', voice_1.default);
app.use('/admin', admin_1.default);
app.use('/market-rates', market_rates_1.default);
app.use('/referrals', referrals_1.default);
app.use('/analytics', analytics_1.default);
// 404
app.use((_, res) => res.status(404).json({ success: false, error: 'Not found' }));
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});
async function start() {
    await (0, database_1.connectDatabase)();
    (0, firebase_admin_1.initFirebaseAdmin)();
    // Start cron jobs
    const { startExpireJobsCron } = await Promise.resolve().then(() => __importStar(require('./jobs/expireJobs')));
    const { startSendRemindersCron } = await Promise.resolve().then(() => __importStar(require('./jobs/sendReminders')));
    const { startResetMonthlyPostsCron } = await Promise.resolve().then(() => __importStar(require('./jobs/resetMonthlyPosts')));
    startExpireJobsCron();
    startSendRemindersCron();
    startResetMonthlyPostsCron();
    app.listen(PORT, () => console.log(`TEJJ API running on port ${PORT}`));
}
start().catch(console.error);
exports.default = app;
//# sourceMappingURL=index.js.map