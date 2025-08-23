import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useGoogleCalendar } from '@/hooks/use-google-calendar';

export default function CalendarConnectTest() {
  const { isReady, isAuthed, error, signIn, signOut, listUpcomingEvents } =
    useGoogleCalendar();
  const [events, setEvents] = useState<any[]>([]);

  return (
    <div className="mt-10 flex flex-col gap-3">
      {!isAuthed ? (
        <Button disabled={!isReady} onClick={signIn} className="w-fit">
          Connect Google Calendar
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button variant="outline" onClick={signOut}>
            Disconnect
          </Button>
          <Button
            onClick={async () => {
              const items = await listUpcomingEvents(5);
              setEvents(items);
            }}
          >
            Load 5 events
          </Button>
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <ul className="text-sm text-slate-700 list-disc ml-5">
        {events.map((e) => (
          <li key={e.id}>
            {e.summary} — {e.start?.dateTime || e.start?.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
