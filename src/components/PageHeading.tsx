import type { ReactNode } from 'react';
import { href } from '../lib/router';
import { LineAlignedControl } from './LineAlignedControl';
import { Button } from './ui/Button';

export function RequestBookingButton() {
  return (
    <Button
      href={href('/request-booking')}
      variant="primary"
      className="shrink-0"
    >
      Request booking
    </Button>
  );
}

type PageHeadingProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeading({ title, description, actions }: PageHeadingProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-text">{title}</h1>
        {description && (
          <p className="mt-2 max-w-content text-sm text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <LineAlignedControl line="xl" className="shrink-0 gap-2">
          {actions}
        </LineAlignedControl>
      )}
    </div>
  );
}
