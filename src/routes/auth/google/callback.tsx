import { useEffect } from 'react';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/google/callback')({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Check for OAuth errors
      if (error) {
        console.error('OAuth error:', error);
        // Redirect back to home with error
        window.location.href = '/?error=' + encodeURIComponent(error);
        return;
      }

      // Verify state parameter
      const storedState = localStorage.getItem('oauth_state');
      if (!state || state !== storedState) {
        console.error('Invalid state parameter');
        window.location.href = '/?error=' + encodeURIComponent('invalid_state');
        return;
      }

      if (code) {
        try {
          // Exchange authorization code for access token
          const tokenResponse = await exchangeCodeForToken(code);

          if (tokenResponse.access_token) {
            // Store the token
            localStorage.setItem(
              'google_access_token',
              tokenResponse.access_token,
            );
            localStorage.removeItem('oauth_state');

            // Redirect back to home
            window.location.href = '/?success=true';
          }
        } catch (err) {
          console.error('Token exchange failed:', err);
          window.location.href =
            '/?error=' + encodeURIComponent('token_exchange_failed');
        }
      } else {
        window.location.href = '/?error=' + encodeURIComponent('no_code');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Processing Google OAuth callback...</p>
      </div>
    </div>
  );
}

async function exchangeCodeForToken(code: string) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const redirectUri = `${window.location.origin}/auth/google/callback`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  return await response.json();
}
