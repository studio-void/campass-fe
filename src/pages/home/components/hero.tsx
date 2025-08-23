import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section
      aria-label="Campass main hero"
      className="relative flex items-center min-h-[80vh] py-20 w-full"
    >
      <div className="w-full">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-2xl flex flex-col items-center text-center">
            <p className="font-medium text-primary text-xl mb-2">
              Make campus life more convenient
            </p>

            {/* <div className="mt-3 mb-2">
              <h1 className="sr-only">Campass</h1>
              <img
                src="/images/campass_wordmark.svg"
                alt="Campass"
                className="h-20 w-auto mx-auto"
                decoding="sync"
                draggable={false}
              />
            </div> */}

            <h2 className="mt-4 font-black tracking-tight leading-tight text-slate-900 text-6xl">
              Smart Campus Helpers
              <br className="hidden md:block" />
              <span className="inline-flex items-center gap-4 whitespace-nowrap">
                <span className="inline-flex items-center whitespace-nowrap">
                  for School Life
                </span>
                <span
                  className="inline-flex items-center gap-1 whitespace-nowrap font-bold"
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(251, 84%, 68%) 0%, hsl(232, 86%, 83%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  with Upstage
                  <img
                    src="/images/upstage.png"
                    width={40}
                    style={{
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      position: 'relative',
                      top: '-12px',
                      left: '6px',
                    }}
                  />
                </span>
              </span>
            </h2>

            <p className="mt-4 text-slate-600 max-w-xl text-xl mx-auto">
              School-related work in one place
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth/sign-in">
                <Button size="lg">Get started</Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn more
              </Button>
            </div>
          </div>
        </div>
        {/* Harmonized vivid blobs - now also on the left side */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute -top-40 -left-60 w-[480px] h-[480px] bg-primary/40 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob" />
          <div className="absolute top-24 right-[-120px] w-[420px] h-[420px] bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob" />
          <div className="absolute bottom-[-80px] left-[72%] w-[340px] h-[340px] bg-primary/70 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob" />
          <div className="absolute bottom-[-120px] -left-40 w-[220px] h-[220px] bg-primary/40 rounded-full mix-blend-multiply filter blur-2xl opacity-18 animate-blob" />
          <div className="absolute top-[85%] left-[-40px] w-[180px] h-[180px] bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-18 animate-blob" />
          {/* New blobs for left/center area */}
          <div className="absolute top-0 -left-96 w-[420px] h-[420px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob" />
          <div className="absolute top-[30%] left-[-180px] w-[260px] h-[260px] bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-18 animate-blob" />
          <div className="absolute top-[75%] left-[-80px] w-[260px] h-[260px] bg-violet-200 rounded-full mix-blend-multiply filter blur-2xl opacity-18 animate-blob" />
          <div className="absolute top-[55%] right-[-100px] w-[260px] h-[260px] bg-pink-400/80 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob" />
        </div>
        <style>{`
          .animate-blob {
            animation: blobMorph 8s ease-in-out infinite;
          }
          @keyframes blobMorph {
            0%, 100% { transform: scale(1) translateY(0); }
            33% { transform: scale(1.08) translateY(-10px); }
            66% { transform: scale(0.95) translateY(8px); }
          }
        `}</style>
      </div>
    </section>
  );
}
