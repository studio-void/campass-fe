import { useState } from 'react';

import { Button, Dropzone, Layout } from '@/components';

function VerificationPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      console.log('File uploaded:', files[0]);
    }
  };

  const handleFileRemove = (fileToRemove: File) => {
    setUploadedFile(null);
    console.log('File removed:', fileToRemove);
  };

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
              Please upload documents that can be certified.
              <br />
              (Student card, Certificate of enrollment, Certificate of
              acceptance...)
            </p>
          </div>

          <div className="mb-6">
            <Dropzone
              onDrop={handleFileDrop}
              onRemove={handleFileRemove}
              files={uploadedFile ? [uploadedFile] : []}
              accept="image/*,.pdf"
              multiple={false}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>

          <div className="text-center">
            <Button disabled={!uploadedFile} className="min-w-[150px]">
              Submit Document
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default VerificationPage;
