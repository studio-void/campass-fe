import { useCallback, useEffect, useState } from 'react';

console.log('ENV check:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

// Generate random state for CSRF protection
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

// Build OAuth authorization URL
function buildAuthUrl(clientId: string, redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    state: state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function useGoogleCalendar() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const [isReady, setReady] = useState(false);
  const [isAuthed, setAuthed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setError('Missing VITE_GOOGLE_CLIENT_ID');
      return;
    }

    // Check if we have a stored token
    const storedToken = localStorage.getItem('google_access_token');
    if (storedToken) {
      setToken(storedToken);
      setAuthed(true);
    }

    setReady(true);
  }, [clientId]);

  const signIn = useCallback(() => {
    if (!clientId) {
      setError('Missing client ID');
      return;
    }

    setError(null);

    const state = generateState();
    localStorage.setItem('oauth_state', state);

    const authUrl = buildAuthUrl(clientId, REDIRECT_URI, state);
    window.location.href = authUrl;
  }, [clientId]);

  const signOut = useCallback(() => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('oauth_state');
    setToken(null);
    setAuthed(false);
  }, []);

  const listUpcomingEvents = useCallback(
    async (maxResults = 5) => {
      if (!token) throw new Error('Not authorized');
      const url = new URL(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      );
      url.searchParams.set('timeMin', new Date().toISOString());
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('maxResults', String(maxResults));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Google API error: ${res.status}`);
      const data = await res.json();
      return data.items as any[];
    },
    [token],
  );

  return { isReady, isAuthed, error, signIn, signOut, listUpcomingEvents };
}
