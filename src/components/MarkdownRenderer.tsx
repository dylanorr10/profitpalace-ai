import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Lightbulb, Calculator, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mt-2 mb-1">{children}</h3>
        ),
        
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed">{children}</p>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 ml-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm leading-relaxed">{children}</li>
        ),
        
        // Code blocks
        code: ({ inline, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3">
              <code className="text-sm font-mono" {...props}>
                {children}
              </code>
            </pre>
          );
        },
        
        // Blockquotes (for key points)
        blockquote: ({ children }) => (
          <Card className="border-l-4 border-l-primary bg-primary/5 p-3 mb-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">{children}</div>
            </div>
          </Card>
        ),
        
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="w-full border-collapse border border-border rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody>{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-border">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-sm font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-sm">{children}</td>
        ),
        
        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        
        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic text-foreground/90">{children}</em>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {children}
          </a>
        ),
        
        // Horizontal rule
        hr: () => (
          <hr className="my-4 border-border" />
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
