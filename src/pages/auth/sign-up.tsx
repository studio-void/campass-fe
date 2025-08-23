import { Layout } from '@/components';

import { SignUpForm } from './components/sign-up-form';

function SignUp() {
  return (
    <Layout disableHeaderHeight>
      <div className="w-full max-w-md pt-24">
        <h1 className="text-3xl font-bold text-center mb-10">Sign Up</h1>
        <SignUpForm />
      </div>
    </Layout>
  );
}

export default SignUp;
