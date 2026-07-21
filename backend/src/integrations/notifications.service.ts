import { Resend } from 'resend';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export async function sendEmail(to: string, title: string, message: string) { if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_FROM) return false; await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.NOTIFICATION_FROM, to, subject: title, text: message }); return true; }
export async function sendPush(token: string, title: string, message: string) { if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return false; if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) }); await getMessaging().send({ token, notification: { title, body: message } }); return true; }
