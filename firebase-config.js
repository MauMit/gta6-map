/* Firebase web config for Google sign-in + cloud progress.
 *
 * Paste the object from Firebase console > Project settings > Your apps > Web app.
 * These values are NOT secrets: they identify the project, and access is
 * protected by the Firestore rules in firestore.rules. See SETUP.md.
 *
 * Leave it as null and the map still works, saving progress in this browser only.
 */
window.FIREBASE_CONFIG = null;

/* Example:
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
*/
