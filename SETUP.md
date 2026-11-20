# Turning on "Sign in with Google"

Sign-in and cloud saves use Firebase (free "Spark" plan is plenty). Do this once.

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and sign in with your Google account.
2. **Create a project** → give it a name (e.g. `gta6-map`) → you can turn Google Analytics **off** → **Create project**.

## 2. Turn on Google sign-in

1. Left menu: **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Google** → switch **Enable** on → pick your support email → **Save**.
3. **Settings** tab → **Authorized domains** → **Add domain** → enter your Pages domain,
   e.g. `YOUR-GITHUB-USERNAME.github.io` → **Add**.

## 3. Create the database

1. Left menu: **Build → Firestore Database → Create database**.
2. Pick a location near you → start in **production mode** → **Create**.
3. Open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules), and click **Publish**.
   (These rules let each signed-in person read and write only their own progress.)

## 4. Connect the website

1. Click the gear icon → **Project settings** → scroll to **Your apps** → click the **`</>`** (Web) icon.
2. Give it a nickname (e.g. `map`), leave Firebase Hosting **unchecked**, click **Register app**.
3. Copy the `firebaseConfig = { ... }` object it shows.
4. Open [`firebase-config.js`](firebase-config.js) and replace `window.FIREBASE_CONFIG = null;` with:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "…",
     authDomain: "…firebaseapp.com",
     projectId: "…",
     storageBucket: "…",
     messagingSenderId: "…",
     appId: "…"
   };
   ```

5. Commit and push (or edit the file directly on GitHub). The Pages workflow redeploys in a minute or two.

These config values are not passwords; they only identify your Firebase project.
Your data is protected by the Firestore rules from step 3.

## Troubleshooting

- **`auth/unauthorized-domain`** — add your `*.github.io` domain in Authentication → Settings → Authorized domains.
- **`permission-denied`** when saving — the Firestore rules from step 3 were not published.
- **Popup closes immediately / blocked** — allow popups for the site; the button falls back to a full-page redirect when popups are blocked.
- Testing locally: `localhost` is already an authorized domain. Serve the folder with any static server
  (for example `npx serve .`) — opening `index.html` directly from disk will not work with sign-in.
