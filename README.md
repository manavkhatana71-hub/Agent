# EMI AI — Web MVP

A starter web app using HTML/CSS/JavaScript, Node.js, Groq API and Firebase Authentication + Cloud Firestore.

## 1. Requirements
- Node.js 18+
- A Groq API key
- Firebase project `emi-server` with Authentication and Cloud Firestore enabled

## 2. Configure Firebase
The Firebase web config supplied in `public/app.js` is already inserted.
In Firebase Console:
1. Authentication → Sign-in method → enable Email/Password and Google.
2. Firestore Database → create a database.
3. Firestore Rules → publish the rules from `firebase.rules.example`.
4. Authentication → Settings → Authorized domains → add your deployed domain.

The Firebase web API key is not a server secret. Firestore Security Rules are essential.

## 3. Configure Groq
Copy `.env.example` to `.env` and set your own Groq API key:
`GROQ_API_KEY=...`

Never put the Groq key in frontend JavaScript or commit `.env`.

## 4. Run locally
```bash
npm install
npm start
```
Open `http://localhost:3000`.

## 5. Current MVP features
- EMI AI chat powered by Groq (Llama model configured on server)
- Email/password and Google sign-in
- Firestore chat history per signed-in user
- Generate project files using `### filename` followed by a fenced code block
- Download detected generated files as a ZIP

## 6. Important limitations / next phase
This is the first web MVP, not the complete autonomous phone assistant.
- The model can generate files as text; the ZIP button packages files it returned in the specified format.
- This web app cannot silently open or install Android apps. That requires a separate Java Android app, explicit user action/permissions, and Android-supported intents. Play Store installation normally requires user confirmation.
- Background Android operation requires a foreground service and a persistent notification; Android may restrict background activity launches.
- Do not execute model-generated code on the server. Review files before running.
- Add production CORS allowlisting, stronger rate limits, quotas, abuse protection, and monitoring before public deployment.
- Firestore rules in `firebase.rules.example` are a starting point; test them in Firebase Rules Playground before production.
