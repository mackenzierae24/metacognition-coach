# ◈ Metacognition Coach

**Your story is real. It's also not the whole story.**

An AI-powered metacognition and differentiation tool that helps you explore the layers of your experience, separate thinking from feeling, and see through someone else's eyes.

![Metacognition Coach](https://img.shields.io/badge/Powered_by-Claude-blueviolet)

## What It Does

You share a raw experience — a rant, a conflict, a feeling you can't shake — and the app:

1. **Separates the streams** — identifies the multiple simultaneous things happening in one moment (the surface event, the subtext, the narrative you're building, the identity at stake)
2. **Maps four layers of metacognition** for each stream:
   - **Raw Experience** — the fused, undifferentiated moment
   - **Noticing** — catching yourself mid-experience
   - **Reflection** — seeing patterns and frameworks
   - **Meta-Awareness** — watching the watcher
3. **Differentiates thinking from feeling** — catches when "I feel like they don't care" is actually a thought, not a feeling
4. **Runs an Empathy Challenger** — voices the other person's inner world with genuine empathy, not to invalidate yours, but to expand the frame
5. **Reveals the Third Option** — the path forward that only becomes visible through differentiation

## Quick Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
cd metacognition-coach
git init
git add .
git commit -m "Initial commit"
gh repo create metacognition-coach --public --push
```

Or create a repo at [github.com/new](https://github.com/new) and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/metacognition-coach.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `metacognition-coach` repository
3. Vercel auto-detects Vite — no config changes needed
4. **Add your environment variable:**
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key from [console.anthropic.com](https://console.anthropic.com/)
5. Click **Deploy**

That's it. You'll have a live URL in ~60 seconds.

### Step 3: Share

Your app will be live at `https://metacognition-coach-xxx.vercel.app`. Share it with anyone you want to experiment with.

## Local Development

```bash
# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# For local dev, run the Vercel dev server (handles the serverless function)
npx vercel dev

# Or if you just want the frontend (API calls won't work without the backend)
npm run dev
```

## Project Structure

```
metacognition-coach/
├── api/
│   └── analyze.js          # Vercel serverless function — proxies Anthropic API
├── src/
│   ├── App.jsx              # Main application
│   └── main.jsx             # React entry point
├── index.html               # HTML shell
├── package.json
├── vite.config.js
├── vercel.json              # Routing config
├── .env.example             # Template for API key
└── .gitignore
```

## How It Works

- **Frontend:** React + Vite. No component library — hand-crafted UI.
- **Backend:** Single Vercel serverless function (`/api/analyze`) that proxies requests to Claude, keeping your API key secure server-side.
- **AI:** Claude Sonnet 4 with a detailed system prompt that enforces the metacognition + differentiation framework, thinking/feeling separation, and empathetic challenger generation.

## Cost

Each analysis uses one Claude Sonnet API call (~2,000-4,000 output tokens). At current pricing that's roughly $0.02–0.05 per analysis. A typical session exploring 10 experiences would cost under $0.50.

## The Framework

> *Metacognition without empathy is just a more elegant ego.*
> *Empathy without metacognition is just losing yourself in someone else.*
> *Together, they are differentiation — the ability to be fully yourself while fully seeing another.*

## License

MIT
