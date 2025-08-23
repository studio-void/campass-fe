import { useState } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';
import { Image as ImageIcon } from 'lucide-react';

import { Layout } from '@/components';
import { Dropzone } from '@/components';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type SearchShape = { mode?: 'form' | 'pending' };

export default function VerificationPage() {
  const navigate = useNavigate();
  const search = useSearch({
    from: '/auth/verification',
    select: (s: SearchShape) => s,
  });
  const mode = search.mode ?? 'form';

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrop = (files: File[]) => {
    if (files.length > 0) setUploadedFile(files[0]);
  };
  const handleRemove = () => setUploadedFile(null);

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    navigate({ to: '/auth/verification', search: { mode: 'pending' } });
  };

  return (
    <Layout>
      {mode === 'form' ? (
        <FormView
          uploadedFile={uploadedFile}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onSubmit={handleSubmit}
        />
      ) : (
        <PendingView />
      )}
    </Layout>
  );
}

function FormView({
  uploadedFile,
  onDrop,
  onRemove,
  onSubmit,
}: {
  uploadedFile: File | null;
  onDrop: (files: File[]) => void;
  onRemove: (file: File) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="flex flex-col items-center justify-center flex-1 w-full px-4 min-h-[80vh]">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold">School certification</h1>

        <p className="mt-8 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
          We will check whether the school you entered
          <br />
          at the time of membership registration is certified.
          <br />
          Please upload documents that can be certified.
        </p>
        <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400">
          (Student card, Certificate of enrollment, Certificate of acceptance…)
        </p>

        <div className="mt-12 mx-auto w-full max-w-xl">
          <CardContent className="p-0">
            <AspectRatio ratio={3 / 1}>
              {' '}
              <div className="mx-auto w-full max-w-xl">
                <Dropzone
                  onDrop={onDrop}
                  onRemove={() => uploadedFile && onRemove(uploadedFile)}
                  files={uploadedFile ? [uploadedFile] : []}
                  accept="image/*,.pdf"
                  multiple={false}
                  maxSize={10 * 1024 * 1024}
                />
              </div>
            </AspectRatio>
          </CardContent>

          {uploadedFile ? (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 truncate">
              {uploadedFile.name}
            </p>
          ) : (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-400">
              <ImageIcon className="h-4 w-4" />
              <span>PNG, JPG, PDF (max 10MB)</span>
            </div>
          )}
        </div>

        <div className="mt-10">
          <Button
            onClick={onSubmit}
            disabled={!uploadedFile}
            className="w-full max-w-md text-lg py-6"
          >
            Upload Completed
          </Button>
        </div>
      </div>
    </section>
  );
}

function PendingView() {
  return (
    <section className="flex flex-col items-center justify-center flex-1 w-full px-4 min-h-[80vh]">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold">School certification</h1>

        <p className="mt-8 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
          We will check whether the school you entered
          <br />
          at the time of membership registration is certified.
          <br />
          Please upload documents that can be certified.
        </p>
        <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400">
          (Student card, Certificate of enrollment, Certificate of acceptance…)
        </p>

        <div className="mt-12 mx-auto w-[260px]">
          <Card className="rounded-xl">
            <CardContent className="p-0">
              <AspectRatio ratio={1}>
                <div className="h-full w-full flex items-center justify-center rounded-xl">
                  <ImageIcon
                    className="h-12 w-12 text-neutral-400"
                    strokeWidth={1.5}
                  />
                </div>
              </AspectRatio>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <Button
            variant="outline"
            disabled
            className="w-full max-w-md text-lg py-6 text-blue-600 border-blue-500 hover:bg-transparent"
          >
            Approval waiting...
          </Button>
        </div>

        <p className="mt-10 text-base text-neutral-600 dark:text-neutral-400">
          It takes <b>1–2 days</b> after uploading the school certification
          material.
          <br />ㅇ It may be delayed further on holidays and weekends.
        </p>
      </div>
    </section>
  );
}
