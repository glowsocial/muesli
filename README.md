# Muesli

Muesli records meetings in your browser and turns them into clean, structured notes.
You run your own copy, with your own OpenAI key, so your recordings stay in your own storage.

## How it works

1. Open the app on any device and sign in.
2. Pick a mode (Meeting Notes, Voice Memo, Brain Dump or Content Draft) and give the recording a title.
3. Press **Start Recording**. Your browser records the microphone, with nothing to install.
4. Press **Stop Recording**. The audio uploads to your Vercel Blob storage.
5. Press **Generate Notes**. OpenAI transcribes the audio, then OpenAI writes the notes.
6. Download the notes as a Markdown (`.md`) file, ready for Obsidian or any notes app.

## What you need

- An OpenAI API key, from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
- A free Vercel account, from [vercel.com](https://vercel.com).

That is all.

## Setup

1. Copy this repository to your own GitHub account (fork it, or clone it and push it).
2. In Vercel, go to [vercel.com/new](https://vercel.com/new) and import your copy.
3. In your Vercel project, open the **Storage** tab, choose **Create**, then **Blob**, choose **Private** access, and connect it to the project.
   This sets `BLOB_READ_WRITE_TOKEN` for you.
4. In **Settings**, then **Environment Variables**, add these four:
   - `OPENAI_API_KEY`: your OpenAI key.
   - `AUTH_SECRET`: a long random string. Run `npx auth secret` to make one.
   - `AUTH_EMAIL`: the email you will sign in with.
   - `AUTH_PASSWORD`: the password you will sign in with.
5. Redeploy, so the new variables take effect.
6. Open your app's address and sign in with the email and password you chose.

The full list of variables, with a note on each, is in `.env.example`.

## Run it on your own computer

You need [Node.js](https://nodejs.org) installed.

```bash
git clone <your copy's URL>
cd muesli
npm install
cp .env.example .env.local
```

Fill in `.env.local` with the same values as above.
For `BLOB_READ_WRITE_TOKEN`, copy the value from your Vercel project's environment variables.
Then start the app:

```bash
npm run dev
```

It opens at [http://localhost:3000](http://localhost:3000).

## Optional: Google sign-in and calendar

With Google turned on, you can sign in with Google, see today's calendar events, and add notes to an event.
It needs a Postgres database as well.

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials), create an OAuth client of the type "Web application".
2. Add `https://<your-app-address>/api/auth/callback/google` as an authorized redirect URI.
3. Turn on the Google Calendar API for the same Google Cloud project.
4. Create a Postgres database (Vercel's Storage tab can add one), and copy its connection string.
5. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `DATABASE_URL`. Set all three, or none.
6. Create the database tables once, from your computer, with `DATABASE_URL` set in `.env.local`:

```bash
npx prisma db push
```

When the Google variables are not set, the app shows only the email and password sign-in and uses no database.

## Good to know

- Recordings and notes are stored in your own Vercel Blob store with private access.
  Only someone signed in to your copy of the app can download them.
- Each copy of the app has one login: the email and password you set.
- The notes model is set in `lib/ai.ts`. To use a different OpenAI model, set `OPENAI_NOTES_MODEL`.

## Cost

You pay OpenAI for your own usage, and nothing to anyone else.
Transcription uses `gpt-transcribe`, listed at $0.0045 per minute of audio on the [OpenAI pricing page](https://developers.openai.com/api/docs/pricing) (checked October 5, 2026).
Writing the notes is billed per token at the price of the notes model you use; see the same page.
Vercel's free plan and its Blob storage are enough for personal use.
Check [Vercel's pricing page](https://vercel.com/pricing) for the current limits.

## License

MIT. See [LICENSE](LICENSE).
