import { useState } from 'react';

import { Check, ChevronDown } from 'lucide-react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

type Category = 'retirement_all' | 'retirement_one' | 'maintenance';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'retirement_all', label: 'Retirement Inspection (all residents)' },
  { value: 'retirement_one', label: 'A one person Retirement Inspection' },
  { value: 'maintenance', label: 'Maintenance Inspection' },
];

export default function RetirementFormPage() {
  const [room, setRoom] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!room && !!category && !!date && !!time && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      alert('Reservation submitted!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
          Dormitory : Application for Retirement / Maintenance Inspection
        </h1>
        <p className="mt-2 text-[15px] md:text-base text-neutral-600">
          All tasks must be applied at least before 8 p.m. the day before.
          Please note that the work received after 8 p.m. can be processed the
          next day.
        </p>

        <div className="mt-8 grid gap-10 md:gap-12 md:grid-cols-[minmax(0,720px)_360px] items-start">
          <Card className="rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <Label htmlFor="room" className="text-base">
                  Room number
                </Label>
                <Input
                  id="room"
                  placeholder="A000"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="mt-2 h-11 text-base"
                />
              </div>

              <div>
                <Label className="text-base">Category</Label>
                <CategoryCombobox
                  value={category}
                  onChange={(v) => setCategory(v)}
                  placeholder="Choose the category..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-base">
                    Reservation date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2 h-11 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-base">
                    Reservation time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2 h-11 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="note" className="text-base">
                  Notes (optional)
                </Label>
                <Textarea
                  id="note"
                  rows={4}
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNote(e.target.value)
                  }
                  placeholder="Anything we should know before inspection…"
                  className="mt-2 text-base"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="h-12 md:h-13 px-10 md:px-12 text-base md:text-lg"
                >
                  {submitting ? 'Submitting…' : 'Apply'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl md:mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-600">
                Checkout Inspection Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal ml-5 space-y-2 text-[15px] md:text-base text-neutral-900">
                <li>
                  The last resident to leave must submit a full-room checkout.
                </li>
                <li>
                  The final person leaving cannot apply as a single-person
                  checkout; a full-room checkout is required.
                </li>
                <li>You are responsible for any incorrect application.</li>
                <li>
                  If you choose the wrong checkout type, your application may be
                  rejected even if the inspection is completed.
                </li>
                <li>
                  Applications outside the official checkout period are not
                  accepted.
                </li>
              </ol>
              <p className="mt-4 text-[15px] md:text-base text-neutral-900">
                * Exceptions may be allowed only with prior approval from the
                supervising professor or dormitory office.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

function CategoryCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: Category | '';
  onChange: (v: Category) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = CATEGORY_OPTIONS.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="mt-2 h-11 w-full justify-between text-base"
        >
          {selected ? (
            selected.label
          ) : (
            <span className="text-neutral-400">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {CATEGORY_OPTIONS.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="text-sm"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === opt.value ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
