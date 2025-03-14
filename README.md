# Persona Club Quiz Application

A quiz application built with Next.js, Supabase, and Tailwind CSS.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://habkcshdrtzrtwmvpeby.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   Replace the placeholder values with your actual Supabase keys.

4. Run the development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Environment Variables Error

If you see an error like:
```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!
```

Make sure:
1. You have created a `.env.local` file with the correct variables
2. You have restarted your development server after creating/updating the `.env.local` file
3. The environment variables are properly formatted (no spaces, quotes, etc.)
4. The variable names are exactly as shown above (especially `NEXT_PUBLIC_SUPABASE_ANON_KEY`, not `NEXT_PUBLIC_SUPABASE_KEY`)

You can verify your environment variables by running:
```bash
node scripts/check-env.js
```

### Google Authentication Error

If you see a "redirect_uri_mismatch" error when trying to sign in with Google:

1. Go to your Google Cloud Console
2. Navigate to your project's OAuth credentials
3. Add the following URL to the authorized redirect URIs:
   ```
   https://habkcshdrtzrtwmvpeby.supabase.co/auth/v1/callback
   ```

### Quiz Result Saving Error

If you see an error when trying to save quiz results, follow the instructions in `DATABASE_SETUP.md` to create the necessary database table.

## Features

- User authentication with Supabase
- Interactive quizzes with timer
- Progress tracking
- Leaderboard
- Responsive design

## Technologies

- Next.js
- Supabase
- Tailwind CSS
- TypeScript 