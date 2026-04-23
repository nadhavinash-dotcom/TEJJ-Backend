import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { initFirebaseAdmin } from './config/firebase-admin';

// Routes
import authRoutes from './routes/auth';
import workerRoutes from './routes/workers';
import employerRoutes from './routes/employers';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import dispatchRoutes from './routes/dispatch';
import ratingsRoutes from './routes/ratings';
import interviewRoutes from './routes/interviews';
import notificationRoutes from './routes/notifications';
import whisperRoutes from './routes/whisper';
import voiceRoutes from './routes/voice';
import adminRoutes from './routes/admin';
import marketRatesRoutes from './routes/market-rates';
import referralsRoutes from './routes/referrals';
import analyticsRoutes from './routes/analytics';
import matchesRoutes from './routes/matches';
import crewPoolsRoutes from './routes/crew-pools';

const app = express();
const PORT = process.env.API_PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tejj.app', 'https://admin.tejj.app']
    : true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.use('/auth', authRoutes);
app.use('/workers', workerRoutes);
app.use('/employers', employerRoutes);
app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);
app.use('/dispatch', dispatchRoutes);
app.use('/ratings', ratingsRoutes);
app.use('/interviews', interviewRoutes);
app.use('/notifications', notificationRoutes);
app.use('/whisper', whisperRoutes);
app.use('/voice', voiceRoutes);
app.use('/admin', adminRoutes);
app.use('/market-rates', marketRatesRoutes);
app.use('/referrals', referralsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/matches', matchesRoutes);
app.use('/crew-pools', crewPoolsRoutes);

// 404
app.use((_, res) => res.status(404).json({ success: false, error: 'Not found' }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

async function start() {
  await connectDatabase();
  initFirebaseAdmin();

  // Start cron jobs
  const { startExpireJobsCron } = await import('./jobs/expireJobs');
  const { startSendRemindersCron } = await import('./jobs/sendReminders');
  const { startResetMonthlyPostsCron } = await import('./jobs/resetMonthlyPosts');
  startExpireJobsCron();
  startSendRemindersCron();
  startResetMonthlyPostsCron();

  app.listen(PORT, () => console.log(`TEJJ API running on port ${PORT}`));
}

start().catch(console.error);

export default app;
