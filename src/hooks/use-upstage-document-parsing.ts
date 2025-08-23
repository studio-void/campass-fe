import { useState } from 'react';

export interface DocumentElement {
  category: string;
  content: {
    html: string;
    markdown: string;
    text: string;
  };
  coordinates: Array<{
    x: number;
    y: number;
  }>;
  id: number;
  page: number;
}

export interface DocumentParsingResponse {
  api: string;
  content: {
    html: string;
    markdown: string;
    text: string;
  };
  elements: DocumentElement[];
  model: string;
  usage: {
    pages: number;
  };
}

interface UseUpstageDocumentParsingReturn {
  isLoading: boolean;
  error: string | null;
  parsedDocument: DocumentParsingResponse | null;
  parseDocument: (file: File) => Promise<void>;
  downloadAsMarkdown: (filename?: string) => void;
  clearResults: () => void;
}

export function useUpstageDocumentParsing(): UseUpstageDocumentParsingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedDocument, setParsedDocument] = useState<DocumentParsingResponse | null>(null);

  const parseDocument = async (file: File): Promise<void> => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    // PDF file validation
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedDocument(null);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('output_formats', '["html", "markdown", "text"]');
      formData.append('base64_encoding', '["table"]');
      formData.append('ocr', 'auto');
      formData.append('coordinates', 'true');
      formData.append('model', 'document-parse');

      const response = await fetch('https://api.upstage.ai/v1/document-digitization', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_UPSTAGE_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: DocumentParsingResponse = await response.json();
      setParsedDocument(data);
    } catch (error) {
      console.error('Document parsing error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while parsing the document.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsMarkdown = (filename?: string): void => {
    if (!parsedDocument) {
      setError('No parsed document available.');
      return;
    }

    try {
      // Extract text elements with proper markdown formatting
      let markdownContent = '';
      
      // If there's direct text content, use it
      if (parsedDocument.content.text && parsedDocument.content.text.trim()) {
        markdownContent = parsedDocument.content.text;
      } else if (parsedDocument.content.html) {
        // Convert HTML to markdown while preserving structure
        markdownContent = convertHtmlToMarkdown(parsedDocument.content.html);
      } else {
        // Fallback: construct markdown from elements
        markdownContent = parsedDocument.elements
          .filter(element => 
            element.category !== 'figure' && 
            element.category !== 'image' && 
            element.content.text && 
            element.content.text.trim() !== ''
          )
          .map(element => {
            const text = element.content.text.trim();
            // Format based on category
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
                // Handle list items
                return text.split('\n').map(line => 
                  line.trim() ? `- ${line.trim()}` : ''
                ).filter(line => line).join('\n');
              case 'paragraph':
              default:
                return text;
            }
          })
          .join('\n\n');
      }

      if (!markdownContent.trim()) {
        setError('No text content found in the document.');
        return;
      }

      // Clean up the markdown content
      markdownContent = markdownContent
        .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
        .trim();

      // File download
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename || `parsed_document_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Error occurred while downloading the file.');
    }
  };

  const clearResults = (): void => {
    setParsedDocument(null);
    setError(null);
  };

  return {
    isLoading,
    error,
    parsedDocument,
    parseDocument,
    downloadAsMarkdown,
    clearResults,
  };
}

// HTML to Markdown conversion helper function
function convertHtmlToMarkdown(html: string): string {
  return html
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
    
    // Convert list items (basic)
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
}