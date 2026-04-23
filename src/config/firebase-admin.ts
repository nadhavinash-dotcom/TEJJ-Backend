import admin from 'firebase-admin';

let initialized = false;

export function initFirebaseAdmin(): void {
  if (initialized) return;

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountBase64) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 not set — Firebase Admin unavailable');
    return;
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  initialized = true;
  console.log('Firebase Admin initialized');
}

export { admin };
