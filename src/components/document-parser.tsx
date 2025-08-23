import { useCallback, useState } from 'react';

import { Dropzone } from '@/components/dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpstageDocumentParsing } from '@/hooks';

export function DocumentParser() {
  const {
    isLoading,
    error,
    parsedDocument,
    parseDocument,
    downloadAsMarkdown,
    clearResults,
  } = useUpstageDocumentParsing();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Generate formatted markdown content
  const getFormattedTextContent = useCallback(() => {
    if (!parsedDocument) return '';

    // First try to use direct markdown content from API
    if (parsedDocument.content.markdown && parsedDocument.content.markdown.trim()) {
      // Filter out image/table references from markdown
      return parsedDocument.content.markdown
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image markdown
        .replace(/\|.*?\|/g, '') // Remove table rows
        .replace(/\n{3,}/g, '\n\n') // Clean up extra line breaks
        .trim();
    }

    // If no markdown, try to use HTML and convert to markdown
    if (parsedDocument.content.html && parsedDocument.content.html.trim()) {
      return convertHtmlToMarkdown(parsedDocument.content.html);
    }

    // If no HTML, try direct text content
    if (parsedDocument.content.text && parsedDocument.content.text.trim()) {
      return parsedDocument.content.text;
    }

    // Fallback: construct markdown from filtered elements
    return parsedDocument.elements
      .filter(
        (element) =>
          element.category !== 'figure' &&
          element.category !== 'image' &&
          element.category !== 'table' &&
          element.content.text &&
          element.content.text.trim() !== '',
      )
      .map((element) => {
        const text = element.content.text.trim();
        switch (element.category) {
          case 'heading1':
          case 'title':
            return `# ${text}`;
          case 'heading2':
            return `## ${text}`;
          case 'heading3':
            return `### ${text}`;
          case 'heading4':
            return `#### ${text}`;
          case 'heading5':
            return `##### ${text}`;
          case 'heading6':
            return `###### ${text}`;
          case 'list':
            return text
              .split('\n')
              .map((line) => (line.trim() ? `- ${line.trim()}` : ''))
              .filter((line) => line)
              .join('\n');
          default:
            return text;
        }
      })
      .join('\n\n');
  }, [parsedDocument]);

  // HTML to Markdown conversion function
  const convertHtmlToMarkdown = (html: string): string => {
    return html
      // Remove image and table elements first
      .replace(/<(figure|img|table)[^>]*>.*?<\/\1>|<(figure|img|table)[^>]*\/>/gi, '')
      
      // Convert heading tags to markdown
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      
      // Convert paragraph tags
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      
      // Convert line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      
      // Convert emphasis tags
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      
      // Convert list items
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '\n')
      
      // Remove remaining HTML tags
      .replace(/<[^>]*>/g, '')
      
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      
      // Clean up multiple line breaks
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const copyToClipboard = useCallback(async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        setUploadedFiles(files);
        parseDocument(files[0]);
      }
    },
    [parseDocument],
  );

  const onRemoveFile = useCallback((fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((file) => file !== fileToRemove));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF Document Parser</CardTitle>
        </CardHeader>
        <CardContent>
          <Dropzone
            onDrop={onDrop}
            accept="application/pdf"
            multiple={false}
            maxSize={10 * 1024 * 1024} // 10MB
            disabled={isLoading}
            files={uploadedFiles}
            onRemove={onRemoveFile}
          />

          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-600">Parsing document...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parsing Results */}
      {parsedDocument && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Parsed Markdown</CardTitle>
            <div className="space-x-2">
              <Button
                onClick={() => copyToClipboard(getFormattedTextContent(), 'markdown')}
                variant="outline"
                size="sm"
              >
                {copiedSection === 'markdown' ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                onClick={() => downloadAsMarkdown()}
                variant="outline"
                size="sm"
              >
                Download
              </Button>
              <Button onClick={clearResults} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {getFormattedTextContent()}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
