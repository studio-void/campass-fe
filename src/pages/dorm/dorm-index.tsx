import { Link } from '@tanstack/react-router';

import { Layout } from '@/components';
import { Card, CardContent } from '@/components/ui/card';

export default function DormIndexPage() {
  return (
    <Layout>
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 xl:px-48">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <img
                src="/images/schools/gist.svg"
                alt="GIST logo"
                className="h-10 w-auto"
              />
              <p className="text-4xl font-semibold">GIST</p>
            </div>
            <p className="mt-1 text-2xl text-blue-600">
              Make campus life more convenient
            </p>
          </div>

          <div className="mx-auto w-full max-w-[1100px] rounded-3xl bg-[#CFEBFF] min-h-[520px] md:min-h-[600px] px-6 md:px-10 pt-8 md:pt-12 pb-10">
            <div className="mx-auto w-full max-w-[920px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link
                  to="/dorm/retirement-maintenance"
                  className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
                >
                  <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
                    <CardContent className="p-8 md:p-10">
                      <div className="text-center text-lg md:text-2xl font-semibold leading-snug">
                        Application for Retirement <br /> Maintenance Inspection
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link
                  to="/dorm/warehouse"
                  className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
                >
                  <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
                    <CardContent className="p-8 md:p-10">
                      <div className="text-center text-lg md:text-2xl font-semibold leading-snug">
                        Application for <br /> warehouse use
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
