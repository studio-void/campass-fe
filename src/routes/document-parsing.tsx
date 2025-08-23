import { createFileRoute } from '@tanstack/react-router';
import { DocumentParsingPage } from '@/pages/document-parsing/document-parsing-page';

export const Route = createFileRoute('/document-parsing')({
  component: DocumentParsingPage,
});