import { Layout } from '@/components';

import { SignInForm } from './components/sign-in-form';

function SignIn() {
  return (
    <Layout disableHeaderHeight>
      <div className="w-full max-w-md pt-24">
        <h1 className="text-3xl font-bold text-center mb-10">Sign In</h1>
        <SignInForm />
      </div>
    </Layout>
  );
}

export default SignIn;
