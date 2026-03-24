# 🥣 Muesli — AI Meeting Notes

Record meetings from any device, get AI-powered structured notes. Built with the Swiss Alps in mind.

**Stack**: Next.js · Vercel · Vercel Blob · OpenAI Whisper · Claude  
**Domain**: [mueslirecorder.com](https://mueslirecorder.com)

---

## How It Works

1. Open the app on any device (phone, laptop, tablet)
2. Name your recording, hit **Start Recording**
3. Your browser captures mic audio (no installs needed)
4. Hit **Stop** → audio uploads to Vercel Blob storage
5. Click **Generate Notes** → Whisper transcribes → Claude generates structured markdown notes
6. Download your notes as `.md` files (Obsidian-compatible)

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/glowsocial/muesli.git
cd muesli
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to get it |
|----------|----------------|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| `BLOB_READ_WRITE_TOKEN` | Auto-set when you add Blob storage in Vercel (see below) |

### 3. Deploy to Vercel

1. Push to GitHub (already done: `glowsocial/muesli`)
2. Go to [vercel.com/new](https://vercel.com/new) → Import `glowsocial/muesli`
3. Add environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`)
4. Deploy

### 4. Add Blob Storage

1. In Vercel dashboard → your Muesli project → **Storage** tab
2. Click **Create** → **Blob**
3. Connect it to your project
4. This auto-sets `BLOB_READ_WRITE_TOKEN` — no manual config needed

### 5. Connect Domain

In Vercel → **Settings** → **Domains** → add `mueslirecorder.com`

Then in **Namecheap** (or your DNS provider):

| Type | Host | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

### 6. Add Auth (TODO)

Auth is not yet implemented. The plan is to use **NextAuth.js** with email magic links:

1. `npm install next-auth`
2. Create `/app/api/auth/[...nextauth]/route.ts`
3. Configure a provider (email magic link via Resend, or Google OAuth)
4. Add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` env vars
5. Wrap pages with session checks
6. Protect API routes with `getServerSession()`

This will be added before the trip. For now, the app is unprotected — don't share the URL publicly until auth is in place.

## Local Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

Note: Blob storage requires the `BLOB_READ_WRITE_TOKEN` env var, which is auto-injected in Vercel. For local dev, you can grab the token from your Vercel project's environment variables and add it to `.env.local`.

## Cost Per Meeting

| Service | Cost |
|---------|------|
| Whisper transcription | ~$0.006/minute |
| Claude note generation | ~$0.03/session |
| **30-min meeting** | **~$0.21** |
| Vercel hosting | Free tier |
| Blob storage | Free tier (100MB) |

## Project Structure

```
app/
├── page.tsx                  # Main recording UI
├── globals.css               # Swiss Alps design system
├── layout.tsx                # Root layout
└── api/
    ├── upload/route.ts       # Receive & store audio
    ├── recordings/route.ts   # List recordings
    ├── notes/route.ts        # List notes
    └── process/route.ts      # Whisper → Claude pipeline
```

## Roadmap

- [x] Browser-based mic recording
- [x] Whisper transcription
- [x] Claude note generation
- [x] Vercel Blob storage
- [x] Swiss Alps design
- [ ] Auth (NextAuth.js magic links)
- [ ] Notes viewer (render markdown in-app)
- [ ] Recording history with search
- [ ] Mobile-optimized recording UX
- [ ] Chrome extension (tab audio capture for Meet/Zoom)
- [ ] Google Calendar integration
