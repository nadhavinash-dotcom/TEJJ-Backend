"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
exports.initFirebaseAdmin = initFirebaseAdmin;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
let initialized = false;
function initFirebaseAdmin() {
    if (initialized)
        return;
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
        console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 not set — Firebase Admin unavailable');
        return;
    }
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    initialized = true;
    console.log('Firebase Admin initialized');
}
//# sourceMappingURL=firebase-admin.js.map