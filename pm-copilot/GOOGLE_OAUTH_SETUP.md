# Setting up Google OAuth + Gmail for PM Copilot

## Step 1 — Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "New Project" → name it "PM Copilot"
3. Select it from the top dropdown

## Step 2 — Enable Gmail API

1. Go to "APIs & Services" → "Library"
2. Search "Gmail API" → Click Enable

## Step 3 — Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the consent screen first:
   - User type: External
   - App name: PM Copilot
   - Support email: your email
   - Add scope: .../auth/gmail.readonly
   - Add test user: your Gmail address
4. Back to Create Credentials → OAuth client ID:
   - Application type: Web application
   - Name: PM Copilot Local
   - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
5. Click Create → Copy Client ID and Client Secret

## Step 4 — Update .env.local

Add these lines to pm-copilot/.env.local:

```
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_SECRET=any_random_string_32_chars  
NEXTAUTH_URL=http://localhost:3000

# Database (SQLite for local dev)
DATABASE_URL=file:./dev.db
```

Generate NEXTAUTH_SECRET with:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

## Step 5 — Set up the database

In your terminal inside pm-copilot/:

```bash
npx prisma db push
```

This creates dev.db with all the tables.

## Step 6 — Restart and test

```bash
npm run dev
```

1. Open http://localhost:3000
2. You'll be redirected to /login
3. Click "Continue with Google"
4. Sign in with your Google account
5. Go to Settings → Connect Gmail
6. Your inbox will appear in the personal dashboard

## For Vercel deployment later

Add the same env vars in Vercel dashboard.
Change NEXTAUTH_URL to your production URL.
Change DATABASE_URL to a Postgres connection string (e.g. Supabase free tier).
Add your production URL to Google OAuth authorized redirect URIs.
