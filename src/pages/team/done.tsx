import { Link, useSearch } from '@tanstack/react-router';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';

type Search = {
  team?: string;
  project?: string;
  day?: string;
  start?: string;
  duration?: number;
  count?: number;
};

export default function TeamProjectDonePage() {
  const { team, project, day, start, duration, count } = useSearch({
    from: '/team/done',
  }) as Search;

  return (
    <Layout>
      <section className="w-full">
        <div className="w-full mx-auto  text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            <span className="block">Your reservation has been completed.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-neutral-600">
            I hope the AI agent was helpful to the team.
          </p>
        </div>

        {(team || project || day || start) && (
          <div className="mt-10 max-w-2xl mx-auto rounded-2xl border p-7 md:p-8 text-base leading-7">
            <div className="font-semibold mb-3">Summary</div>
            <ul className="space-y-1.5">
              {team && (
                <li>
                  Team: <b>{String(team).toUpperCase()}</b>
                </li>
              )}
              {project && (
                <li>
                  Project: <b>{project}</b>
                </li>
              )}
              {(day || start) && (
                <li>
                  First meeting:{' '}
                  <b>
                    {day} {start}
                  </b>
                  {duration ? <> · {duration}min</> : null}
                </li>
              )}
              {typeof count === 'number' && (
                <li>
                  Total meetings: <b>{count}</b>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link to="/home">
            <Button className="h-12 md:h-14 px-16 min-w-[320px] text-base md:text-lg">
              Go to Home
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
