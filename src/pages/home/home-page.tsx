import { Layout } from '@/components';

import CalendarConnectTest from './components/CalendarConnectTest';
import Hero from './components/hero';

export const HomePage: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <CalendarConnectTest />
    </Layout>
  );
};
