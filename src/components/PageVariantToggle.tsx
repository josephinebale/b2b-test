import { Fragment } from 'react';
import { Check, Layers, UserRoundCog } from 'lucide-react';
import {
  ORGANISATIONS,
  personasForOrganisation,
  type PersonaId,
} from '../lib/informationArchitecture';
import { variantLabel } from '../lib/pageVariants';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';

const MENU_ROW =
  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-text-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * The structural moderator switches. They carry no dock of their own: the
 * research dock places them, so every behind-the-scenes control sits together.
 */
export function PageVariantToggle({
  path,
  active,
  onToggle,
  currentPersonaId,
  onSwitchPersona,
}: {
  path: string;
  active: boolean;
  onToggle: () => void;
  currentPersonaId: PersonaId;
  onSwitchPersona: (personaId: PersonaId) => void;
}) {
  const label = variantLabel(path);
  const menu = useKeyboardMenu();

  return (
    <>
      <div className="relative">
        <IconButton
          ref={menu.triggerRef}
          type="button"
          onClick={menu.toggle}
          onKeyDown={menu.onTriggerKeyDown}
          aria-haspopup="menu"
          aria-expanded={menu.open}
        >
          <UserRoundCog className="h-5 w-5" />
        </IconButton>

        {menu.open && (
          <Card className="absolute bottom-full right-0 z-20 mb-1 w-72 shadow-lg">
            <div
              ref={menu.menuRef}
              role="menu"
              onKeyDown={menu.onMenuKeyDown}
              className="max-h-[70vh] overflow-y-auto py-1"
            >
              {ORGANISATIONS.map((organisation, organisationIndex) => (
                <Fragment key={organisation}>
                  <p
                    className={`px-3 pb-1 text-xs font-bold text-text-secondary ${
                      organisationIndex === 0 ? 'pt-2' : 'pt-3'
                    }`}
                  >
                    {organisation}
                  </p>
                  {personasForOrganisation(organisation).map((persona) => {
                    const selected = persona.id === currentPersonaId;
                    return (
                      <button
                        key={persona.id}
                        role="menuitem"
                        tabIndex={-1}
                        type="button"
                        onClick={() => {
                          onSwitchPersona(persona.id);
                          menu.close();
                        }}
                        className={`${MENU_ROW} ${
                          selected
                            ? 'bg-surface-selected'
                            : 'hover:bg-surface-subtle'
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1">
                            <span className="truncate">{persona.name}</span>
                            {selected && (
                              <Check className="h-5 w-5 shrink-0 text-brand" />
                            )}
                          </span>
                          <span className="mt-1 block truncate text-xs font-normal text-text-secondary">
                            {persona.role}
                            {persona.team ? ` · ${persona.team}` : ''}
                            {` · ${persona.sector === 'aged care' ? 'Aged care' : 'Disability'}`}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </Card>
        )}
      </div>

      {label && (
        <IconButton
          type="button"
          onClick={onToggle}
          aria-label={label}
          data-tooltip={label}
          aria-pressed={active}
          className="ui-tooltip"
        >
          <Layers className="h-5 w-5" />
        </IconButton>
      )}
    </>
  );
}
