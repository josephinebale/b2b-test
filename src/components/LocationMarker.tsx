import type { Location } from '../data/locations';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

// 36px alongside a 36px avatar in list rows; 28px in compact controls and the
// scope rail.
const MARKER_SIZE = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-9 w-9 rounded-lg',
} as const;

export function LocationMarker({
  location,
  size = 'md',
}: {
  location: Pick<Location, 'id' | 'name'>;
  size?: keyof typeof MARKER_SIZE;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${MARKER_SIZE[size]} shrink-0 items-center justify-center bg-location-surface text-xs leading-none font-bold text-location-foreground`}
    >
      {initials(location.name)}
    </span>
  );
}
