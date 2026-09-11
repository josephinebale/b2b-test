export type BreadcrumbCrumb = {
  id: string;
  label: string;
  role: 'organisation' | 'ancestor' | 'current';
};

export type VisibleBreadcrumbItem =
  | { type: 'ellipsis' }
  | { type: 'crumb'; crumb: BreadcrumbCrumb };

/** Space between crumbs: ol gap-2 plus the chevron and the li gap-2. */
export const BREADCRUMB_SEPARATOR_WIDTH = 32;

export function breadcrumbTrailWidth(
  items: VisibleBreadcrumbItem[],
  measure: (item: VisibleBreadcrumbItem) => number,
): number {
  if (items.length === 0) return 0;
  return items.reduce(
    (total, item, index) =>
      total + measure(item) + (index === 0 ? 0 : BREADCRUMB_SEPARATOR_WIDTH),
    0,
  );
}

/**
 * Keep the current node in full. When the trail is too wide, drop ancestors
 * from the left and replace them with one ellipsis crumb.
 */
export function visibleBreadcrumbItems(
  crumbs: BreadcrumbCrumb[],
  availableWidth: number,
  measure: (item: VisibleBreadcrumbItem) => number,
): VisibleBreadcrumbItem[] {
  if (crumbs.length === 0) return [];

  const asItems = (hidden: number): VisibleBreadcrumbItem[] => {
    const shown = crumbs.slice(hidden).map((crumb) => ({
      type: 'crumb' as const,
      crumb,
    }));
    return hidden > 0 ? [{ type: 'ellipsis' }, ...shown] : shown;
  };

  let hidden = 0;
  const maxHidden = Math.max(0, crumbs.length - 1);

  while (hidden <= maxHidden) {
    const items = asItems(hidden);
    if (breadcrumbTrailWidth(items, measure) <= availableWidth) return items;
    hidden += 1;
  }

  return asItems(maxHidden);
}
