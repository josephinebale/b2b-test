import { RotateCcw } from 'lucide-react';
import type { PersonaId } from '../lib/informationArchitecture';
import { PageVariantToggle } from './PageVariantToggle';
import { IconButton } from './ui/IconButton';

/** One dock for every moderator control, away from participant chrome. */
export function SessionQuestions({
  path,
  pageVariant,
  onTogglePageVariant,
  currentPersonaId,
  onSwitchPersona,
  onRestart,
}: {
  path: string;
  pageVariant: boolean;
  onTogglePageVariant: () => void;
  currentPersonaId: PersonaId;
  onSwitchPersona: (personaId: PersonaId) => void;
  onRestart: () => void;
}) {
  /* The label says where this goes, so the dialog carries the cost. */
  const confirmRestart = () => {
    const confirmed = window.confirm(
      'Restart session? The persona you are signed in as, where you were up to, and any bookings created in this session will be discarded.',
    );
    if (confirmed) onRestart();
  };
  return (
    <div className="session-questions-dock pointer-events-none sticky z-50 h-0">
      <div className="session-questions-controls pointer-events-auto">
        <PageVariantToggle
          path={path}
          active={pageVariant}
          onToggle={onTogglePageVariant}
          currentPersonaId={currentPersonaId}
          onSwitchPersona={onSwitchPersona}
        />

        {/* Leaving sits last, furthest from the switches used mid-session. */}
        <IconButton
          type="button"
          onClick={confirmRestart}
          aria-label="Restart session"
          data-tooltip="Restart session"
          className="ui-tooltip"
        >
          <RotateCcw className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  );
}
