import { useCallback, useState } from 'react';

import { Dropzone } from '@/components/dropzone';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Wiki, createWiki } from '@/data/wiki';
import { useUpstageDocumentParsing } from '@/hooks';

interface DocumentParserProps {
  mode?: 'default' | 'wiki-upload';
  onWikiCreated?: (wiki: Wiki) => void;
}

export function DocumentParser({
  mode = 'default',
  onWikiCreated,
}: DocumentParserProps) {
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

  // Wiki upload specific state
  const [wikiTitle, setWikiTitle] = useState('');
  const [isCreatingWiki, setIsCreatingWiki] = useState(false);

  // Generate formatted markdown content
  const getFormattedTextContent = useCallback(() => {
    if (!parsedDocument) return '';

    // First try to use direct markdown content from API
    if (
      parsedDocument.content.markdown &&
      parsedDocument.content.markdown.trim()
    ) {
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
    return (
      html
        // Remove image and table elements first
        .replace(
          /<(figure|img|table)[^>]*>.*?<\/\1>|<(figure|img|table)[^>]*\/>/gi,
          '',
        )

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
        .trim()
    );
  };

  const copyToClipboard = useCallback(
    async (content: string, section: string) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    },
    [],
  );

  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        setUploadedFiles(files);
        parseDocument(files[0]);

        // For wiki upload mode, auto-generate title from filename
        if (mode === 'wiki-upload') {
          const filename = files[0].name;
          const titleFromFilename = filename
            .replace(/\.[^/.]+$/, '') // Remove file extension
            .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
            .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
          setWikiTitle(titleFromFilename);
        }
      }
    },
    [parseDocument, mode],
  );

  const onRemoveFile = useCallback((fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((file) => file !== fileToRemove));
  }, []);

  const handleCreateWiki = async () => {
    if (!wikiTitle.trim() || !parsedDocument) {
      return;
    }

    setIsCreatingWiki(true);
    try {
      const wikiContent = getFormattedTextContent();
      const result = await createWiki({
        title: wikiTitle.trim(),
        content: wikiContent,
      });

      if (result && onWikiCreated) {
        onWikiCreated(result);
      }
    } finally {
      setIsCreatingWiki(false);
    }
  };

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
            maxSize={50 * 1024 * 1024} // 50MB
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
        <div className="space-y-6">
          {/* Wiki Upload Mode: Title Input */}
          {mode === 'wiki-upload' && (
            <Card>
              <CardHeader>
                <CardTitle>Create Wiki from Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="wiki-title">Wiki Title</Label>
                  <Input
                    id="wiki-title"
                    value={wikiTitle}
                    onChange={(e) => setWikiTitle(e.target.value)}
                    placeholder="Enter wiki title"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={handleCreateWiki}
                    disabled={isCreatingWiki || !wikiTitle.trim()}
                  >
                    {isCreatingWiki ? 'Creating Wiki...' : 'Create Wiki'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rendered Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Document Preview</CardTitle>
              {mode === 'default' && (
                <div className="space-x-2">
                  <Button
                    onClick={() =>
                      copyToClipboard(getFormattedTextContent(), 'markdown')
                    }
                    variant="outline"
                    size="sm"
                  >
                    {copiedSection === 'markdown' ? 'Copied!' : 'Copy Markdown'}
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
              )}
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <MarkdownRenderer content={getFormattedTextContent()} />
              </div>
            </CardContent>
          </Card>

          {/* Raw Markdown */}
          {mode === 'default' && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Markdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {getFormattedTextContent()}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
