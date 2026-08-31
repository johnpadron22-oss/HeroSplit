# HeroSplit × YouTube Automation Agent

This directory is the integration layer between HeroSplit and the
[youtube-automation-agent](https://github.com/darkzOGx/youtube-automation-agent) —
an open-source AI pipeline that runs a YouTube channel end-to-end.

## How it works

```
HeroSplit workouts (DB)
        │
        ▼
  workout-to-content bridge   ← converts each workout into a YouTube content brief
        │
        ▼
  youtube-automation-agent    ← writes scripts, optimises SEO, generates thumbnails,
        │                         schedules & publishes to YouTube
        ▼
  HeroSplit API (/api/youtube-agent/*)   ← Express routes surfacing the agent to the UI
        │
        ▼
  YouTubeAgent page (/youtube-agent)    ← React dashboard for managing content
```

## Setup

### 1. Clone the agent

```bash
git clone https://github.com/darkzOGx/youtube-automation-agent.git ~/Desktop/youtube-automation-agent
```

### 2. Configure credentials

Inside the cloned agent repo:

```bash
cp config/credentials.example.json config/credentials.json
# Edit credentials.json — add your YouTube OAuth, OpenAI, Replicate keys
```

### 3. Set environment variables in HeroSplit `.env`

```env
# Path to the cloned agent repo (default: ~/Desktop/youtube-automation-agent)
AGENT_PATH=/home/you/Desktop/youtube-automation-agent

# HeroSplit public URL (for the agent to reference in CTAs)
HEROSPLIT_URL=https://herosplit.app

# Optional: override AI provider / models
YOUTUBE_AGENT_AI_PROVIDER=openai
YOUTUBE_AGENT_SCRIPT_MODEL=gpt-4o
YOUTUBE_AGENT_SEO_MODEL=gpt-4o-mini
```

### 4. Restart HeroSplit

```bash
npm run dev
```

Visit `/youtube-agent` in the app to see the dashboard.

## CLI usage

You can also run the agent directly from the command line:

```bash
cd youtube-agent
node herosplit-agent.js                           # status
node herosplit-agent.js --action=generate         # list all content briefs
node herosplit-agent.js --action=script --slug=one-punch-man
node herosplit-agent.js --action=seo    --slug=one-punch-man
```

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/youtube-agent/status` | Agent health & configuration |
| GET | `/api/youtube-agent/briefs?type=hero\|villain\|anime` | Content briefs for all workouts |
| GET | `/api/youtube-agent/suggestions?type=...` | AI-ranked content opportunities |
| POST | `/api/youtube-agent/generate/script` | Generate a script `{ slug }` |
| POST | `/api/youtube-agent/generate/seo` | Generate SEO metadata `{ slug }` |

All routes require authentication.

## Directory layout

```
youtube-agent/
├── README.md                        ← this file
├── package.json
├── herosplit-agent.js               ← main entry point & module export
├── config/
│   └── herosplit-channel.config.js  ← HeroSplit-specific channel config
└── bridge/
    └── workout-to-content.js        ← maps workout records → content briefs
```
