import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section
      aria-label="Campass main hero"
      className="relative flex items-center min-h-[80vh] py-20"
    >
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <p className="font-medium text-primary text-xl">
              Make campus life more convenient
            </p>

            <div className="mt-3">
              <h1 className="sr-only">Campass</h1>
              <img
                src="/images/campass_wordmark.svg"
                alt="Campass"
                className="h-20 w-auto"
                decoding="sync"
                draggable={false}
              />
            </div>

            <h2 className="mt-4 font-extrabold leading-tight text-slate-900 text-5xl">
              Smart Campus Helpers
              <br className="hidden md:block" />
              for School Life
            </h2>

            <p className="mt-4 text-slate-600 max-w-xl text-xl">
              School-related work in one place
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/auth/sign-in">
                <Button size="lg">Get started</Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn more
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[520px]">
              <img
                src="/images/hero_image.png"
                alt="Campass hero illustration"
                className="w-full h-auto select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
