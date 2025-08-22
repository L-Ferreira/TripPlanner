import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  if (!content) return null;

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-p:text-gray-600 prose-p:text-sm prose-p:mb-2 prose-p:last:mb-0',
        'prose-ul:my-2 prose-ul:pl-4',
        'prose-li:text-gray-600 prose-li:text-sm prose-li:mb-1',
        'prose-strong:text-gray-900 prose-strong:font-semibold',
        'prose-em:text-gray-700 prose-em:italic',
        'prose-h1:text-lg prose-h1:font-bold prose-h1:text-gray-900 prose-h1:mb-2',
        'prose-h2:text-base prose-h2:font-semibold prose-h2:text-gray-900 prose-h2:mb-2',
        'prose-h3:text-sm prose-h3:font-medium prose-h3:text-gray-900 prose-h3:mb-1',
        'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600',
        'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-gray-100 prose-pre:p-2 prose-pre:rounded prose-pre:overflow-x-auto',
        className
      )}
    >
      <ReactMarkdown
        components={{
          // Customize list rendering to handle both - and * for unordered lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-600 text-sm" {...props}>
              {children}
            </li>
          ),
          // Ensure paragraphs have proper spacing
          p: ({ children, ...props }) => (
            <p className="text-gray-600 text-sm mb-2 last:mb-0" {...props}>
              {children}
            </p>
          ),
        }}
        remarkPlugins={[remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
