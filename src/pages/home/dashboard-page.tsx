import { useCallback, useEffect, useState } from 'react';

import { Trash2 } from 'lucide-react';

import { Layout } from '@/components';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGoogleCalendar } from '@/hooks/use-google-calendar';

const mock = {
  me: { name: 'VO!D', verified: true },
  dormitory: {
    storageNext: '25/08/24 14:00',
    retirementNext: '25/08/24 14:00',
  },
  facility: { hasReservation: false },
  friends: ['dogs', 'cats', 'fish', 'sheep'],
  addable: [
    { name: 'frogs', added: false },
    { name: 'cats', added: true },
    { name: 'fish', added: true },
    { name: 'sheep', added: false },
  ],
  teams: ['Campass', 'Fliggle'],
  timetableTips: [
    '15 credits',
    'Friday free',
    'Personal time',
    'Maximum number of consecutive lectures 3',
    'Unconditionally include math',
  ],
};

export default function DashboardPage() {
  const data = mock;
  const [teams, setTeams] = useState<string[]>(data.teams);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState('');

  const { isReady, isAuthed, error, signIn, signOut, listUpcomingEvents } =
    useGoogleCalendar();
  const [eventsOpen, setEventsOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (eventsOpen) {
      listUpcomingEvents(5)
        .then(setEvents)
        .catch(() => setEvents([]));
    }
  }, [eventsOpen, listUpcomingEvents]);

  const handleConfirmAdd = useCallback((name: string) => {
    alert(`Added ${name}`);
  }, []);

  const createTeam = useCallback(() => {
    const name = teamName.trim();
    if (!name) return;
    setTeams((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setTeamName('');
    setCreateOpen(false);
  }, [teamName]);

  const deleteTeam = useCallback((name: string) => {
    setTeams((prev) => prev.filter((t) => t !== name));
  }, []);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-neutral-200">
              <img
                src="/images/VO!D_logo.png"
                alt="VO!D"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {data.me.name}
              </div>
              {data.me.verified && (
                <span className="inline-flex items-center rounded-full border border-blue-400 px-3 py-1 text-sm text-blue-600">
                  학교 인증 완료 ✓
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {!isAuthed ? (
              <>
                <Button
                  disabled={!isReady}
                  onClick={signIn}
                  className="h-10 px-5 rounded-full bg-sky-200/90 hover:bg-sky-200 text-slate-700 font-medium gap-2 ring-1 ring-sky-300 shadow-sm"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Google Log in
                </Button>
                <div className="text-xs text-neutral-500 text-right">
                  Log in to Google account to use ‘Team project’
                </div>
                {error && (
                  <div className="text-xs text-red-600 text-right">
                    {String(error)}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Dialog open={eventsOpen} onOpenChange={setEventsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full">
                        Upcoming events
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                        <DialogTitle>Google Calendar</DialogTitle>
                        <DialogDescription>Next 5 events</DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[320px] overflow-auto">
                        <ul className="text-sm text-slate-800 space-y-2">
                          {events.length === 0 ? (
                            <li className="text-slate-500">No events</li>
                          ) : (
                            events.map((e) => (
                              <li key={e.id} className="rounded-lg border p-2">
                                <div className="font-medium">
                                  {e.summary || '(no title)'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {e.start?.dateTime || e.start?.date} —{' '}
                                  {e.end?.dateTime || e.end?.date}
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    onClick={signOut}
                    className="rounded-full"
                  >
                    Disconnect
                  </Button>
                </div>
                <div className="text-xs text-neutral-500">
                  Connected to Google Calendar
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2 items-start">
          <div className="space-y-8">
            <Card className="rounded-2xl">
              <CardContent className="p-6 min-h-[180px] flex flex-col justify-between">
                <h2 className="text-xl font-semibold mb-4">Dormitory</h2>
                <div className="space-y-3">
                  <InfoRow
                    label="Application for storage use"
                    meta={data.dormitory.storageNext}
                  />
                  <InfoRow
                    label="Application for Maintenance Inspection"
                    meta={data.dormitory.retirementNext}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Timetable</h2>
                <div className="grid grid-cols-[minmax(220px,1fr)_1fr] gap-6">
                  <div className="rounded-xl border grid place-content-center h-[200px] overflow-hidden">
                    <img
                      src="/images/timetable-placeholder.png"
                      alt="Timetable"
                      className="object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'data:image/svg+xml;charset=UTF-8,' +
                          encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="200"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#6b7280">Timetable preview</text></svg>`,
                          );
                      }}
                    />
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-800">
                    {data.timetableTips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-2xl">
              <CardContent className="p-6 min-h-[180px] flex flex-col justify-center">
                <h2 className="text-xl font-semibold mb-4">Facility</h2>
                <div className="rounded-2xl border p-10 text-center">
                  {data.facility.hasReservation ? (
                    <div className="text-lg">
                      You have an active reservation
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl">✕</div>
                      <div className="mt-2 text-lg">No reservation</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="rounded-2xl">
                <CardContent className="p-6 h-full">
                  <h2 className="text-xl font-semibold mb-4">Friends</h2>
                  <div className="flex flex-wrap gap-3">
                    {data.friends.map((f) => (
                      <span
                        key={f}
                        className="rounded-xl border px-3 py-1.5 text-sm"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-6 h-full">
                  <h2 className="text-xl font-semibold mb-4">Add Friends</h2>
                  <div className="flex flex-col gap-3">
                    {data.addable.map((p) => (
                      <AddFriendRow
                        key={p.name}
                        name={p.name}
                        added={p.added}
                        onConfirm={handleConfirmAdd}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">My team</h2>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                      <DialogTrigger asChild>
                        <Button className="ml-auto">Create new team</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[420px]">
                        <DialogHeader>
                          <DialogTitle>Create a team</DialogTitle>
                          <DialogDescription>
                            Enter a team name to create.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-2">
                          <Label htmlFor="teamName">Team name</Label>
                          <Input
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Campass"
                            autoFocus
                          />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={createTeam}
                            disabled={!teamName.trim()}
                          >
                            Create
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teams.map((t) => (
                      <TeamRow key={t} name={t} onDelete={deleteTeam} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function InfoRow({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2">
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {meta && <div className="text-xs text-neutral-500 mt-0.5">{meta}</div>}
      </div>
    </div>
  );
}

function AddFriendRow({
  name,
  added,
  onConfirm,
}: {
  name: string;
  added: boolean;
  onConfirm?: (name: string) => void;
}) {
  if (added) {
    return (
      <div className="flex items-center justify-between rounded-xl border px-3 py-1.5 text-sm">
        <span>{name}</span>
        <span className="inline-flex items-center rounded-md bg-green-100 text-green-700 px-2 py-0.5 text-xs">
          ✓
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-1.5 text-sm">
      <span>{name}</span>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Add
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add friend</DialogTitle>
            <DialogDescription>
              Do you want to add <b>{name}</b> to your friends?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => onConfirm?.(name)}>Confirm</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamRow({
  name,
  onDelete,
}: {
  name: string;
  onDelete: (name: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
      <span className="truncate">{name}</span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            className="inline-flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete team?</AlertDialogTitle>
            <AlertDialogDescription>
              “{name}” 팀을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(name)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.3-.9 2.4-1.9 3.1l3.1 2.4c1.8-1.7 2.9-4.2 2.9-7.2 0-.7-.1-1.4-.2-2H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3a7.2 7.2 0 0 0 6.7 4.7c2 0 3.7-.7 4.9-1.9l-3.1-2.4c-.8.6-1.7.9-2.8.9-2.1 0-3.9-1.4-4.6-3.3l-3.1 2z"
      />
      <path
        fill="#4285F4"
        d="M19.6 8.6c-.3-1-.9-1.9-1.7-2.7-1.2-1.1-2.9-1.9-4.9-1.9-3 0-5.6 1.7-6.8 4.2l3.2 2.5c.6-1.8 2.3-3.1 4.2-3.1 1.1 0 2 .4 2.7 1.1.7.7 1.2 1.6 1.3 2.6h2z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 8.2l-3.2-2.5A7.8 7.8 0 0 0 4 14.4l3.1-2a4.6 4.6 0 0 1-.1-4.2z"
      />
    </svg>
  );
}
