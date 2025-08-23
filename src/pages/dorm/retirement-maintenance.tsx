import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Row = {
  title: string;
  desc: string;
  to: string;
};

const ROWS: Row[] = [
  {
    title: 'Retirement Inspection',
    desc: 'We apply if all the residents in the room are discharged.',
    to: '/dorm/retirement-form',
  },
  {
    title: 'A one person Retirement Inspection',
    desc: 'Only one person leaves the room. If there are any leftovers, you can apply.',
    to: '/dorm/retirement-form',
  },
  {
    title: 'Maintenance Inspection',
    desc: 'Lived more than a year and have not done retirement inspection. Room only. (New student X)',
    to: '/dorm/retirement-form',
  },
];

export default function RetirementMaintenanceIntroPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
          Dormitory : Application for Retirement / Maintenance Inspection
        </h1>

        <p className="mt-3 text-[16px] md:text-[17px] text-neutral-700">
          All tasks must be applied at least before 8 p.m. the day before.
          Please note that the work received after 8 p.m. can be processed the
          next day.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-[520px_56px_1fr] gap-6">
          {ROWS.map((row) => (
            <RowItem key={row.title} row={row} />
          ))}
        </div>

        <div className="mt-12 flex justify-end">
          <Link to="/dorm/retirement-form">
            <Button className="h-12 md:h-14 px-10 md:px-12 min-w-[260px] text-base md:text-lg">
              Go to reservation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function RowItem({ row }: { row: Row }) {
  return (
    <>
      <Link
        to={row.to}
        className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
      >
        <Card className="rounded-2xl border-2 border-blue-400/70 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="h-24 md:h-28 flex items-center justify-center p-6 md:p-8">
            <div className="text-[18px] md:text-[22px] font-semibold text-center leading-snug">
              {row.title}
            </div>
          </CardContent>
        </Card>
      </Link>

      <div className="hidden md:flex items-center justify-center">
        <ArrowRight className="h-6 w-6 text-blue-500" />
      </div>

      <div className="flex items-center">
        <p className="text-[16px] md:text-[17px] text-neutral-800 leading-relaxed">
          {row.desc}
        </p>
      </div>
    </>
  );
}
