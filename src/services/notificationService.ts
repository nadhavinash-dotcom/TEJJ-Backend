import { admin } from '../config/firebase-admin';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { Employer } from '../models/Employer';
import { Worker } from '../models/Worker';

interface FlashJobPayload {
  job_id: string;
  job_title: string;
  pay_rate: number;
  skill: string;
}

export const notificationService = {
  async sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data: data || {},
      });
    } catch (err) {
      console.error('FCM general send error:', err);
    }
  },

  async sendFlashJobNotification(fcmToken: string, workerId: string, payload: FlashJobPayload): Promise<void> {
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: '⚡ Flash Job Available',
          body: `${payload.skill} · ₹${payload.pay_rate} · Apply Now`,
        },
        data: {
          type: 'FLASH_JOB',
          job_id: payload.job_id,
        },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
    } catch (err) {
      console.error('FCM send error:', err);
    }
  },

  async notifyMatchConfirmed(matchId: string, employerId: string): Promise<void> {
    const employer = await Employer.findById(employerId);
    if (!employer) return;

    const user = await User.findOne({ _id: employer.user_id });
    if (!user?.fcm_token) return;

    try {
      await admin.messaging().send({
        token: user.fcm_token,
        notification: {
          title: '✅ Worker Matched!',
          body: 'A worker has accepted your job. View details.',
        },
        data: { type: 'MATCH_CONFIRMED', match_id: matchId },
      });
    } catch {}
  },

  async sendArrivalReminder(workerId: string, propertyName: string, matchId: string): Promise<void> {
    const worker = await Worker.findById(workerId);
    if (!worker) return;
    const user = await User.findOne({ _id: worker.user_id });
    if (!user?.fcm_token) return;

    try {
      await admin.messaging().send({
        token: user.fcm_token,
        notification: {
          title: '⏰ 30 Minute Mein Shift!',
          body: `${propertyName} — Abhi chalo!`,
        },
        data: { type: 'ARRIVAL_REMINDER', match_id: matchId },
      });
    } catch {}
  },

  async createInAppNotification(params: {
    user_id: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    deep_link?: string;
  }): Promise<void> {
    await Notification.create(params);
  },
};
