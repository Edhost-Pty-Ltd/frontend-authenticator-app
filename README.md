# Authen app

This folder is the Authen app. The API lives in `backend/`. See the root [README](../README.md) for what the project does, the preview account, and how to run the server.

## Run

```bash
npm install
npm run web
```

- `npm start` opens the Expo dev tools
- `npm run ios` opens the iOS simulator
- `npm run android` opens the Android emulator

Sign in with `avery@authen.app` / `AuthenKey1`. Any 6-digit sign-in code works except `000000` and `111111`.

Screens call the auth client in `src/services/authClient.ts`. That client is a local stand-in today. Replace the export there when the screens should call the API on port 4000.
