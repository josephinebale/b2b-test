import type { ReactNode } from 'react';

type TextLine = 'sm' | 'md' | 'xl';

/* A control beside text centres against that text line, not the block and not
   by box top. One wrapper for every such pair: SectionHeadingRow asides,
   PageHeading actions, and the checkbox and avatar on a worker-selection row. */
export function LineAlignedControl({
  line,
  className,
  children,
}: {
  line: TextLine;
  className?: string;
  children: ReactNode;
}) {
  const classes = `line-aligned line-aligned--${line}${className ? ` ${className}` : ''}`;

  return <div className={classes}>{children}</div>;
}
