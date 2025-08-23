export const STEP_MIN = 30;
export const DAY_START = 9;
export const DAY_END = 18;
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export const SLOTS_PER_DAY = Math.floor(
  ((DAY_END - DAY_START) * 60) / STEP_MIN,
);
export const TOTAL_SLOTS = SLOTS_PER_DAY * DAYS.length;

export type DayIndex = 0 | 1 | 2 | 3 | 4;

export type DaySegment = { start: number; length: number };
export type Member = {
  id: string;
  dayBusyMask: boolean[][];
  daySegments: DaySegment[][];
};

export const MEMBER_RGBA = [
  'rgba(125,211,252,0.28)',
  'rgba(96,165,250,0.28)',
  'rgba(110,231,183,0.28)',
  'rgba(196,181,253,0.28)',
];

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function generateDayBusyMask(): boolean[] {
  const mask = Array<boolean>(SLOTS_PER_DAY).fill(false);
  const blocks = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < blocks; i++) {
    const len = 1 + Math.floor(Math.random() * 4);
    const start = clamp(
      Math.floor(Math.random() * (SLOTS_PER_DAY - len)),
      0,
      SLOTS_PER_DAY - len,
    );
    for (let s = 0; s < len; s++) mask[start + s] = true;
  }
  return mask;
}

function compressToSegments(mask: boolean[]): DaySegment[] {
  const segs: DaySegment[] = [];
  let i = 0;
  while (i < mask.length) {
    if (!mask[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j < mask.length && mask[j]) j++;
    segs.push({ start: i, length: j - i });
    i = j;
  }
  return segs;
}

export function makeMockMembers(count = 4): Member[] {
  const members: Member[] = [];
  for (let m = 0; m < count; m++) {
    const dayBusyMask: boolean[][] = [];
    const daySegments: DaySegment[][] = [];
    for (let d = 0; d < DAYS.length; d++) {
      const mask = generateDayBusyMask();
      dayBusyMask.push(mask);
      daySegments.push(compressToSegments(mask));
    }
    members.push({ id: `M${m + 1}`, dayBusyMask, daySegments });
  }
  return members;
}

export function computeCommonFree(members: Member[]): boolean[] {
  const free = Array<boolean>(TOTAL_SLOTS).fill(true);
  for (let d = 0; d < DAYS.length; d++) {
    for (let s = 0; s < SLOTS_PER_DAY; s++) {
      for (const m of members) {
        if (m.dayBusyMask[d][s]) {
          free[d * SLOTS_PER_DAY + s] = false;
          break;
        }
      }
    }
  }
  return free;
}

export type FreeRange = { day: number; startSlot: number; length: number };

export function findFreeSequences(
  freeMask: boolean[],
  minSlots: number,
): FreeRange[] {
  const ranges: FreeRange[] = [];
  for (let d = 0; d < DAYS.length; d++) {
    let i = 0;
    while (i < SLOTS_PER_DAY) {
      const idx = d * SLOTS_PER_DAY + i;
      if (!freeMask[idx]) {
        i++;
        continue;
      }
      let j = i;
      while (j < SLOTS_PER_DAY && freeMask[d * SLOTS_PER_DAY + j]) j++;
      const len = j - i;
      if (len >= minSlots) ranges.push({ day: d, startSlot: i, length: len });
      i = j;
    }
  }
  return ranges;
}

export function slotToHM(slot: number) {
  const total = slot * STEP_MIN;
  const h = DAY_START + Math.floor(total / 60);
  const m = total % 60;
  return { h, m };
}

export function fmtHM(slot: number) {
  const { h, m } = slotToHM(slot);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
