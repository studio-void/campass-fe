import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WarehouseUseIntroPage() {
  return (
    <Layout>
      <section
        className="mx-auto max-w-6xl px-4 py-10 md:py-14"
        data-warehouse-guide="true"
      >
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
          Dormitory : Application for warehouse use
        </h1>
        <p className="mt-3 text-neutral-600">
          All tasks must be applied at least before 8 p.m. the day before.{' '}
          <br />
          Please note that the work received after 8 p.m. can be processed the
          next day.
        </p>

        <div className="mt-12 mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-[360px_40px_1fr] gap-10 items-center">
          <Row
            title="Put your luggage in"
            sectionTitle="During the semester"
            bullets={[
              'Time: 10 minutes before the end of the house office hour',
              'Method: Write a pledge in the dormitory room (no proxy pledge required)',
              'Venue: Only the old building underground warehouse',
              'Period: Until two weeks before the end of the semester when storage began',
              'Precautions: Leaving due to absence/graduation → pack all luggage. You have to pick it up at the warehouse.',
            ]}
          />

          <Row
            title="Take off your luggage"
            sectionTitle="During vacation"
            bullets={[
              'Time: Pre-announced warehouse opening time',
              'Method: Fill out luggage & written vows in front of the warehouse',
              'Place: Desired warehouse where you want to put the box',
              'Period: Period stated in the warehouse pledge',
              'Note: Refrigerator storage is only available in old office warehouses',
            ]}
          />
        </div>

        <div className="mt-12 flex justify-end">
          <Link to="/dorm/warehouse/form">
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

function Row({
  title,
  sectionTitle,
  bullets,
}: {
  title: string;
  sectionTitle: string;
  bullets: string[];
}) {
  return (
    <>
      <div className="rounded-2xl mx-auto md:mx-0" role="presentation">
        <Card className="rounded-2xl border-2 border-blue-500 shadow-sm cursor-default select-none">
          <CardContent className="h-24 md:h-28 px-8">
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-xl md:text-2xl font-semibold text-center leading-snug whitespace-nowrap">
                {title}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className="hidden md:flex items-center justify-center"
        aria-hidden="true"
      >
        <ArrowRight className="h-6 w-6 text-blue-500" />
      </div>

      <div>
        <h3 className="text-blue-600 font-semibold text-lg md:text-xl">
          {sectionTitle}
        </h3>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-neutral-900 leading-relaxed text-base md:text-lg">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
