import { useState } from 'react';

import { Calendar, Clock, Plus, RefreshCw } from 'lucide-react';

import { useGoogleCalendar } from '../hooks/use-google-calendar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export function GoogleCalendarDemo() {
  const {
    isReady,
    isAuthed,
    error,
    signIn,
    signOut,
    listUpcomingEvents,
    createQuickEvent,
  } = useGoogleCalendar();

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for creating events
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: 1,
    description: '',
  });

  const handleLoadEvents = async () => {
    if (!isAuthed) return;
    setIsLoading(true);
    try {
      const upcomingEvents = await listUpcomingEvents(5);
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!isAuthed || !eventForm.title || !eventForm.date) return;
    setIsLoading(true);
    try {
      await createQuickEvent(
        eventForm.title,
        eventForm.date,
        eventForm.time || undefined,
        eventForm.duration,
        eventForm.description || undefined,
      );
      // Reset form
      setEventForm({
        title: '',
        date: '',
        time: '',
        duration: 1,
        description: '',
      });
      // Reload events
      await handleLoadEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // Utility functions for setting current date/time
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setEventForm((prev) => ({ ...prev, date: today }));
  };

  const setCurrentTime = () => {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    setEventForm((prev) => ({ ...prev, time: currentTime }));
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setEventForm((prev) => ({ ...prev, date: tomorrowStr }));
  };

  if (!isReady) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-600">Initializing Google Calendar...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ Error</div>
          <p className="text-red-800">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Google Calendar Integration
              </h2>
              <p className="text-gray-600">
                Manage your Google Calendar events
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthed ? (
              <>
                <span className="text-sm text-green-600">✅ Connected</span>
                <Button onClick={signOut} variant="outline" size="sm">
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={signIn} className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>Connect Google Calendar</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {isAuthed && (
        <>
          {/* Create Event Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Plus size={18} />
              <span>Create New Event</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="date">Date *</Label>
                    <div className="flex space-x-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setToday}
                        className="text-xs px-2 py-1 h-6"
                      >
                        Today
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setTomorrow}
                        className="text-xs px-2 py-1 h-6"
                      >
                        Tomorrow
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="time">Time (optional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={setCurrentTime}
                        className="text-xs px-2 py-1 h-6"
                      >
                        Now
                      </Button>
                    </div>
                    <Input
                      id="time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      placeholder="All day if empty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0.5"
                      max="24"
                      step="0.5"
                      value={eventForm.duration}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          duration: parseFloat(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter event description (optional)"
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleCreateEvent}
                  disabled={isLoading || !eventForm.title || !eventForm.date}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Clock size={18} />
                <span>Upcoming Events</span>
              </h3>
              <Button
                onClick={handleLoadEvents}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
              </Button>
            </div>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No upcoming events found</p>
                  <Button
                    onClick={handleLoadEvents}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Load Events
                  </Button>
                </div>
              ) : (
                events.map((event, index) => (
                  <div
                    key={event.id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {event.summary || 'No title'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatEventDate(
                            event.start?.dateTime || event.start?.date || '',
                          )}
                          {event.end?.dateTime && event.start?.dateTime && (
                            <>
                              {' - '}
                              {formatEventDate(event.end.dateTime)}
                            </>
                          )}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-2">
                            {event.description}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-sm text-blue-600 mt-1">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      {event.htmlLink && (
                        <a
                          href={event.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View in Google Calendar →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
