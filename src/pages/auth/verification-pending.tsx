import { Image as ImageIcon } from 'lucide-react';

import { Layout } from '@/components';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function VerificationPendingPage() {
  return (
    <Layout>
      <section className="flex flex-col items-center justify-center flex-1 w-full px-4 min-h-[80vh]">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold">School certification</h1>

          <p className="mt-8 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
            We will check whether the school you entered
            <br />
            at the time of membership registration is certified.
            <br />
            Please upload documents that can be certified.
          </p>
          <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400">
            (Student card, Certificate of enrollment, Certificate of
            acceptance…)
          </p>

          <div className="mt-12 mx-auto w-[260px]">
            <Card className="rounded-xl">
              <CardContent className="p-0">
                <AspectRatio ratio={1}>
                  <div className="h-full w-full flex items-center justify-center rounded-xl">
                    <ImageIcon
                      className="h-12 w-12 text-neutral-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </AspectRatio>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10">
            <Button
              variant="outline"
              disabled
              className="w-full max-w-md text-lg py-6 text-blue-600 border-blue-500 hover:bg-transparent"
            >
              Approval waiting...
            </Button>
          </div>

          <p className="mt-10 text-base text-neutral-600 dark:text-neutral-400">
            It takes <b>1–2 days</b> after uploading the school certification
            material.
            <br />
            It may be delayed further on holidays and weekends.
          </p>
        </div>
      </section>
    </Layout>
  );
}
