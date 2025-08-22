import { Button, Layout } from '@/components';

function VerificationPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 min-h-[80vh]">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Student Verification</h1>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            We will check whether the school you entered at the time of
            membership registration is certified.
            <br />
            Please upload documents that can be certified.
            <br />
            (Student card, Certificate of enrollment, Certificate of
            acceptance...)
          </p>
          <div className="mt-6">
            <Button>Upload Document</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default VerificationPage;
