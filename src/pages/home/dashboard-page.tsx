import { useCallback, useEffect, useState } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import { Plus, PlusIcon, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

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
import { deleteAuthLogout } from '@/data/delete-auth-logout';
import { getFriends, sendFriendRequest } from '@/data/friend';
import {
  getReceivedFriendRequests,
  getSentFriendRequests,
} from '@/data/friend';
import { type GetUserResponse, VerifyStatus } from '@/data/get-user';
import { getAllUsers } from '@/data/get-user-all';
import { type Team, listTeams } from '@/data/team';
import { useAuth } from '@/hooks';
import { useGoogleCalendar } from '@/hooks/use-google-calendar';

const mock = {
  me: { name: 'VO!D', verified: false },
  dormitory: {
    storageNext: '25/08/24 14:00',
    retirementNext: '25/08/24 14:00',
  },
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
  const { user } = useAuth();

  const [users, setUsers] = useState<GetUserResponse[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllUsers();
      setUsers(users);
    };

    const fetchFriends = async () => {
      const friends = await getFriends();
      setFriends(friends);
    };

    const fetchTeams = async () => {
      const teams = await listTeams();
      if (teams) setTeams(teams);
    };

    const fetchReceivedRequests = async () => {
      const requests = await getReceivedFriendRequests();
      setReceivedRequests(requests);
    };

    const fetchSentRequests = async () => {
      const requests = await getSentFriendRequests();
      setSentRequests(requests);
    };

    fetchUsers();
    fetchFriends();
    fetchTeams();
    fetchReceivedRequests();
    fetchSentRequests();
  }, []);

  const nav = useNavigate();
  const { isAuthed, error, signIn, listUpcomingEvents } = useGoogleCalendar();

  // Logout handler
  const handleLogout = async () => {
    const res = await deleteAuthLogout();
    if (res?.success) {
      toast.success('Logged out successfully');
      nav({ to: '/' });
    }
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [eventsOpen, setEventsOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (eventsOpen) {
      listUpcomingEvents(5)
        .then(setEvents)
        .catch(() => setEvents([]));
    }
  }, [eventsOpen, listUpcomingEvents]);

  const handleConfirmAdd = useCallback(
    async (name: string) => {
      // Find user by name
      const userToAdd = users.find((u) => u.name === name);
      if (!userToAdd) {
        toast.error('Unknown user');
        return;
      }
      try {
        await sendFriendRequest(userToAdd.id);
        toast.success(`Sent friend request to ${name}`);
        // Optionally refresh friends list
        const updatedFriends = await getFriends();
        setFriends(updatedFriends);
      } catch (e) {
        // Error handled in API
      }
    },
    [users],
  );

  if (!user) return null;

  return (
    <Layout>
      <section className="mx-auto w-full mb-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* <div className="h-12 w-12 rounded-2xl overflow-hidden bg-neutral-200"> */}
            <UserCircle className="size-12" />
            {/* </div> */}
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {user.name}
              </div>
              {user.verifyStatus === VerifyStatus.VERIFIED ? (
                <Button
                  variant="outline"
                  disabled
                  className="inline-flex items-center rounded-full border border-blue-400 px-3 py-1 text-sm text-blue-600 disabled:opacity-100"
                >
                  School Verified ✓
                </Button>
              ) : user.verifyStatus === VerifyStatus.NONE ? (
                <Link to="/auth/verification">
                  <Button className="inline-flex items-center rounded-full px-3 py-1 text-sm">
                    Verify Your School
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  className="inline-flex items-center rounded-full px-3 py-1 text-sm"
                >
                  Verification Pending...
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="rounded-full px-3 py-1 text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <div className="flex flex-col items-end gap-1">
              {!isAuthed ? (
                <>
                  <div
                    role="button"
                    onClick={signIn}
                    className="flex items-center justify-center gap-3 h-10 px-6 rounded-md border border-neutral-300 shadow-sm bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-700 cursor-pointer"
                  >
                    <GoogleIcon className="h-5 w-5 shrink-0" />
                    <span>Sign in with Google</span>
                  </div>
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
                                <li
                                  key={e.id}
                                  className="rounded-lg border p-2"
                                >
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2 items-start">
          <div className="space-y-8">
            <Card className="rounded-2xl">
              <CardContent className="min-h-[180px] flex flex-col justify-between">
                <h2 className="text-xl font-semibold mb-4">Dormitory</h2>
                <div className="space-y-3">
                  <InfoRow
                    label="Application for storage use"
                    meta={mock.dormitory.storageNext}
                  />
                  <InfoRow
                    label="Application for Maintenance Inspection"
                    meta={mock.dormitory.retirementNext}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="">
                <h2 className="text-xl font-semibold mb-4">Timetable</h2>
                <div className="grid grid-cols-[minmax(220px,1fr)_1fr] gap-6">
                  <div className="rounded-xl border grid place-content-center h-[200px] overflow-hidden">
                    <img src="/images/mock_timetable.png" alt="Timetable" />
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-800">
                    {mock.timetableTips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="rounded-2xl">
                <CardContent className="h-full">
                  <h2 className="text-xl font-semibold mb-4">Friends</h2>
                  <div className="flex flex-wrap gap-3">
                    {friends.map((f) => (
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
                <CardContent className="h-full">
                  <h2 className="text-xl font-semibold mb-4">
                    Received Friend Requests
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {receivedRequests.length === 0 ? (
                      <span className="text-neutral-400 text-sm">
                        No received requests
                      </span>
                    ) : (
                      receivedRequests.map((req) => (
                        <span
                          key={req.id}
                          className="rounded-xl border px-3 py-1.5 text-sm"
                        >
                          {req.from?.name || req.fromName || req.fromId}
                        </span>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="h-full">
                  <h2 className="text-xl font-semibold mb-4">
                    Sent Friend Requests
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {sentRequests.length === 0 ? (
                      <span className="text-neutral-400 text-sm">
                        No sent requests
                      </span>
                    ) : (
                      sentRequests.map((req) => (
                        <span
                          key={req.id}
                          className="rounded-xl border px-3 py-1.5 text-sm"
                        >
                          {req.to?.name || req.toName || req.toId}
                        </span>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="h-full">
                  <h2 className="text-xl font-semibold mb-4">Add Friends</h2>
                  <div className="flex flex-col gap-3">
                    {users.map((user) => (
                      <AddFriendRow
                        key={user.name}
                        name={user.name}
                        onConfirm={handleConfirmAdd}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl md:col-span-2">
                <CardContent className="">
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
                          <Link to="/team">
                            <Button>Create</Button>
                          </Link>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teams.length === 0 ? (
                      <div className="text-neutral-400 text-sm col-span-2">
                        No teams found.
                      </div>
                    ) : (
                      teams.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                        >
                          <span className="truncate font-medium">
                            {team.title}
                          </span>
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
                                <AlertDialogTitle>
                                  Delete team?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  “{team.title}” 팀을 삭제합니다. 이 작업은
                                  되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2 sm:gap-0">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    /* TODO: implement delete handler */
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))
                    )}
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
  onConfirm,
}: {
  name: string;
  onConfirm?: (name: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-1.5 text-sm">
      <span>{name}</span>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" className="p-0">
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add friend</DialogTitle>
            <DialogDescription>
              Do you want to add <b>{name}</b> to your friends?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" {...props}>
      <path
        d="M17.64 9.2045c0-.6376-.0573-1.251-.1636-1.8405H9v3.481h4.8364a4.138 4.138 0 0 1-1.7945 2.7145v2.256h2.9086c1.7032-1.569 2.6895-3.8776 2.6895-6.611z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.469-0.8067 5.958-2.1845l-2.9086-2.256c-.8067.54-1.8392.861-3.0494.861-2.3456 0-4.3318-1.5825-5.0426-3.7112H.9573v2.331C2.4382 15.9833 5.4818 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.9574 10.7098A5.9992 5.9992 0 0 1 3.6429 9c0-.5922.1029-1.168.3145-1.7098V4.959H.9573A8.9968 8.9968 0 0 0 0 9c0 1.4627.3491 2.844 0.9573 4.041l3.0001-2.3312z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.571c1.3202 0 2.5093.453 3.442 1.342l2.5815-2.5816C13.466 0.896 11.43 0 9 0 5.4818 0 2.4382 2.0167.9573 4.959l3.0001 2.3312C4.6682 5.1619 6.6544 3.571 9 3.571z"
        fill="#EA4335"
      />
    </svg>
  );
}
