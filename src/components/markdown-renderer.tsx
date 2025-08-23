import 'highlight.js/styles/github.css';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Import highlight.js CSS

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  // Handle empty or whitespace-only content
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return (
      <div
        className={`prose prose-lg max-w-none dark:prose-invert ${className}`}
      >
        <div className="text-muted-foreground text-sm italic">
          내용이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Custom heading components with proper spacing
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-6 mt-8 pb-2 border-b border-border first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-4 mt-8 pb-2 border-b border-border">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mb-3 mt-6">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mb-2 mt-4">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-semibold mb-2 mt-3">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold mb-2 mt-2">{children}</h6>
          ),
          // Custom paragraph with proper spacing
          p: ({ children }) => (
            <p className="mb-4 leading-7 text-foreground">{children}</p>
          ),
          // Custom code blocks
          code: ({ className, children, ...props }: any) => {
            if (props.inline) {
              return (
                <code
                  className="px-1.5 py-0.5 text-sm bg-muted text-muted-foreground rounded font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // Custom blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 rounded-r">
              {children}
            </blockquote>
          ),
          // Custom lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          // Custom links
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-4"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          // Custom tables (GitHub Flavored Markdown)
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
          // Custom horizontal rule
          hr: () => <hr className="my-8 border-t border-border" />,
          // Custom image
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm my-4"
              {...props}
            />
          ),
        }}
      >
        {trimmedContent}
      </ReactMarkdown>
    </div>
  );
}
