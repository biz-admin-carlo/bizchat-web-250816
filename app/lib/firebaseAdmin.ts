import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let app;

try {
  // Build service account config from environment variables
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  if (
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    throw new Error("Missing Firebase service account environment variables");
  }

  const firebaseConfig = {
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // optional, add if you’re using RTDB
  };

  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error);
  throw error;
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
