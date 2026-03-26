# Magic Lair League Tournament - Setup and Deploy Guide

A modern single-page React app for a local One Piece TCG league, styled with Tailwind CSS and animated with Framer Motion.

## Tech Stack

- React (functional components)
- Tailwind CSS
- Framer Motion
- lucide-react
- No backend (mock JSON data)

---

## 1) Prerequisites

Install:

- Node.js 20+ (recommended)
- npm 10+ (comes with Node)
- Git

Check versions:

```bash
node -v
npm -v
git --version
```

---

## 2) Local Installation (Vite)

If you are starting fresh, create a Vite React app first:

```bash
npm create vite@latest optcg-local-league -- --template react
cd optcg-local-league
```

Then install dependencies:

```bash
npm install
npm install framer-motion lucide-react
```

Install and configure Tailwind CSS (Vite + Tailwind v4):

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Update `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

In `src/index.css`, add:

```css
@import "tailwindcss";
```

Copy the project files:

- `src/App.jsx`
- `src/data/mockLeagueData.js`

---

## 3) Run the App Locally

Start dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

---

## 4) Deploy to Netlify (Simple)

You can deploy in two easy ways.

### Option A: Connect GitHub Repo (Recommended)

1. Push code to GitHub.
2. Go to [Netlify](https://app.netlify.com/).
3. Click **Add new site** -> **Import an existing project**.
4. Select your Git provider and repo.
5. Use these settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **Deploy site**.

Netlify will auto-deploy on every push to your selected branch.

### Option B: Manual Deploy (Fastest one-off)

1. Build locally:

```bash
npm run build
```

2. In Netlify dashboard, create a new site and drag/drop your `dist` folder.

---

## 5) SPA Routing Note (Optional but Recommended)

This app is a single-page app. If you later add React Router, include this file to prevent 404s on refresh:

Create `public/_redirects`:

```txt
/*    /index.html   200
```

No extra config is needed for the current tab-based UI (no URL routes).

---

## 6) Useful Commands

```bash
# install dependencies
npm install

# run in development
npm run dev

# production build
npm run build

# preview production build
npm run preview
```

---

## 7) Troubleshooting

- If `npx tailwindcss init -p` fails, you are likely on Tailwind v4. Use `@tailwindcss/vite` and `@import "tailwindcss";` instead.
- If Tailwind styles do not apply, verify `vite.config.js` includes the `tailwindcss()` plugin.
- If Netlify build fails, check Node version in Netlify site settings (use Node 20).
- If icons/animations fail, verify both `lucide-react` and `framer-motion` are installed.
