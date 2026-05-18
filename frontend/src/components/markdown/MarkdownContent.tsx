import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

type MarkdownContentProps = {
  content: string
  className?: string
  emptyMessage?: string
}

export function MarkdownContent({ content, className, emptyMessage = 'No content yet.' }: MarkdownContentProps) {
  if (!content.trim()) {
    return <p className="leading-8 text-slate-700 dark:text-slate-300">{emptyMessage}</p>
  }

  return (
    <div className={cn('space-y-4 text-slate-700 dark:text-slate-300', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100" {...props} />,
          h2: (props) => <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100" {...props} />,
          h3: (props) => <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100" {...props} />,
          p: (props) => <p className="leading-8" {...props} />,
          ul: (props) => <ul className="list-disc space-y-2 pl-6" {...props} />,
          ol: (props) => <ol className="list-decimal space-y-2 pl-6" {...props} />,
          li: (props) => <li className="leading-7" {...props} />,
          blockquote: (props) => (
            <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 dark:border-slate-700 dark:text-slate-400" {...props} />
          ),
          a: (props) => <a className="text-blue-600 underline underline-offset-4 hover:text-blue-700" {...props} />,
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className)
            if (isBlock) {
              return (
                <code
                  className={cn('block overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100', className)}
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100" {...props}>
                {children}
              </code>
            )
          },
          pre: (props) => <pre className="overflow-x-auto rounded-xl bg-slate-950 p-0" {...props} />,
          hr: (props) => <hr className="border-slate-200 dark:border-slate-800" {...props} />,
          table: (props) => <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm" {...props} /></div>,
          thead: (props) => <thead className="border-b border-slate-200 dark:border-slate-800" {...props} />,
          th: (props) => <th className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100" {...props} />,
          td: (props) => <td className="border-b border-slate-100 px-3 py-2 dark:border-slate-900" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
