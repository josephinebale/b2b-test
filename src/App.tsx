import { useCallback, useEffect, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { SessionQuestions } from './components/SessionQuestions';
import {
  GROUPING,
  descendantLocationIds,
  findGrouping,
  findLocationForOrganisation,
  getLocationData,
  groupingsForLocation,
  locationsForOrganisation,
  type Booking,
} from './data/locations';
import {
  PERSONAS,
  ROUTES,
  personaById,
  type PersonaId,
} from './lib/informationArchitecture';
import {
  LOCATION_PROFILE_PREVIEW_ROUTE,
  clearLocationProfiles,
} from './lib/locationProfiles';
import {
  BOOKING_DETAIL_ROUTE,
  WORKERS_ROUTE,
  bookingViewFromPath,
  workerIdFromPath,
} from './lib/pageContent';
import {
  INFORMATION_ARCHITECTURE_ROUTE,
  JOBS_TO_BE_DONE_ROUTE,
  navigate,
  useHashRoute,
} from './lib/router';
import {
  clearLastLocationId,
  clearSession,
  readLastLocationId,
  readLastGroupingId,
  readLastNodeType,
  readPersonaId,
  readPrototypeStarted,
  readSignedIn,
  writeLastLocationId,
  writeLastGroupingId,
  writeLastNodeType,
  writePersonaId,
  writePrototypeStarted,
  writeSignedIn,
} from './lib/session';
import { ChooseLocation } from './pages/ChooseLocation';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { BookingRequest } from './pages/BookingRequest';
import { Messages } from './pages/Messages';
import { Notifications, notificationCount } from './pages/Notifications';
import { LocationProfilePreview } from './pages/LocationProfilePreview';
import { InformationArchitecture } from './pages/InformationArchitecture';
import { JobsToBeDone } from './pages/JobsToBeDone';
import { PrototypeStart } from './pages/PrototypeStart';
import { SessionLanding } from './pages/SessionLanding';
import {
  ManageLocationSettings,
  OrganisationSettings,
  YourAccountSettings,
} from './pages/Settings';
import { SignedOut } from './pages/SignedOut';
import { STUB_TITLES, Stub } from './pages/Stub';
import { Workers } from './pages/Workers';
import { WorkerProfile } from './pages/WorkerProfile';

export default function App() {
  const path = useHashRoute();
  const [started, setStarted] = useState(readPrototypeStarted);
  const [pendingPersonaId, setPendingPersonaId] = useState<PersonaId | null>(
    null,
  );
  const [pickingPersona, setPickingPersona] = useState(false);
  const [signedIn, setSignedIn] = useState(readSignedIn);
  const [locationId, setLocationId] =
    useState<string | null>(readLastLocationId);
  const [nodeType, setNodeType] = useState(readLastNodeType);
  const [groupingId, setGroupingId] = useState(readLastGroupingId);
  const [personaId, setPersonaId] = useState<PersonaId>(readPersonaId);
  const [unreadOverride, setUnreadOverride] = useState<number | null>(null);
  const [pageVariant, setPageVariant] = useState(false);
  const [createdBookings, setCreatedBookings] = useState<Booking[]>([]);

  const persona = personaById(personaId);
  const entryGrouping = findGrouping(persona.entry.groupingId) ?? GROUPING;
  const selectedGrouping = findGrouping(groupingId);
  const grouping =
    selectedGrouping?.organisation === persona.organisation
      ? selectedGrouping
      : entryGrouping;
  const organisationLocations = locationsForOrganisation(persona.organisation);
  const activeLocation = findLocationForOrganisation(
    locationId,
    persona.organisation,
  );
  const groupingLocationId =
    descendantLocationIds(grouping)[0] ?? organisationLocations[0].id;
  const notificationLocationIds =
    persona.entry.nodeType === 'location'
      ? [persona.entry.locationId]
      : descendantLocationIds(entryGrouping);
  const notificationData = notificationLocationIds.map((notificationLocationId) => {
    const locationData = getLocationData(notificationLocationId);
    const createdForLocation = createdBookings.filter(
      (booking) => booking.locationId === notificationLocationId,
    );

    return {
      ...locationData,
      requestsToAccept:
        locationData.requestsToAccept + createdForLocation.length,
      unreadMessages:
        activeLocation?.id === notificationLocationId
          ? unreadOverride ?? locationData.unreadMessages
          : locationData.unreadMessages,
    };
  });

  const selectLocation = useCallback(
    (nextLocationId: string, preferredGroupingId?: string) => {
      const nextLocation = findLocationForOrganisation(
        nextLocationId,
        persona.organisation,
      );
      if (!nextLocation) return;
      const parents = groupingsForLocation(nextLocation.id).filter(
        (parent) => parent.organisation === persona.organisation,
      );
      const preferredParent = parents.find(
        (parent) => parent.id === preferredGroupingId,
      );
      const nextGroupingId =
        preferredParent?.id ??
        (parents.some((parent) => parent.id === grouping.id)
          ? grouping.id
          : parents[0]?.id ?? entryGrouping.id);
      writeLastGroupingId(nextGroupingId);
      writeLastLocationId(nextLocation.id);
      writeLastNodeType('location');
      setGroupingId(nextGroupingId);
      setLocationId(nextLocation.id);
      setNodeType('location');
      setUnreadOverride(null);
    },
    [entryGrouping.id, grouping.id, persona.organisation],
  );

  const selectGrouping = useCallback(
    (nextGroupingId: string) => {
      const nextGrouping = findGrouping(nextGroupingId);
      if (!nextGrouping || nextGrouping.organisation !== persona.organisation) {
        return;
      }
      writeLastGroupingId(nextGrouping.id);
      writeLastNodeType('grouping');
      setGroupingId(nextGrouping.id);
      setNodeType('grouping');
      setUnreadOverride(null);
      navigate('/');
    },
    [persona.organisation],
  );

  const switchPersona = useCallback((nextPersonaId: PersonaId) => {
    const persona = personaById(nextPersonaId);
    writePersonaId(persona.id);
    writeLastGroupingId(persona.entry.groupingId);
    writeLastNodeType(persona.entry.nodeType);
    setPersonaId(persona.id);
    setGroupingId(persona.entry.groupingId);
    setNodeType(persona.entry.nodeType);
    setUnreadOverride(null);

    if (persona.entry.nodeType === 'location') {
      writeLastLocationId(persona.entry.locationId);
      setLocationId(persona.entry.locationId);
    } else {
      setLocationId(null);
    }
    navigate(
      persona.entry.nodeType === 'location' ? '/bookings' : '/',
    );
  }, []);

  const onUnreadChange = useCallback((count: number) => {
    setUnreadOverride(count);
  }, []);

  /* Between participants: drop everything the last session wrote, so the run
     starts where no location has been chosen. The moderator's annotation
     preference is deliberately left alone. */
  const restart = useCallback(() => {
    clearSession();
    clearLocationProfiles();
    setStarted(false);
    setPendingPersonaId(null);
    setPickingPersona(false);
    setSignedIn(readSignedIn());
    setLocationId(null);
    setNodeType('location');
    setGroupingId(GROUPING.id);
    setPersonaId(PERSONAS[0].id);
    setCreatedBookings([]);
    setUnreadOverride(null);
    setPageVariant(false);
    navigate('/');
  }, []);

  const signOut = useCallback(() => {
    writeSignedIn(false);
    setSignedIn(false);
  }, []);

  /* `/` is the grouping Dashboard. Old location bookmarks and remembered
     sessions land on the location's primary page instead. */
  useEffect(() => {
    if (
      started &&
      signedIn &&
      nodeType === 'location' &&
      activeLocation &&
      path === '/'
    ) {
      navigate('/bookings');
    }
  }, [activeLocation, nodeType, path, signedIn, started]);

  if (path === JOBS_TO_BE_DONE_ROUTE) {
    return <JobsToBeDone />;
  }

  if (path === INFORMATION_ARCHITECTURE_ROUTE) {
    return <InformationArchitecture />;
  }

  if (!started) {
    if (pendingPersonaId) {
      return (
        <PrototypeStart
          onStart={() => {
            writePrototypeStarted(true);
            writeSignedIn(true);
            setSignedIn(true);
            setStarted(true);
            switchPersona(pendingPersonaId);
          }}
        />
      );
    }

    return (
      <SessionLanding
        pickingPersona={pickingPersona}
        onPlay={() => setPickingPersona(true)}
        onBack={() => setPickingPersona(false)}
        onChoosePersona={(nextPersonaId) => {
          setPendingPersonaId(nextPersonaId);
          setPickingPersona(false);
        }}
      />
    );
  }

  if (!signedIn) {
    return (
      <SignedOut
        lastLocationId={locationId}
        onSignInAsReturning={() => {
          writeSignedIn(true);
          setSignedIn(true);
          navigate('/');
        }}
        onSignInAsNewUser={() => {
          clearLastLocationId();
          writePrototypeStarted(false);
          setStarted(false);
          setPendingPersonaId(null);
          setPickingPersona(false);
          setLocationId(null);
          navigate('/');
        }}
      />
    );
  }

  if (nodeType === 'location' && !activeLocation) {
    return (
      <ChooseLocation
        locations={organisationLocations}
        onSelect={(nextLocationId) => {
          selectLocation(nextLocationId);
          navigate('/bookings');
        }}
      />
    );
  }

  if (nodeType === 'grouping') {
    return (
      <div className="relative flex min-h-screen flex-col">
        <AppHeader
          location={null}
          grouping={grouping}
          persona={persona}
          nodeType="grouping"
          path={path}
          unreadMessages={0}
          bookingsBadge={0}
          unreadNotifications={notificationCount(notificationData)}
          onSelectGrouping={selectGrouping}
          onSignOut={signOut}
        />

        <div className="relative flex flex-1 flex-col">
          <main className="mx-auto w-full max-w-page flex-1 px-8 pt-8 pb-4">
            {path === '/notifications' ? (
              <Notifications
                data={notificationData}
                onSelectLocation={selectLocation}
              />
            ) : path.startsWith(ROUTES.organisationSettings) ? (
              <OrganisationSettings
                data={getLocationData(groupingLocationId)}
                path={path}
              />
            ) : path.startsWith(ROUTES.yourAccount) || path === '/settings' ? (
              <YourAccountSettings path={path} persona={persona} />
            ) : (
              <Dashboard
                grouping={grouping}
                onSelectLocation={(nextLocationId, path = '/bookings') => {
                  selectLocation(nextLocationId);
                  navigate(path);
                }}
              />
            )}
          </main>

          <SessionQuestions
            path={path}
            pageVariant={pageVariant}
            onTogglePageVariant={() => setPageVariant(!pageVariant)}
            currentPersonaId={persona.id}
            onSwitchPersona={switchPersona}
            onRestart={restart}
          />
        </div>

        <AppFooter />
      </div>
    );
  }

  if (!activeLocation) return null;

  const data = getLocationData(activeLocation.id);
  const createdForLocation = createdBookings.filter(
    (booking) => booking.locationId === activeLocation.id,
  );
  const visibleData = {
    ...data,
    bookings: [...createdForLocation, ...data.bookings],
    requestsToAccept: data.requestsToAccept + createdForLocation.length,
  };
  const stubTitle = STUB_TITLES[path];

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppHeader
        location={visibleData.location}
        grouping={grouping}
        persona={persona}
        nodeType="location"
        path={path}
        unreadMessages={unreadOverride ?? visibleData.unreadMessages}
        bookingsBadge={visibleData.bookingsToApprove}
        unreadNotifications={notificationCount(notificationData)}
        onSelectGrouping={selectGrouping}
        onSignOut={signOut}
      />

      <div className="relative flex flex-1 flex-col">
        <main className="mx-auto w-full max-w-page flex-1 px-8 pt-8 pb-4">
          {path === '/request-booking' ||
          path.startsWith('/bookings/request/') ||
          path.startsWith(BOOKING_DETAIL_ROUTE) ? (
            <BookingRequest
              path={path}
              data={visibleData}
              locations={organisationLocations}
              onSelectLocation={selectLocation}
              onCreateBooking={(booking) => {
                setCreatedBookings((current) => [booking, ...current]);
              }}
              workerDetail={pageVariant}
              calendarBookings={createdBookings}
              grouping={grouping}
            />
          ) : path === '/' || path === '/bookings' || bookingViewFromPath(path) ? (
            <Bookings
              data={visibleData}
              view={bookingViewFromPath(path)}
              calendarBookings={createdBookings}
            />
          ) : path === WORKERS_ROUTE ? (
            <Workers data={visibleData} grouping={grouping} />
          ) : path.startsWith(`${WORKERS_ROUTE}/`) ? (
            <WorkerProfile
              data={visibleData}
              workerId={workerIdFromPath(path)}
              grouping={grouping}
            />
          ) : path === '/messages' ? (
            <Messages
              key={activeLocation.id}
              locationId={activeLocation.id}
              persona={persona}
              onUnreadChange={onUnreadChange}
            />
          ) : path === '/notifications' ? (
            <Notifications
              data={notificationData}
              onSelectLocation={selectLocation}
            />
          ) : path === LOCATION_PROFILE_PREVIEW_ROUTE ? (
            <LocationProfilePreview data={visibleData} />
          ) : path.startsWith(ROUTES.manageLocation) ? (
            <ManageLocationSettings data={visibleData} path={path} />
          ) : path.startsWith(ROUTES.organisationSettings) ? (
            <OrganisationSettings data={visibleData} path={path} />
          ) : path.startsWith(ROUTES.yourAccount) || path === '/settings' ? (
            <YourAccountSettings path={path} persona={persona} />
          ) : stubTitle ? (
            <Stub title={stubTitle} location={visibleData.location} />
          ) : (
            <Bookings
              data={visibleData}
              view={null}
              calendarBookings={createdBookings}
            />
          )}
        </main>

      <SessionQuestions
        path={path}
        pageVariant={pageVariant}
        onTogglePageVariant={() => setPageVariant(!pageVariant)}
        currentPersonaId={persona.id}
        onSwitchPersona={switchPersona}
        onRestart={restart}
      />
      </div>

      <AppFooter />
    </div>
  );
}
