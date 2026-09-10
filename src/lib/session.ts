const LOCATION_KEY = 'hm.lastLocationId';
const LEGACY_HOUSE_KEY = 'hm.lastHouseId';
const SIGNED_IN_KEY = 'hm.signedIn';
const PROTOTYPE_STARTED_KEY = 'hm.prototypeStarted';
const NODE_TYPE_KEY = 'hm.lastNodeType';
const GROUPING_KEY = 'hm.lastGroupingId';
const PERSONA_KEY = 'hm.personaId';

export type NodeType = 'grouping' | 'location';
export type PersonaId =
  | 'house-manager'
  | 'regional-manager'
  | 'roster-coordinator'
  | 'team-leader'
  | 'regional-lifestyles-manager'
  | 'service-manager'
  | 'area-manager'
  | 'northcott-service-coordinator'
  | 'northcott-individual-service-coordinator'
  | 'lwb-reactive-rostering-officer'
  | 'lwb-forward-rostering-officer'
  | 'lwb-rostering-lead';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Prototype only; a blocked storage API just means nothing is remembered.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // See write().
  }
}

export function readLastLocationId(): string | null {
  return read(LOCATION_KEY) ?? read(LEGACY_HOUSE_KEY);
}

export function writeLastLocationId(locationId: string): void {
  write(LOCATION_KEY, locationId);
  writeLastNodeType('location');
}

export function readLastNodeType(): NodeType {
  return read(NODE_TYPE_KEY) === 'grouping' ? 'grouping' : 'location';
}

export function writeLastNodeType(nodeType: NodeType): void {
  write(NODE_TYPE_KEY, nodeType);
}

export function readLastGroupingId(): string {
  return read(GROUPING_KEY) ?? 'northern-sydney';
}

export function writeLastGroupingId(groupingId: string): void {
  write(GROUPING_KEY, groupingId);
}

export function readPersonaId(): PersonaId {
  const saved = read(PERSONA_KEY);
  return saved === 'regional-manager' ||
    saved === 'roster-coordinator' ||
    saved === 'team-leader' ||
    saved === 'regional-lifestyles-manager' ||
    saved === 'service-manager' ||
    saved === 'area-manager' ||
    saved === 'northcott-service-coordinator' ||
    saved === 'northcott-individual-service-coordinator' ||
    saved === 'lwb-reactive-rostering-officer' ||
    saved === 'lwb-forward-rostering-officer' ||
    saved === 'lwb-rostering-lead'
    ? saved
    : 'house-manager';
}

export function writePersonaId(personaId: PersonaId): void {
  write(PERSONA_KEY, personaId);
}

export function clearLastLocationId(): void {
  remove(LOCATION_KEY);
  remove(LEGACY_HOUSE_KEY);
  remove(NODE_TYPE_KEY);
  remove(GROUPING_KEY);
}

/** Back to a first run: no location, persona, or start flag. */
export function clearSession(): void {
  clearLastLocationId();
  remove(PERSONA_KEY);
  remove(SIGNED_IN_KEY);
  remove(PROTOTYPE_STARTED_KEY);
}

export function readPrototypeStarted(): boolean {
  return read(PROTOTYPE_STARTED_KEY) === 'true';
}

export function writePrototypeStarted(started: boolean): void {
  write(PROTOTYPE_STARTED_KEY, started ? 'true' : 'false');
}

export function readSignedIn(): boolean {
  return read(SIGNED_IN_KEY) !== 'false';
}

export function writeSignedIn(signedIn: boolean): void {
  write(SIGNED_IN_KEY, signedIn ? 'true' : 'false');
}
