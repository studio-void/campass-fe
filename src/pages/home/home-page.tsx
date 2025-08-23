import { Layout } from '@/components';

import CalendarConnectTest from './components/calendar-connection-test';
import Hero from './components/hero';

export const HomePage: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <CalendarConnectTest />
    </Layout>
  );
};
