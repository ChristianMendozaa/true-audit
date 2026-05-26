'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function isFirebaseWebConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export function isFirebaseAuthMode() {
  return process.env.NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE === 'firebase';
}

export function isFirebaseDataMode() {
  return process.env.NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE === 'firebase' || isFirebaseAuthMode();
}

export function getFirebaseClientApp() {
  if (!isFirebaseWebConfigured()) return null;
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length > 0
    ? getApp()
    : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    });
  return cachedApp;
}

export function getFirebaseClientAuth() {
  if (!isFirebaseAuthMode()) return null;
  const app = getFirebaseClientApp();
  if (!app) return null;
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(app);
  return cachedAuth;
}

export function getFirebaseClientDb() {
  if (!isFirebaseDataMode()) return null;
  const app = getFirebaseClientApp();
  if (!app) return null;
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(app);
  return cachedDb;
}
