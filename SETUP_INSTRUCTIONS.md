# Supabase Google Authentication Setup

## Error Fix: redirect_uri_mismatch

The error you're seeing (`Error 400: redirect_uri_mismatch`) occurs because the redirect URI used by Supabase is not registered in your Google Cloud Console project.

## Steps to Fix

1. **Register the Correct Redirect URI in Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your project
   - Go to "APIs & Services" > "Credentials"
   - Find your OAuth 2.0 Client ID and click to edit it
   - Add the following URL to the "Authorized redirect URIs" section:
     ```
     https://habkcshdrtzrtwmvpeby.supabase.co/auth/v1/callback
     ```
   - Save your changes

2. **Configure Supabase Authentication:**
   - Go to your [Supabase Dashboard](https://app.supabase.io/)
   - Navigate to your project
   - Go to "Authentication" > "Providers"
   - Enable Google provider
   - Enter your Google OAuth credentials (Client ID and Client Secret)
   - Save your changes

3. **Update Environment Variables:**
   Make sure your `.env.local` file has the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```

## Added Quiz Data

We've added three quizzes to the application:
1. Personal Growth Fundamentals (Easy)
2. Professional Communication Skills (Medium)
3. Leadership Principles (Hard)

These quizzes will be loaded directly from the seed data if the database connection fails, so you can test the application without setting up the database first.

## Authentication Flow

The authentication flow now works as follows:
1. User clicks "Sign in with Google"
2. They are redirected to Google's authentication page
3. After successful authentication, Google redirects to the Supabase callback URL
4. Supabase processes the authentication and redirects back to your application
5. The middleware refreshes the session
6. The user is now authenticated and can access the quizzes

## Troubleshooting

If you continue to experience issues:
1. Check that the redirect URI is exactly as shown above
2. Verify that your Google OAuth credentials are correctly configured in Supabase
3. Make sure your application is using the latest Supabase JavaScript client
4. Clear your browser cookies and try again 