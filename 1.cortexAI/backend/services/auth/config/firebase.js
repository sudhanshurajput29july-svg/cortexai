import { initializeApp, getApps, cert } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.join(__dirname, "../serviceAccountKey.json");

let serviceAccount = null;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
} else if (fs.existsSync(keyPath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  } catch (err) {
    console.warn("Could not parse serviceAccountKey.json:", err.message);
  }
}

export const app =
  getApps().length > 0
    ? getApps()[0]
    : serviceAccount
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : initializeApp();