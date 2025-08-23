import { useEffect, useState } from 'react';

import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  User,
} from 'lucide-react';

import { Layout, UserSchoolLogo } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { School, getUserSchool } from '@/data/get-user';
import { cn } from '@/lib/utils';

type Category = 'retirement_all' | 'retirement_one' | 'maintenance';

const CATEGORY_OPTIONS: {
  value: Category;
  label: string;
  description: string;
}[] = [
  {
    value: 'retirement_all',
    label: 'Full Retirement Inspection',
    description: 'All residents leaving the room',
  },
  {
    value: 'retirement_one',
    label: 'Single Person Retirement',
    description: 'Only one person leaving the room',
  },
  {
    value: 'maintenance',
    label: 'Maintenance Inspection',
    description: 'Room condition assessment (existing residents)',
  },
];

const GUIDELINES = [
  'The last resident to leave must submit a full-room checkout.',
  'The final person leaving cannot apply as a single-person checkout; a full-room checkout is required.',
  'You are responsible for any incorrect application.',
  'If you choose the wrong checkout type, your application may be rejected even if the inspection is completed.',
  'Applications outside the official checkout period are not accepted.',
];

export default function RetirementFormPage() {
  const [school, setSchool] = useState<School | undefined>(undefined);
  const [room, setRoom] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUserSchool().then(setSchool);
  }, []);

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
      <div className="space-y-6 mb-24">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {school ? (
              <UserSchoolLogo
                school={school}
                size="xl"
                display="logo-with-name"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                  <span className="text-xs text-gray-400">?</span>
                </div>
                <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Retirement & Maintenance Inspection Application
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Schedule your room inspection appointment
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Application Deadline
              </h3>
              <p className="text-amber-800 leading-relaxed">
                All applications must be submitted at least before 8 PM the day
                before. Applications received after 8 PM will be processed the
                next business day.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Inspection Application Form
                </CardTitle>
                <CardDescription>
                  Fill out the form below to schedule your inspection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="room"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Room Number
                  </Label>
                  <Input
                    id="room"
                    placeholder="A000"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Inspection Category
                  </Label>
                  <CategoryCombobox
                    value={category}
                    onChange={(v) => setCategory(v)}
                    placeholder="Choose the inspection type..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-base font-medium flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="time"
                      className="text-base font-medium flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-base font-medium">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="note"
                    rows={4}
                    value={note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNote(e.target.value)
                    }
                    placeholder="Any special requirements or notes for the inspection..."
                    className="text-base resize-none"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      <p>Please review all information before submitting.</p>
                      <p>
                        You will receive a confirmation email once processed.
                      </p>
                    </div>
                    <Button
                      disabled={!canSubmit}
                      onClick={handleSubmit}
                      size="lg"
                      className="px-8 min-w-[200px]"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines Section */}
          <div>
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Important Guidelines
                </CardTitle>
                <CardDescription className="text-red-700">
                  Please read carefully before applying
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {GUIDELINES.map((guideline, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-red-800"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-xs font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="leading-relaxed">{guideline}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    * Exceptions may be allowed only with prior approval from
                    the supervising professor or dormitory office.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
          className={cn(
            'h-12 w-full justify-between text-base',
            !selected && 'text-muted-foreground',
          )}
        >
          {selected ? (
            <div className="text-left">
              <div className="font-medium">{selected.label}</div>
              <div className="text-sm text-gray-500">
                {selected.description}
              </div>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search inspection type..." />
          <CommandEmpty>No inspection type found.</CommandEmpty>
          <CommandGroup>
            {CATEGORY_OPTIONS.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex items-start gap-3 p-3"
              >
                <Check
                  className={cn(
                    'w-4 h-4 mt-0.5',
                    value === opt.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
