/**
 * ============================================
 * JAWAD'S BIKE PARTS - FIREBASE CONFIGURATION
 * Professional E-Commerce Platform
 * ============================================
 */

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Admin email from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

console.log('✅ Firebase initialized successfully');

// Export for use in other files
window.firebaseApp = {
    auth,
    db,
    storage,
    ADMIN_EMAIL
};
