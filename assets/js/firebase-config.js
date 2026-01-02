/**
 * ============================================
 * JAWAD'S BIKE PARTS - FIREBASE CONFIGURATION
 * Professional E-Commerce Platform
 * ============================================
 */

// Firebase configuration - তুমি .env থেকে এইগুলো নিয়ে আসবে
// এখানে placeholder দিয়ে দিলাম, তুমি তোমার Firebase credentials দিয়ে replace করবে
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Admin email (এটা .env থেকে নাও)
const ADMIN_EMAIL = "admin@jawadsbikeparts.com"; // তোমার admin email এখানে দাও

console.log('✅ Firebase initialized successfully');

// Export for use in other files
window.firebaseApp = {
    auth,
    db,
    storage,
    ADMIN_EMAIL
};
