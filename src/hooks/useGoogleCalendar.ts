import { useCallback, useEffect, useRef, useState } from 'react';

console.log('ENV check:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

declare global {
  interface Window {
    google: any;
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

function loadScriptOnce(src: string, id = 'google-gis') {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () =>
      reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(s);
  });
}

export function useGoogleCalendar() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const [isReady, setReady] = useState(false);
  const [isAuthed, setAuthed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokenClientRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!clientId) {
          setError('Missing VITE_GOOGLE_CLIENT_ID (.env.local).');
          return;
        }

        await loadScriptOnce(GIS_SRC);

        const oauth2 = window.google?.accounts?.oauth2;
        if (!oauth2) {
          setError('Google Identity Services blocked or unavailable.');
          return;
        }

        tokenClientRef.current = oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (resp: any) => {
            if (resp?.access_token) {
              setToken(resp.access_token);
              setAuthed(true);
              setError(null);
            } else if (resp?.error) {
              setError(String(resp.error));
            }
          },
        });

        if (!mounted) return;
        setReady(true);
      } catch (e: any) {
        setError(e?.message ?? 'Initialization failed.');
        setReady(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [clientId]);

  const signIn = useCallback(() => {
    setError(null);
    const tc = tokenClientRef.current;
    if (!tc) {
      setError('Token client is not ready yet.');
      return;
    }
    tc.requestAccessToken({ prompt: 'consent' });
  }, []);

  const signOut = useCallback(() => {
    if (token) window.google?.accounts?.oauth2?.revoke?.(token, () => {});
    setToken(null);
    setAuthed(false);
  }, [token]);

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
