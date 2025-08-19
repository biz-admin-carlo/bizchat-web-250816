import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

const serviceKeyPath = path.resolve(process.cwd(), "serviceKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, "utf8"));

const firebaseConfig = {
  credential: cert(serviceAccount),
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
