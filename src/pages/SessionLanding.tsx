import { Fragment } from 'react';
import { AppWindow, ChevronRight, ListChecks, Network } from 'lucide-react';
import { AppFooter } from '../components/AppFooter';
import { Logo } from '../components/Logo';
import { PageHeading } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import {
  ORGANISATIONS,
  personasForOrganisation,
  type PersonaId,
} from '../lib/informationArchitecture';
import {
  href,
  INFORMATION_ARCHITECTURE_ROUTE,
  JOBS_TO_BE_DONE_ROUTE,
} from '../lib/router';

type SessionLandingProps = {
  pickingPersona: boolean;
  onPlay: () => void;
  onBack: () => void;
  onChoosePersona: (personaId: PersonaId) => void;
};

export function SessionLanding({
  pickingPersona,
  onPlay,
  onBack,
  onChoosePersona,
}: SessionLandingProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="app-header">
        <div className="app-header-row mx-auto flex max-w-page items-center px-8">
          <Logo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-8 py-8">
        {pickingPersona ? (
          <>
            <PageHeading
              title="Choose a persona"
              actions={
                <Button type="button" onClick={onBack}>
                  Back
                </Button>
              }
            />
            <Card>
              <div className="py-1">
                {ORGANISATIONS.map((organisation) => (
                  <Fragment key={organisation}>
                    <p className="px-3 pb-1 pt-2 text-xs font-bold text-text-secondary">
                      {organisation}
                    </p>
                    {personasForOrganisation(organisation).map((persona) => (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => onChoosePersona(persona.id)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-subtle"
                      >
                        <span className="min-w-0 flex-1">
                          <EntityLink as="span" className="block">
                            {persona.name}
                          </EntityLink>
                          <span className="mt-1 block text-sm font-normal text-text-secondary">
                            {persona.role}
                            {persona.team ? ` · ${persona.team}` : ''}
                            {` · ${persona.sector === 'aged care' ? 'Aged care' : 'Disability'}`}
                          </span>
                        </span>
                        <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
                      </button>
                    ))}
                  </Fragment>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <>
            <PageHeading title="Start a session" />
            <div className="space-y-4">
              <button
                type="button"
                onClick={onPlay}
                className="ui-linked-surface w-full text-left"
              >
                <Card className="ui-inset-card flex items-center gap-3">
                  <AppWindow className="h-5 w-5 shrink-0 text-text-strong" />
                  <p className="font-bold text-text">
                    <EntityLink as="span">Play the prototype</EntityLink>
                  </p>
                </Card>
              </button>
              <a
                href={href(JOBS_TO_BE_DONE_ROUTE)}
                className="ui-linked-surface"
              >
                <Card className="ui-inset-card flex items-center gap-3">
                  <ListChecks className="h-5 w-5 shrink-0 text-text-strong" />
                  <p className="font-bold text-text">
                    <EntityLink as="span">Jobs to be done</EntityLink>
                  </p>
                </Card>
              </a>
              <a
                href={href(INFORMATION_ARCHITECTURE_ROUTE)}
                className="ui-linked-surface"
              >
                <Card className="ui-inset-card flex items-center gap-3">
                  <Network className="h-5 w-5 shrink-0 text-text-strong" />
                  <p className="font-bold text-text">
                    <EntityLink as="span">Information architecture</EntityLink>
                  </p>
                </Card>
              </a>
            </div>
          </>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
