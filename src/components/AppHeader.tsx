import { Fragment, useEffect, useRef } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import type { Grouping, Location } from '../data/locations';
import {
  NODE_NAV_ITEMS,
  NOTIFICATIONS_NODE_ITEM,
  PERSONAL_MENU_ITEMS,
  ROUTES,
  type Persona,
} from '../lib/informationArchitecture';
import { BOOKING_DETAIL_ROUTE } from '../lib/pageContent';
import { href } from '../lib/router';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { Avatar } from './Avatar';
import {
  accountAccessibleName,
  bookingsAccessibleName,
  messagesAccessibleName,
  notificationsAccessibleName,
} from './header-utils';
import { Logo } from './Logo';
import { NodeBreadcrumb } from './NodeBreadcrumb';
import { PinnedQuestion } from './PinnedQuestion';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';

type AppHeaderProps = {
  location: Location | null;
  grouping: Grouping;
  persona: Persona;
  nodeType: 'grouping' | 'location';
  path: string;
  unreadMessages: number;
  bookingsBadge: number;
  unreadNotifications: number;
  onSelectGrouping: (groupingId: string) => void;
  onSignOut: () => void;
};

export function AppHeader({
  location,
  grouping,
  persona,
  nodeType,
  path,
  unreadMessages,
  bookingsBadge,
  unreadNotifications,
  onSelectGrouping,
  onSignOut,
}: AppHeaderProps) {
  const accountMenu = useKeyboardMenu();
  const activeNavRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeNavRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [path]);

  const notificationsName = notificationsAccessibleName(unreadNotifications);
  const accountName = accountAccessibleName(persona.name);
  const visibleNavItems = NODE_NAV_ITEMS.filter(
    (item) =>
      item.placement === 'main' &&
      item.nodeTypes.some((itemNodeType) => itemNodeType === nodeType),
  );
  const navPath = nodeType === 'location' && path === '/' ? '/bookings' : path;

  return (
    <header className="app-header z-20">
      <div className="app-header-identity">
        <div
          className="app-header-row mx-auto flex max-w-page items-center justify-between gap-4 px-8"
          style={{ height: 'var(--header-identity-height)' }}
        >
          <div className="flex min-w-0 items-center gap-6">
            <a
              href={href(nodeType === 'location' ? '/bookings' : '/')}
              aria-label={
                nodeType === 'location'
                  ? 'Hireup for Providers bookings'
                  : 'Hireup for Providers dashboard'
              }
              className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Logo />
            </a>
            <span
              aria-hidden="true"
              className="h-6 w-px shrink-0 bg-border-subtle"
            />
            <NodeBreadcrumb
              location={location}
              grouping={grouping}
              nodeType={nodeType}
              onSelectGrouping={onSelectGrouping}
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <IconButton
              href={href(NOTIFICATIONS_NODE_ITEM.path)}
              aria-label={notificationsName}
              data-tooltip={notificationsName}
              className={`header-utility relative ui-tooltip ${
                path === NOTIFICATIONS_NODE_ITEM.path
                  ? 'header-utility--active'
                  : ''
              }`}
            >
              <Bell className="h-5 w-5" />
              <Badge count={unreadNotifications} />
            </IconButton>

            <div className="relative flex items-center">
              <Button
                ref={accountMenu.triggerRef}
                type="button"
                variant="ghost"
                size="default"
                onClick={accountMenu.toggle}
                onKeyDown={accountMenu.onTriggerKeyDown}
                aria-haspopup="menu"
                aria-expanded={accountMenu.open}
                aria-label={accountName}
                className="header-menu-trigger"
              >
                <Avatar name={persona.name} size="sm" />
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform ${
                    accountMenu.open ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              {accountMenu.open && (
                <Card className="absolute top-full right-0 z-20 mt-1 w-72 shadow-lg">
                  <div
                    ref={accountMenu.menuRef}
                    role="menu"
                    aria-label="Your account"
                    onKeyDown={accountMenu.onMenuKeyDown}
                    className="py-1"
                  >
                    <div className="px-3 py-2">
                      <p className="text-sm font-bold text-text">
                        {persona.name}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {persona.role}
                        {persona.team ? ` · ${persona.team}` : ''}
                      </p>
                    </div>
                    {PERSONAL_MENU_ITEMS.map(({ label, path: itemPath }) => (
                      <a
                        key={itemPath}
                        role="menuitem"
                        tabIndex={-1}
                        href={href(itemPath)}
                        onClick={() => accountMenu.close()}
                        className="block px-3 py-2 text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {label}
                      </a>
                    ))}
                    <div
                      role="separator"
                      className="border-t border-border-subtle"
                    />
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      type="button"
                      onClick={() => {
                        accountMenu.close();
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Log out
                    </button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {visibleNavItems.length > 1 && (
        <div className="app-header-nav-row mx-auto flex max-w-page items-stretch overflow-x-auto px-8">
          <nav className="flex h-full w-max items-stretch" aria-label="Main">
            {visibleNavItems.map((item) => {
              const visibleLabel =
                item.path === ROUTES.manageLocation &&
                location?.serviceType === 'home-community'
                  ? `${location.name} settings`
                  : item.label;
              const bookingRequestRoute =
                item.path === '/bookings' &&
                (navPath === '/request-booking' ||
                  navPath.startsWith('/bookings/request/') ||
                  navPath.startsWith(BOOKING_DETAIL_ROUTE));
              const active =
                bookingRequestRoute ||
                (item.path === '/'
                  ? navPath === '/'
                  : navPath.startsWith(item.path));
              const count =
                item.label === 'Bookings'
                  ? bookingsBadge
                  : item.label === 'Messages'
                    ? unreadMessages
                    : 0;

              const link = (
                <a
                  ref={active ? activeNavRef : undefined}
                  href={href(item.path)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={
                    item.label === 'Bookings'
                      ? bookingsAccessibleName(bookingsBadge)
                      : item.label === 'Messages'
                        ? messagesAccessibleName(unreadMessages)
                        : visibleLabel
                  }
                  className={`main-nav-link h-full shrink-0 text-sm ${
                    active
                      ? 'main-nav-link--active font-bold text-text'
                      : 'font-medium text-text-strong'
                  }`}
                >
                  <span className="main-nav-label" data-label={visibleLabel}>
                    <span>{visibleLabel}</span>
                  </span>
                  <Badge count={count} />
                </a>
              );

              if (item.label === 'Messages') {
                return (
                  <span key={item.path} className="flex h-full items-center">
                    {link}
                    <PinnedQuestion questionId="messages-nav" />
                  </span>
                );
              }

              return <Fragment key={item.path}>{link}</Fragment>;
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
