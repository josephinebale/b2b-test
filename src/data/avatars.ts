import angelaO from '../assets/avatars/angela-o.jpg';
import brianR from '../assets/avatars/brian-r.jpg';
import charliesK from '../assets/avatars/charlies-k.jpg';
import eleniP from '../assets/avatars/eleni-p.jpg';
import ericaO from '../assets/avatars/erica-o.jpg';
import geoffreyL from '../assets/avatars/geoffrey-l.jpg';
import gingerN from '../assets/avatars/ginger-n.jpg';
import hanHendrickP from '../assets/avatars/han-hendrick-p.jpg';
import helenDawson from '../assets/avatars/helen-dawson.jpg';
import iraJ from '../assets/avatars/ira-j.jpg';
import johnM from '../assets/avatars/john-m.jpg';
import mandiiZ from '../assets/avatars/mandii-z.jpg';
import maxineR from '../assets/avatars/maxine-r.jpg';
import peteC from '../assets/avatars/pete-c.jpg';
import sallyM from '../assets/avatars/sally-m.jpg';
import scarlettO from '../assets/avatars/scarlett-o.jpg';
import venessaS from '../assets/avatars/venessa-s.jpg';

/** Placeholder portraits, keyed by worker so a worker keeps the same face in every location. */
const AVATARS: Record<string, string> = {
  'Eleni P': eleniP,
  'Angela O': angelaO,
  'Maxine R': maxineR,
  'Erica O': ericaO,
  'Scarlett O': scarlettO,
  'Mandii Z': mandiiZ,
  'Geoffrey L': geoffreyL,
  'Brian R': brianR,
  'Charlies K': charliesK,
  'Ira J': iraJ,
  'Ginger N': gingerN,
  'Han Hendrick P': hanHendrickP,
  'Helen Dawson': helenDawson,
  'Marcus Lee': brianR,
  'Sofia Patel': scarlettO,
  'Ava Thompson': angelaO,
  'Grace Kim': ericaO,
  'Daniel Okafor': gingerN,
  'Rachel Morgan': maxineR,
  'Leila Hassan': mandiiZ,
  'Ben Carter': geoffreyL,
  'Olivia Grant': charliesK,
  'Ethan Murphy': eleniP,
  'Natalie Brooks': hanHendrickP,
  'John M': johnM,
  'Pete C': peteC,
  'Sally M': sallyM,
  'Venessa S': venessaS,
};

export function avatarFor(name: string): string | undefined {
  return AVATARS[name];
}
