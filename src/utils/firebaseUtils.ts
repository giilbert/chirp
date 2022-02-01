import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFile } from 'fs/promises';

const credentials = {
  projectId: process.env.firebase_PROJECT_ID,
  privateKey: process.env.firebase_PRIVATE_KEY,
  clientEmail: process.env.firebase_CLIENT_EMAIL,
};

if (getApps().length === 0)
  initializeApp({
    credential: cert(credentials),
    databaseURL: process.env.firebase_STORAGE_URL,
  });

export const storageBucket = getStorage().bucket(
  process.env.firebase_STORAGE_URL
);
