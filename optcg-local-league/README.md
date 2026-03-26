# Magic Lair League

One Piece local league frontend (Vite + React + Tailwind + Framer Motion).

## Local development

1. Install dependencies:
   - `npm install`
2. Run dev server:
   - `npm run dev`

## Shared data for all users (free setup)

To make everyone see the same standings, this app uses **Netlify Blobs** through Netlify Functions.

Data is stored in one shared blob key and is available to all visitors of your Netlify site.

## Netlify deploy (free)

1. Connect repo to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Trigger deploy.

No external DB or paid add-on is required for basic usage.

## Local testing with functions

`npm run dev` runs only Vite frontend, not Netlify Functions.

To test shared state locally, run with Netlify CLI:

1. Install CLI: `npm install -g netlify-cli`
2. Start local Netlify runtime:
   - from repo root: `netlify dev`
   - or from app folder: `cd optcg-local-league && netlify dev`

This serves both frontend and `/.netlify/functions/*` endpoints used for shared state.
