import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function initializeFirebaseAdmin() {
  // If already initialized, return existing instances
  if (_app && _db && _auth) {
    return { app: _app, db: _db, auth: _auth };
  }

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
    databaseURL: process.env.FIREBASE_DATABASE_URL, // optional, add if you're using RTDB
  };

  _app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  _db = getFirestore(_app);
  _auth = getAuth(_app);

  console.log("✅ Firebase Admin initialized successfully");
  return { app: _app, db: _db, auth: _auth };
}

// Lazy initialization - only initialize when actually accessed
function getAppInstance(): App {
  if (!_app) {
    initializeFirebaseAdmin();
  }
  return _app!;
}

function getDbInstance(): Firestore {
  if (!_db) {
    initializeFirebaseAdmin();
  }
  return _db!;
}

function getAuthInstance(): Auth {
  if (!_auth) {
    initializeFirebaseAdmin();
  }
  return _auth!;
}

// Create proxy objects that intercept property access for lazy initialization
export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const dbInstance = getDbInstance();
    const value = (dbInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(dbInstance);
    }
    return value;
  },
}) as Firestore;

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const authInstance = getAuthInstance();
    const value = (authInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(authInstance);
    }
    return value;
  },
}) as Auth;

// Export app as a proxy for consistency
export const app = new Proxy({} as App, {
  get(_target, prop) {
    const appInstance = getAppInstance();
    const value = (appInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(appInstance);
    }
    return value;
  },
}) as App;
