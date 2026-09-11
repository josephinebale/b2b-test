import { useEffect, useState } from 'react';

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '' ? '/' : hash;
}

/** Old `#/manage-house` bookmarks keep working after the location rename. */
export function canonicalPath(path: string): string {
  let next = path;
  if (next === '/team' || next.startsWith('/team/')) {
    next = `/workers${next.slice('/team'.length)}`;
  }
  if (next === '/manage-house' || next.startsWith('/manage-house/')) {
    next = `/manage-location${next.slice('/manage-house'.length)}`;
  }
  return next
    .replace(/\/house-name$/, '/location-name')
    .replace(/\/house-picture$/, '/location-picture');
}

/* Subscribers are held here as well as on `hashchange` so `navigate` can tell
   them straight away. The browser fires `hashchange` in a later task, so a
   caller that changes app state and navigates in the same handler would
   otherwise commit one render with the new state and the old route — which is
   how the header nav came to paint a frame with no active tab while entering a
   location. */
const routeListeners = new Set<() => void>();

export function useHashRoute(): string {
  const [path, setPath] = useState(() => canonicalPath(currentPath()));

  useEffect(() => {
    const onChange = () => {
      const current = currentPath();
      const next = canonicalPath(current);
      if (next !== current) {
        window.location.hash = next;
        return;
      }
      setPath(next);
    };

    window.addEventListener('hashchange', onChange);
    routeListeners.add(onChange);
    onChange();
    return () => {
      window.removeEventListener('hashchange', onChange);
      routeListeners.delete(onChange);
    };
  }, []);

  return path;
}

export function navigate(path: string): void {
  window.location.hash = path;
  window.scrollTo(0, 0);
  /* Read in the same tick as the caller's own state updates, so React batches
     the route and the node into one render. The native event still arrives
     later and resolves to the same path, which is a no-op re-render. */
  for (const listener of [...routeListeners]) {
    listener();
  }
}

export function href(path: string): string {
  return `#${path}`;
}

/** Moderator research screens, reached from the session landing before login. */
export const JOBS_TO_BE_DONE_ROUTE = '/jobs-to-be-done';
export const INFORMATION_ARCHITECTURE_ROUTE = '/information-architecture';
