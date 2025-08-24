# Github connection

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/chestergodalive-2654s-projects/v0-github-connection)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/KmwCToWfoCE)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/chestergodalive-2654s-projects/v0-github-connection](https://vercel.com/chestergodalive-2654s-projects/v0-github-connection)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/KmwCToWfoCE](https://v0.app/chat/projects/KmwCToWfoCE)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

---

## Android (local build & install)

- Ensure an Android device is connected with USB debugging enabled or an emulator is running.
- If an older app with the same `applicationId` is present, uninstall it first:

```bash
adb uninstall com.mrcomic || true
```

- Build and install the debug APK:

```bash
cd android
./gradlew :app:installDebug
```

- Run the app from the launcher. The flow should be: splash background → video splash → welcome → tap "Начать" → main interface.
