# Google Drive Integration Setup

This guide will walk you through setting up Google Drive integration for your trip planner application.

## Prerequisites

- A Google Cloud Platform account
- Your trip planner application running locally or deployed

## Step 1: Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to APIs & Services > Library
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application" as the application type
4. Configure the OAuth consent screen if prompted
5. Add authorized redirect URIs:
   - For local development: `http://localhost:5173`
   - For production: `https://your-domain.com`
6. Save and copy the Client ID (Client Secret is not needed for this integration)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173

# For production deployment
# VITE_GOOGLE_REDIRECT_URI=https://your-domain.com
```

**Note:** Client Secret is not required for this integration as we use the implicit OAuth flow for security.

## Step 4: Update OAuth Consent Screen

1. Go to APIs & Services > OAuth consent screen
2. Add your application name and developer contact information
3. Add authorized domains (for production)
4. Set up scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.email`

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Open your application in the browser
3. Click "Connect to Google Drive" in the header
4. Complete the OAuth flow in the popup window
5. Your trip data should now sync with Google Drive

## How It Works

- **Authentication**: Uses OAuth 2.0 implicit flow (no client secret required)
- **File Storage**: Trip data is stored as `trip-planner-data.json` in your Google Drive
- **Sync Strategy**: The app automatically syncs when you authenticate and checks for changes every 30 seconds
- **Conflict Resolution**: Currently prioritizes remote changes over local ones
- **Privacy**: Data is stored in your personal Google Drive, not accessible to other users

## Troubleshooting

### "Authentication failed" Error
- Verify your Client ID is correct
- Check that the redirect URI matches exactly (including http/https)
- Ensure the Google Drive API is enabled in your project

### "Popup blocked" Error
- Allow popups for your application domain
- Try using a different browser or incognito mode

### "Not authenticated" Error
- Clear your browser's localStorage and try logging in again
- Check that your OAuth credentials haven't expired

### "Cross-origin errors during authentication"
- This is normal behavior - the popup monitors URL changes to detect successful authentication
- Ensure your redirect URI is configured correctly in Google Cloud Console

## Security Notes

- **No Client Secret**: This implementation uses the implicit OAuth flow, which is secure for frontend applications
- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- For production, ensure your redirect URI uses HTTPS
- Tokens are stored in browser localStorage with expiration times

## Deployment

When deploying to production:

1. Set environment variables in your hosting platform
2. Update the `VITE_GOOGLE_REDIRECT_URI` to your production URL
3. Add your production domain to the OAuth consent screen
4. Test the OAuth flow on your production environment

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Google Cloud project configuration
3. Ensure all required APIs are enabled
4. Test with a fresh browser session
5. Make sure popups are allowed for your domain 