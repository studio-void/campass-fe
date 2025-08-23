import { useMemo, useState } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import {
  DAYS,
  DAY_START,
  type FreeRange,
  MEMBER_RGBA,
  SLOTS_PER_DAY,
  STEP_MIN,
  computeCommonFree,
  findFreeSequences,
  fmtHM,
  makeMockMembers,
} from '@/lib/time-scheduler';

type Search = {
  team?: string;
  project?: string;
  count?: number;
  duration?: number;
};

const SLOT_PX = 48;
const GAP_PX = 8;

export default function TeamCalendarPage() {
  const navigate = useNavigate();
  const { team, project, count, duration } =
    (useSearch({ from: '/team/calendar' }) as Search) || {};
  const minutes = Math.max(30, Number(duration) || 60);
  const minSlots = Math.max(1, Math.round(minutes / STEP_MIN));

  const members = useMemo(() => makeMockMembers(4), []);
  const freeMask = useMemo(() => computeCommonFree(members), [members]);
  const allRanges = useMemo<FreeRange[]>(
    () => findFreeSequences(freeMask, minSlots),
    [freeMask, minSlots],
  );

  const [selected, setSelected] = useState<{
    day: number;
    start: number;
  } | null>(null);

  const canStartHere = (day: number, start: number) => {
    for (let i = 0; i < minSlots; i++) {
      const idx = day * SLOTS_PER_DAY + (start + i);
      if (!freeMask[idx]) return false;
    }
    return true;
  };

  const keepBooking = () => {
    if (!selected) {
      toast.error('Please select a time.');
      return;
    }
    navigate({
      to: '/team/done',
      search: {
        team,
        project,
        day: DAYS[selected.day],
        start: fmtHM(selected.start),
        duration: minutes,
        count: Number(count) || 1,
      },
    });
  };

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24 xl:px-48 py-10 md:py-14">
        <h1 className="text-3xl font-semibold">Team Project</h1>
        <p className="mt-1 text-neutral-600">
          Based on the team members&apos; calendars, we will find a team time
          and make a reservation for 5 rooms in the library.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(760px,1fr)_360px] gap-10 items-start">
          <div className="rounded-2xl border shadow-sm p-4">
            <div className="grid grid-cols-6 gap-2 mb-3 text-xs text-neutral-500">
              <div />
              {DAYS.map((d) => (
                <div key={d} className="text-center font-medium">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-6 gap-2">
              <div className="flex flex-col gap-2 text-[11px] text-neutral-500 pr-2">
                {Array.from({ length: SLOTS_PER_DAY }).map((_, i) => {
                  const h = DAY_START + Math.floor((i * STEP_MIN) / 60);
                  const m = (i * STEP_MIN) % 60;
                  return (
                    <div key={i} className="h-12 flex items-center justify-end">
                      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>

              {DAYS.map((_, dayIdx) => (
                <DayColumn
                  key={dayIdx}
                  dayIdx={dayIdx}
                  members={members}
                  ranges={allRanges.filter((r) => r.day === dayIdx)}
                  selected={selected}
                  setSelected={setSelected}
                  canStartHere={canStartHere}
                  minSlots={minSlots}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium mb-2">Your selection</div>
              {selected ? (
                <div className="text-sm">
                  {DAYS[selected.day]} {fmtHM(selected.start)} –{' '}
                  {fmtHM(selected.start + minSlots)}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">
                  Click a green patterned free area on the left.
                </div>
              )}
            </div>

            <Button
              onClick={keepBooking}
              disabled={!selected}
              className="h-11 px-8"
            >
              Keep Booking
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function DayColumn({
  dayIdx,
  members,
  ranges,
  selected,
  setSelected,
  canStartHere,
  minSlots,
}: {
  dayIdx: number;
  members: ReturnType<typeof makeMockMembers>;
  ranges: FreeRange[];
  selected: { day: number; start: number } | null;
  setSelected: (s: { day: number; start: number }) => void;
  canStartHere: (day: number, start: number) => boolean;
  minSlots: number;
}) {
  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        {Array.from({ length: SLOTS_PER_DAY }).map((_, i) => (
          <div key={i} className="h-12 rounded-md bg-neutral-100" />
        ))}
      </div>

      {members.map((m, mi) =>
        m.daySegments[dayIdx].map((seg, k) => {
          const top = seg.start * (SLOT_PX + GAP_PX);
          const height = seg.length * SLOT_PX + (seg.length - 1) * GAP_PX;
          return (
            <div
              key={`${mi}-${k}`}
              className="absolute left-0 right-0 rounded-md"
              style={{
                top,
                height,
                backgroundColor: MEMBER_RGBA[mi % MEMBER_RGBA.length],
              }}
            />
          );
        }),
      )}

      {ranges.map((r, i) => {
        const top = r.startSlot * (SLOT_PX + GAP_PX);
        const height = r.length * SLOT_PX + (r.length - 1) * GAP_PX;
        return (
          <div
            key={`free-${i}`}
            className="absolute left-0 right-0 rounded-md pointer-events-none border-2 border-green-700/70 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
            style={{
              top,
              height,
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(34,197,94,0.16) 0px, rgba(34,197,94,0.16) 8px, transparent 8px, transparent 16px)',
            }}
          />
        );
      })}

      {Array.from({ length: SLOTS_PER_DAY }).map((_, start) => {
        if (!canStartHere(dayIdx, start)) return null;
        const top = start * (SLOT_PX + GAP_PX);
        const height = minSlots * SLOT_PX + (minSlots - 1) * GAP_PX;
        const chosen =
          selected && selected.day === dayIdx && selected.start === start;
        return (
          <button
            key={`start-${start}`}
            aria-label={`Select ${DAYS[dayIdx]} ${fmtHM(start)}`}
            onClick={() => setSelected({ day: dayIdx, start })}
            className={[
              'absolute left-0 right-0 rounded-md bg-transparent',
              chosen
                ? 'ring-4 ring-green-700 bg-green-600/5'
                : 'hover:ring-2 hover:ring-green-700',
            ].join(' ')}
            style={{ top, height }}
          />
        );
      })}
    </div>
  );
}

// TODO 실제 캘린더 연동
