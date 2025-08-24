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

  // Interface for creating calendar events
  interface CreateEventParams {
    summary: string; // Event title
    description?: string; // Event description
    startDateTime: string; // ISO string date-time (e.g., "2024-08-24T10:00:00")
    endDateTime: string; // ISO string date-time (e.g., "2024-08-24T11:00:00")
    location?: string; // Event location
    attendees?: string[]; // Array of email addresses
    allDay?: boolean; // Whether it's an all-day event
    timeZone?: string; // Timezone (defaults to local timezone)
  }

  const createEvent = useCallback(
    async (params: CreateEventParams) => {
      if (!token) throw new Error('Not authorized');

      const {
        summary,
        description,
        startDateTime,
        endDateTime,
        location,
        attendees,
        allDay = false,
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
      } = params;

      // Validate required parameters
      if (!summary || !startDateTime || !endDateTime) {
        throw new Error('Summary, startDateTime, and endDateTime are required');
      }

      // Create event object according to Google Calendar API v3
      const eventData: any = {
        summary,
        description,
        location,
        start: allDay
          ? {
              date: startDateTime.split('T')[0], // Extract date part for all-day events
              timeZone,
            }
          : {
              dateTime: startDateTime,
              timeZone,
            },
        end: allDay
          ? {
              date: endDateTime.split('T')[0], // Extract date part for all-day events
              timeZone,
            }
          : {
              dateTime: endDateTime,
              timeZone,
            },
        attendees: attendees?.map((email) => ({ email })),
        reminders: {
          useDefault: true,
        },
      };

      const url =
        'https://www.googleapis.com/calendar/v3/calendars/primary/events';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Google Calendar API error: ${res.status} - ${errorText}`,
        );
      }

      const createdEvent = await res.json();
      return createdEvent;
    },
    [token],
  );

  // Quick event creation with simplified parameters (for AI agent use)
  const createQuickEvent = useCallback(
    async (
      title: string,
      date: string, // YYYY-MM-DD format
      time?: string, // HH:MM format (optional, defaults to all-day)
      duration?: number, // duration in hours (defaults to 1 hour)
      description?: string,
    ) => {
      if (!token) throw new Error('Not authorized');

      // Parse date and time
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format.');
      }

      let startDateTime: string;
      let endDateTime: string;
      let allDay = false;

      if (time) {
        // Parse time (HH:MM format)
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          throw new Error('Invalid time format. Use HH:MM format.');
        }

        const startDate = new Date(eventDate);
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + (duration || 1)); // Default 1 hour duration

        startDateTime = startDate.toISOString();
        endDateTime = endDate.toISOString();
      } else {
        // All-day event
        allDay = true;
        startDateTime = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const nextDay = new Date(eventDate);
        nextDay.setDate(nextDay.getDate() + 1);
        endDateTime = nextDay.toISOString().split('T')[0]; // Next day for all-day events
      }

      return await createEvent({
        summary: title,
        description,
        startDateTime,
        endDateTime,
        allDay,
      });
    },
    [createEvent, token],
  );

  // Update event
  const updateEvent = useCallback(
    async (eventId: string, params: Partial<CreateEventParams>) => {
      if (!token) throw new Error('Not authorized');

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

      // Get current event first
      const currentEventRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!currentEventRes.ok) {
        throw new Error(
          `Failed to fetch current event: ${currentEventRes.status}`,
        );
      }

      const currentEvent = await currentEventRes.json();

      // Merge with updates
      const updatedEvent = {
        ...currentEvent,
        ...Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined),
        ),
      };

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Google Calendar API error: ${res.status} - ${errorText}`,
        );
      }

      return await res.json();
    },
    [token],
  );

  // Delete event
  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!token) throw new Error('Not authorized');

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete event: ${res.status}`);
      }

      return { success: true, eventId };
    },
    [token],
  );

  return {
    isReady,
    isAuthed,
    error,
    signIn,
    signOut,
    listUpcomingEvents,
    createEvent,
    createQuickEvent,
    updateEvent,
    deleteEvent,
  };
}
