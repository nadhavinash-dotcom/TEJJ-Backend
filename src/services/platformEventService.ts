import { PlatformEvent } from '../models/PlatformEvent';

export async function logEvent(userId: string, eventType: string, metadata?: Record<string, unknown>) {
  try {
    await PlatformEvent.create({ user_id: userId, event_type: eventType, metadata: metadata ?? {} });
  } catch {
    // Non-fatal — don't throw
  }
}
