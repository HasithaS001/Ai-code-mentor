# Gemini API Setup Instructions

## Getting a Gemini API Key

1. Go to the Google AI Studio: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

## Setting up the API Key in the project

Create a `.env.local` file in the root directory of the project with the following content:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the API key you obtained from Google AI Studio.

## Important Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore` to prevent accidental commits
- For production deployment, set the environment variable in your hosting platform
