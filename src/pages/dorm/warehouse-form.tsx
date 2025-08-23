import { useEffect, useState } from 'react';

import { Calendar, Clock, MapPin, Package, User } from 'lucide-react';

import { Layout, UserSchoolLogo } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { School, getUserSchool } from '@/data/get-user';

type Category = 'put_in' | 'take_out';

const WAREHOUSE_OPTIONS = [
  {
    id: 'building-a-basement',
    label: 'Building A Basement',
    description: 'Available for male and female students',
  },
  {
    id: 'building-b-4th',
    label: 'Building B 4th Floor',
    description: 'Male students only',
  },
  {
    id: 'building-b-5th',
    label: 'Building B 5th Floor',
    description: 'Female students only',
  },
  {
    id: 'building-b-6th',
    label: 'Building B 6th Floor',
    description: 'Female students only',
  },
];

const CATEGORY_OPTIONS = [
  {
    value: 'put_in',
    label: 'Store Luggage',
    description: 'Put your belongings into warehouse',
    icon: Package,
  },
  {
    value: 'take_out',
    label: 'Retrieve Luggage',
    description: 'Take your belongings from warehouse',
    icon: Package,
  },
];

export default function WarehouseFormPage() {
  const [school, setSchool] = useState<School | undefined>(undefined);
  const [room, setRoom] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [proxy, setProxy] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUserSchool().then(setSchool);
  }, []);

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
      <div className="space-y-6 mb-24">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {school ? (
              <UserSchoolLogo
                school={school}
                size="2xl"
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
              Warehouse Use Application
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Reserve warehouse space for your belongings
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

        {/* Form Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Application Form
            </CardTitle>
            <CardDescription>
              Fill out the form below to reserve warehouse space
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
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
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="A000"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Category
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(v: Category) => setCategory(v)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Choose the category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-3">
                            <option.icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              {/* <div className="text-sm text-gray-500">
                                {option.description}
                              </div> */}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proxy" className="text-base font-medium">
                    Proxy Storage
                  </Label>
                  <Select value={proxy} onValueChange={setProxy}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Can someone else handle your storage?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">
                        Yes, someone will handle it on behalf of me
                      </SelectItem>
                      <SelectItem value="no">
                        No, I'll handle it myself
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Select Warehouse Location
                  </Label>
                  <RadioGroup
                    value={warehouse}
                    onValueChange={setWarehouse}
                    className="space-y-3"
                  >
                    {WAREHOUSE_OPTIONS.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-start space-x-3"
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={option.id}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={option.id}
                            className="text-base font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="pt-4 border-t">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <p>Please review all information before submitting.</p>
                  <p>You will receive a confirmation email once processed.</p>
                </div>
                <Button
                  disabled={!canSubmit}
                  onClick={onSubmit}
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
    </Layout>
  );
}
