const admin = require("firebase-admin");

let initialized = false;

const initFirebase = () => {
  if (initialized) return;
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
  initialized = true;
};

const verifyFirebaseToken = async (idToken) => {
  initFirebase();
  if (!initialized) {
    throw new Error("Firebase admin is not configured");
  }
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseToken };
