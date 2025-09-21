# Mindfulme | AI-Powered Mental Health

An AI-powered platform for mental wellness, offering personalized predictions, emotion detection, and AI coaching for meditation and well-being.

## Features

- **Wellness Predictor**: Get AI-powered analysis of your well-being.
- **AI Therapist & Friend**: Chat with an empathetic AI coach.
- **Guided Breathing**: Simple exercises to reduce stress.
- **AI Music Scapes**: Personalized soundscapes based on your mood.
- **Guided Journal**: A space to explore your thoughts with AI prompts.
- **And much more...**

## Tech Stack

- **Framework**: React (configured for Next.js deployment)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI**: Google Gemini API

---

## Deploying to Vercel

Follow these steps to deploy your own instance of Mindfulme using Vercel.

### 1. Push to GitHub

Push your project code to a new GitHub repository.

### 2. Connect Your Repository to Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click "**Add New...**" -> "**Project**".
2.  Select "**Import Git Repository**" and connect your GitHub account if you haven't already.
3.  Import the repository you created in the previous step.
4.  Vercel will automatically detect that you are using Next.js and will configure the project settings for you. You can leave the "Framework Preset" as "Next.js".

### 3. Add Environment Variables

1.  In your new Vercel project's dashboard, go to the "**Settings**" tab and then click on "**Environment Variables**".
2.  Add the environment variables listed in the `.env.example` file. You will need to create a Google Cloud project to get your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and a Google AI Studio account for your `API_KEY`.
3.  Ensure the variables are available for all environments (Production, Preview, and Development).

**Required Variables:**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `API_KEY`
- `NEXTAUTH_SECRET` (if using NextAuth)
- `DATABASE_URL` (if you connect a database)
- `NEXTAUTH_URL` (Vercel sets this automatically for production)

### 4. Deploy

Once the environment variables are set, go to the "**Deployments**" tab and trigger a new deployment. Vercel will build and deploy your application. Subsequent pushes to your main branch will automatically trigger new deployments.
