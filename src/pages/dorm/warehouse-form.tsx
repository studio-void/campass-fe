import { useState } from 'react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Category = 'put_in' | 'take_out';

const WAREHOUSE_OPTIONS = [
  'Building A basement (male, female)',
  'Building B 4th floor (male)',
  'Building B 5th floor (female)',
  'Building B 6th floor (female)',
];

export default function WarehouseFormPage() {
  const [room, setRoom] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [proxy, setProxy] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !!room && !!category && !!time && !!date && !!warehouse && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      alert('Warehouse request submitted!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
          Dormitory : Application for warehouse use
        </h1>
        <p className="mt-3 text-neutral-600">
          All tasks must be applied at least before 8 p.m. the day before.{' '}
          <br />
          Please note that the work received after 8 p.m. can be processed the
          next day.
        </p>

        <div className="mx-auto w-full max-w-5xl">
          <Card className="mt-10 rounded-2xl">
            <CardContent className="p-7 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-7">
                  <div>
                    <Label htmlFor="room" className="mb-2.5 block text-base">
                      Room number
                    </Label>
                    <Input
                      id="room"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="A000"
                      className="h-11 rounded-xl border-blue-300"
                    />
                  </div>

                  <div>
                    <Label className="mb-2.5 block text-base">Category</Label>
                    <Select
                      value={category}
                      onValueChange={(v: Category) => setCategory(v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-blue-300">
                        <SelectValue placeholder="Choose the category…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="put_in">
                          Put your luggage in
                        </SelectItem>
                        <SelectItem value="take_out">
                          Take off your luggage
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="time" className="mb-2.5 block text-base">
                        Reservation time
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="h-11 rounded-xl border-blue-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date" className="mb-2.5 block text-base">
                        Reservation date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-11 rounded-xl border-blue-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-7">
                  <div>
                    <Label htmlFor="proxy" className="mb-2.5 block text-base">
                      Whether to keep it by proxy
                    </Label>
                    <Input
                      id="proxy"
                      value={proxy}
                      onChange={(e) => setProxy(e.target.value)}
                      placeholder="Enter O or X"
                      className="h-11 rounded-xl border-blue-300"
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block text-base">
                      Select the warehouse you want
                    </Label>
                    <RadioGroup
                      value={warehouse}
                      onValueChange={setWarehouse}
                      className="space-y-3"
                    >
                      {WAREHOUSE_OPTIONS.map((opt) => (
                        <div key={opt} className="flex items-center space-x-3">
                          <RadioGroupItem value={opt} id={opt} />
                          <Label htmlFor={opt} className="text-base">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <Button
                  disabled={!canSubmit}
                  onClick={onSubmit}
                  className="h-12 md:h-14 px-12 md:px-16 min-w-[340px] text-base md:text-lg"
                >
                  {submitting ? 'Submitting…' : 'Apply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
