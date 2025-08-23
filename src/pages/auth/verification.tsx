import { useEffect, useMemo, useState } from 'react';

import { FileText, Image as ImageIcon } from 'lucide-react';

import { Dropzone, Layout } from '@/components';
import { Button } from '@/components/ui/button';

type VerifiedStatus = 'none' | 'pending' | 'verified';

const ACCEPT = 'image/*,.pdf';
const MAX_SIZE = 10 * 1024 * 1024;

async function fetchVerifiedStatusMock(): Promise<VerifiedStatus> {
  await new Promise((r) => setTimeout(r, 300));
  return Math.random() < 0.5 ? 'none' : 'pending';
}

async function uploadDocumentMock(file: File): Promise<{ ok: true }> {
  void file;
  await new Promise((r) => setTimeout(r, 500));
  return { ok: true };
}

export default function VerificationPage() {
  const [status, setStatus] = useState<VerifiedStatus>('none');
  const [loading, setLoading] = useState(true);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await fetchVerifiedStatusMock();
      setStatus(s);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!uploadedFile || !uploadedFile.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  const handleDrop = (files: File[]) => {
    if (files.length > 0) setUploadedFile(files[0]);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadedFile(null);
  };

  const handleSubmit = async () => {
    if (!uploadedFile || submitting) return;
    setSubmitting(true);
    try {
      await uploadDocumentMock(uploadedFile);
      setStatus('pending');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="flex items-center justify-center min-h-[60vh]">
          <p className="text-sm text-neutral-500">
            Loading verification status…
          </p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {status === 'none' && (
        <FormView
          uploadedFile={uploadedFile}
          previewUrl={previewUrl}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {status === 'pending' && (
        <PendingView
          previewUrl={previewUrl}
          fileName={uploadedFile?.name ?? ''}
          isImage={!!uploadedFile && uploadedFile.type.startsWith('image/')}
        />
      )}

      {status === 'verified' && (
        <SuccessView
          chatLink="https://example.com/open-chat"
          password="123456"
        />
      )}
    </Layout>
  );
}

function FormView({
  uploadedFile,
  previewUrl,
  onDrop,
  onRemove,
  onSubmit,
  submitting,
}: {
  uploadedFile: File | null;
  previewUrl: string | null;
  onDrop: (files: File[]) => void;
  onRemove: (file: File) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const isImage = useMemo(
    () => !!uploadedFile && uploadedFile.type.startsWith('image/'),
    [uploadedFile],
  );

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

        <div className="mt-8 mx-auto w-full max-w-xl">
          <div className="relative rounded-2xl border-2 border-dashed border-neutral-300 overflow-hidden h-56">
            {uploadedFile ? (
              isImage && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="block w-full h-full object-contain bg-white"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <FileText className="h-10 w-10 text-neutral-400" />
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    {uploadedFile.name}
                  </div>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                <ImageIcon
                  className="h-10 w-10 text-neutral-400"
                  strokeWidth={1.5}
                />
                <div className="text-base font-medium text-neutral-700">
                  Click to upload or drag and drop
                </div>
                <div className="text-sm text-neutral-500">
                  Accepted formats: image/*, .pdf (Max size: 10 MB)
                </div>
              </div>
            )}

            <div className="absolute inset-0">
              <Dropzone
                onDrop={onDrop}
                onRemove={() => uploadedFile && onRemove(uploadedFile)}
                files={uploadedFile ? [uploadedFile] : []}
                accept={ACCEPT}
                multiple={false}
                maxSize={MAX_SIZE}
                className="w-full h-full !border-0 !shadow-none !ring-0 !outline-none opacity-0 cursor-pointer"
              />
            </div>

            {uploadedFile && (
              <div className="absolute left-0 right-0 bottom-0 bg-black/60 text-white text-sm px-3 py-2 flex items-center justify-between">
                <span className="truncate">{uploadedFile.name}</span>
                <button
                  onClick={() => onRemove(uploadedFile)}
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {!uploadedFile && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-400">
              <ImageIcon className="h-4 w-4" />
              <span>PNG, JPG, PDF (max 10MB)</span>
            </div>
          )}
        </div>

        <div className="mt-10">
          <Button
            onClick={onSubmit}
            disabled={!uploadedFile || submitting}
            className="w-full max-w-md text-lg py-6"
          >
            {submitting ? 'Uploading…' : 'Upload Completed'}
          </Button>
        </div>
      </div>
    </section>
  );
}

function PendingView({
  previewUrl,
  fileName,
  isImage,
}: {
  previewUrl: string | null;
  fileName: string;
  isImage: boolean;
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
          <div className="relative rounded-2xl border h-56 flex items-center justify-center overflow-hidden">
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="block w-full h-full object-contain bg-white"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                <ImageIcon className="h-12 w-12" strokeWidth={1.5} />
                {fileName ? <span className="text-sm">{fileName}</span> : null}
              </div>
            )}
          </div>
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
          <br />
          It may be delayed further on holidays and weekends.
        </p>
      </div>
    </section>
  );
}

function SuccessView({
  chatLink,
  password,
}: {
  chatLink: string;
  password?: string;
}) {
  return (
    <section className="flex flex-col items-center justify-center flex-1 w-full px-4 min-h-[80vh]">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          The school certification has been completed!
        </h1>

        <div className="mt-10 space-y-2 text-lg text-neutral-700 dark:text-neutral-300">
          <p>Only GIST students can enter</p>
          <p>Join the open chat room</p>
        </div>

        <div className="mt-10 mx-auto w-full max-w-xl rounded-2xl border p-6">
          <p className="text-lg">Open Chat Room Link:</p>
          {password ? (
            <p className="mt-1">
              Password: <b>{password}</b>
            </p>
          ) : null}
        </div>

        <div className="mt-10">
          <a href={chatLink} target="_blank" rel="noreferrer">
            <Button className="px-10 py-6 text-lg">Congratulations!!</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
