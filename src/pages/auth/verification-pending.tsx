import { Layout } from '@/components';

function VerificationPendingPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 min-h-[80vh]">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Student Verification</h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              We will check whether the school you entered at the time of
              membership registration is certified.
              <br />
              It takes 1-2 working days after uploading the school certification
              material, and it may be delayed further depending on the volume of
              requests.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default VerificationPendingPage;
