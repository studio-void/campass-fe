import { DocumentParser } from '@/components';
import { Layout } from '@/components/layout';

export function DocumentParsingPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Document Parsing Tool
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload a PDF file and Upstage AI will analyze the document content
            and convert it to structured data and markdown format.
          </p>
        </div>
        <DocumentParser />
      </div>
    </Layout>
  );
}
