import type { Organisation, Sector } from '../lib/informationArchitecture';

export type JobToBeDone = {
  id: string;
  organisation: Organisation;
  sector: Sector;
  theme: string;
  job: string;
  saidBy: string;
  iaRelevant: boolean;
  resolvesAt: string;
};

/**
 * Seeded from jobs-to-be-done.xlsx on 10 September 2026.
 * This file is now the source of truth; edit it directly rather than the workbook.
 */
export const JOBS_TO_BE_DONE: JobToBeDone[] = [
  {
    "id": "job-001",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Fill a shift once we've exhausted all internal options",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request"
  },
  {
    "id": "job-002",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Hand the shift over to Careforce and get back to my day job",
    "saidBy": "Elise",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-003",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Fill the leftover needs identified at the monthly catch-up with each house manager",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-004",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Fill the unplanned shifts that come in through the house managers",
    "saidBy": "Elise",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request"
  },
  {
    "id": "job-005",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Ask agency for familiar and known staff, and if they don't have anybody, consult the manager on whether unfamiliar is suitable",
    "saidBy": "Elise",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request > Select workers"
  },
  {
    "id": "job-006",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Get an unfamiliar worker onto the shift a bit earlier for induction",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-007",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Ring someone already working on site and ask if they have the capacity to stay",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-008",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "See no workers available for DY at this time, then other workers who have worked within the region who have availability at this time",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request > Select workers"
  },
  {
    "id": "job-009",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Request a booking without going to a specific day",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Request booking"
  },
  {
    "id": "job-010",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Duplicate the same shift",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-011",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Tell whether or not a worker is suitable for the site",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers"
  },
  {
    "id": "job-012",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "See that across this region, this worker has worked across all seven sites and done 30 different shifts",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 2"
  },
  {
    "id": "job-013",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "See how many hours they've worked at CPA, to know are they really new, have they done 2 shifts versus a lot of hours at one site",
    "saidBy": "Elise",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers"
  },
  {
    "id": "job-014",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "See who else in Hireup has also worked in other group homes, so they'd know where plans are kept",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 2"
  },
  {
    "id": "job-015",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Only see the workers I've had working at my own house",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 1"
  },
  {
    "id": "job-016",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "See which sites they've been at, as a tick box or colour coded",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 2"
  },
  {
    "id": "job-017",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Have familiarity of that worker: someone who knows the house, the needs of the clients, roughly what routines are operating that day",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 1"
  },
  {
    "id": "job-018",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Know their name, their skill set, and what their availabilities are",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, Worker profile"
  },
  {
    "id": "job-019",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Highlight a worker I don't know and have their profile pop up",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-020",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Go back to the staff in the group home and ask who'd be my best bets to book",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-021",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Pick up the phone to other house managers and ask who'd be keen to come across and work a shift",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 2"
  },
  {
    "id": "job-022",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "See which workers we would be using regularly, alongside the feedback the managers are giving",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Grouping > Workers"
  },
  {
    "id": "job-023",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Know they're either inducted to the service and can work there, or they're not",
    "saidBy": "Elise",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-024",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Worker safety and compliance",
    "job": "Know whether a worker is coming off an overnight or sleepover shift, or going into 24 hours straight",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Bookings and Select workers, rest signal"
  },
  {
    "id": "job-025",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Worker safety and compliance",
    "job": "Know whether workers are booking back-to-back bookings",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Bookings and Select workers, rest signal"
  },
  {
    "id": "job-026",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Worker safety and compliance",
    "job": "Trust they've got all their stuff in date: CPR annual, first aid every 3 years, NDIS worker check",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-027",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Worker safety and compliance",
    "job": "See they've done the medication assessment and been assessed by our fleet coordinator to drive our vehicles",
    "saidBy": "Elise",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers"
  },
  {
    "id": "job-028",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Worker safety and compliance",
    "job": "Know support plans are confirmed, and whether they've been updated and read",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers"
  },
  {
    "id": "job-029",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Worker safety and compliance",
    "job": "Report an incident, because then it's attached to that worker on that shift",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Booking detail"
  },
  {
    "id": "job-030",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Worker safety and compliance",
    "job": "Know vehicle allowance is enabled, helpful if in an emergency you needed one",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-031",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Talking to workers",
    "job": "See the messages relating to DY, and any workers we've reached out to that we've wanted to go work at DY",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Messages"
  },
  {
    "id": "job-032",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Talking to workers",
    "job": "Have a covering manager still be able to action and follow up, and still see what she did when I come back",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Messages"
  },
  {
    "id": "job-033",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Talking to workers",
    "job": "See which sites currently have messages pending",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Grouping > Dashboard"
  },
  {
    "id": "job-034",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Talking to workers",
    "job": "Ask a worker what their experience is and when they're available for a buddy",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": "Location > Messages"
  },
  {
    "id": "job-035",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Notifications",
    "job": "Tick these 3 things I want to be notified of, but not the other 6",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-036",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Notifications",
    "job": "Choose the frequency, so I just get those messages Monday, Wednesday, Friday",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-037",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Notifications",
    "job": "See notifications only relating to DY",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Notifications"
  },
  {
    "id": "job-038",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Oversight",
    "job": "See how frequently we are using Hireup",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Grouping > Dashboard"
  },
  {
    "id": "job-039",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Oversight",
    "job": "Know whether that shift is being filled, and whether Ria knows how to manage the risks",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Grouping > Dashboard"
  },
  {
    "id": "job-040",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Oversight",
    "job": "See bookings just for DY",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings"
  },
  {
    "id": "job-041",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Oversight",
    "job": "See who they've got booked in, who their team is, and if there's approvals that need to be made",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Dashboard"
  },
  {
    "id": "job-042",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Oversight",
    "job": "Approve the booking so the worker gets paid",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Dashboard, Bookings"
  },
  {
    "id": "job-043",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Oversight",
    "job": "Have oversight of a group home for a day or two when someone's sick or on leave",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location switcher"
  },
  {
    "id": "job-044",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Oversight",
    "job": "Go in and confirm a worker's name, or check any messages coming through, when covering short-term leave",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location switcher"
  },
  {
    "id": "job-045",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Forward planning",
    "job": "Create the monthly roster from the base master roster, identifying any approved and planned leave",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-046",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Forward planning",
    "job": "Talk to the existing team to see if they want to pick up any additional hours",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-047",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Forward planning",
    "job": "Catch up with each house manager once a month, two weeks before the roster commences",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-048",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Put the client's name in, because that's the specific client we'd be charging this invoice to",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request > Details"
  },
  {
    "id": "job-049",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Book somebody for the whole house: a worker to support all the clients on that shift",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request"
  },
  {
    "id": "job-050",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Add the agency shifts into our rostering system with basic staff details, so managers know who's coming to site",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-051",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Have invoices reviewed and approved by an area manager, then payment through finance",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-052",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Describing a site",
    "job": "Stop having to almost copy and paste what I was writing to each individual worker",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": "Location settings > Location profile"
  },
  {
    "id": "job-053",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Describing a site",
    "job": "Let a worker see it's a SIL house in DY, with 5 clients, mostly manual handling or mostly behaviours, and what we're looking for",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location settings > Location profile"
  },
  {
    "id": "job-054",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Describing a site",
    "job": "Gate it: the setting first, then an I'm interested button, then more detail, then a chat box to the manager",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-055",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Describing a site",
    "job": "Help workers distinguish a group home SIL setting from the one-on-one jobs in the middle of the day",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": "Location settings > Location profile"
  },
  {
    "id": "job-056",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Describing a site",
    "job": "Not share too much information about who's living in our different houses",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": "Location settings > Location profile"
  },
  {
    "id": "job-057",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Building a team",
    "job": "Build my team again when it's dwindled from 15 to 3",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 3 and search"
  },
  {
    "id": "job-058",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Building a team",
    "job": "Look at who was in the area, who was open to work",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, tier 3"
  },
  {
    "id": "job-059",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Building a team",
    "job": "Search for workers near me",
    "saidBy": "Dorothy",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, search"
  },
  {
    "id": "job-060",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Building a team",
    "job": "Put up a job so anybody in the area could express their interest",
    "saidBy": "Dorothy",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-061",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Hireup as a service",
    "job": "Send an email saying these are the shifts we need filling, and have them come back with people known to the site",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-062",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Hireup as a service",
    "job": "Have it not be so admin heavy",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-063",
    "organisation": "Cerebral Palsy Alliance",
    "sector": "disability",
    "theme": "Hireup as a service",
    "job": "Pass the shift to a manager who does have access, when I don't",
    "saidBy": "Elise",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-064",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Email the provider inbox and request a staff member",
    "saidBy": "Carlos",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-065",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Name a staff member I have in mind and ask them to put them into the portal for me",
    "saidBy": "Carlos",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-066",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Put the shift up using the portal when we cannot provide the staff from Northcott",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request"
  },
  {
    "id": "job-067",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Send a large list of shifts for the following 4 weeks and ask them to help cover them",
    "saidBy": "Carlos",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-068",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Fill the shift when a support worker rings at 6 o'clock for a shift starting at 9, the worst nightmare we have",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request"
  },
  {
    "id": "job-069",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Take it on at 8 o'clock when the Northcott rostering team hands it over",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request"
  },
  {
    "id": "job-070",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Ring back and forth, and contact the Hireup rostering team, to get the shift filled",
    "saidBy": "Sufi",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-071",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Offer vacant shifts to other Northcott support workers first, then to Hireup or any other agency",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Request > Select workers"
  },
  {
    "id": "job-072",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Filling a shift",
    "job": "Fill shifts that are at least 3 hours",
    "saidBy": "Sufi",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-073",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Offer these jobs to other support workers who may be suitable for the job",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-074",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Offer the job to workers who have experience working in the site but haven't done an individual service job",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-075",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Offer a shift to more than 10 workers, because out of the 10 maybe 5 are already booked",
    "saidBy": "Sufi",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-076",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Find the support worker in the system, maybe using the search",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": "Location > Workers, search"
  },
  {
    "id": "job-077",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Choosing a worker",
    "job": "Save a worker and have them go into my team list",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-078",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Book the shift under the individual service account rather than SIL",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-079",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Stop SIL getting charged when the service was actually provided for the individual service",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-080",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Ask the Hireup rostering team to shift the booking to the individual service account",
    "saidBy": "Sufi",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-081",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Funding and invoicing",
    "job": "Receive the invoice only for the individual service shifts, since it's segregated",
    "saidBy": "Sufi",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-082",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Forward planning",
    "job": "Follow the SIL master roster in a 4-week schedule and allocate staff who work partially SIL and partially individual service",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-083",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Forward planning",
    "job": "Roster support workers up to the service agreement end date",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-084",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Oversight",
    "job": "See that a booking has been made, who has accepted it, and which other support workers it was offered to",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": "Location > Bookings > Requested booking detail"
  },
  {
    "id": "job-085",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Oversight",
    "job": "Go into the portal just to approve the shift",
    "saidBy": "Carlos",
    "iaRelevant": true,
    "resolvesAt": "Location > Dashboard, Bookings"
  },
  {
    "id": "job-086",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Describing a site",
    "job": "Set up my SILs in the portal with a brief description of what we're looking for and the kind of participants at the group home",
    "saidBy": "Carlos",
    "iaRelevant": true,
    "resolvesAt": "Location settings > Location profile"
  },
  {
    "id": "job-087",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Describing a site",
    "job": "Not also have to keep track of workers, message them, push jobs out and wait for responses",
    "saidBy": "Carlos",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-088",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Learning the platform",
    "job": "Know what the platform can do, when training was one to one and more than a year ago",
    "saidBy": "Sufi",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-089",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Learning the platform",
    "job": "Know a job post exists as an alternative to the booking request",
    "saidBy": "Sufi",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-090",
    "organisation": "Northcott",
    "sector": "disability",
    "theme": "Learning the platform",
    "job": "See a job post show on the dashboard the way a booking request does",
    "saidBy": "Sufi",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-091",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Filling a shift",
    "job": "Cover the sickies on a daily basis, business as usual",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Bookings > Request"
  },
  {
    "id": "job-092",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Filling a shift",
    "job": "Utilise our own resources, and if we cannot fulfil, flick an email to Hireup",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Bookings > Request"
  },
  {
    "id": "job-093",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Filling a shift",
    "job": "Get manager approval before reaching out to Hireup",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-094",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Filling a shift",
    "job": "Flick an email to the Hireup internal scheduler, so I could buy some time and do something else",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-095",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Filling a shift",
    "job": "Make sure all the information is in one email so you don't have to do back and forth",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-096",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Filling a shift",
    "job": "Have someone booked within 10 minutes",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-097",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Identify whether the client has their own group of support workers and see whether one of them is available",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Workers, tier 1"
  },
  {
    "id": "job-098",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Find someone who has been to a client before, so they know the patterns or the routine of the client",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Workers, tier 1"
  },
  {
    "id": "job-099",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Just randomly ask anybody, if it's domestic assistance",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Workers, tier 3"
  },
  {
    "id": "job-100",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Reach out to a Vic support worker if I need someone in Vic",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Workers, tier 3"
  },
  {
    "id": "job-101",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Check the support worker has a Certificate III in individual support",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-102",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Not see support workers whose mandatory credentials have failed or need renewing",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-103",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Not rely on availability in the system, because they may change their mind",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-104",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Choosing a worker",
    "job": "Not worry whether the worker is already booked elsewhere, because the client would be flexible",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-105",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Talking to workers",
    "job": "Send them the summary of care plan, what to expect during the service, so they're prepared",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-106",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Talking to workers",
    "job": "Send associated risks, allergies, medication, the service instruction, and whether the client has pets in the house",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-107",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Talking to workers",
    "job": "Provide the phone number in every request, in case there's no response to the home visit",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-108",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Talking to workers",
    "job": "Message them through the Hireup portal",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Messages"
  },
  {
    "id": "job-109",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Talking to workers",
    "job": "See whether any workers have responded",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Client location > Bookings, Messages"
  },
  {
    "id": "job-110",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Talking to workers",
    "job": "Send a group message when there are quite a few shifts available",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-111",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Oversight",
    "job": "Have visibility of other regions and jump in when they don't have enough rostering officers",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": "Location switcher"
  },
  {
    "id": "job-112",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Oversight",
    "job": "Action a task that came through from a care manager, by its due date",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-113",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Oversight",
    "job": "Reach out to the rostering lead when we couldn't understand or needed some help",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-114",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Forward planning",
    "job": "Make sure the master roster is okay and all the leaves are covered, a fortnight or a month ahead",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-115",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Forward planning",
    "job": "Cover the reactive space from 3 to 5, once the reactive officer finishes",
    "saidBy": "Suman",
    "iaRelevant": true,
    "resolvesAt": ""
  },
  {
    "id": "job-116",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Hireup as a service",
    "job": "Know how fast the agency response is, the most important one",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-117",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Hireup as a service",
    "job": "Have a fast track to send a service request to a bunch of support workers within a couple of minutes",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-118",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Hireup as a service",
    "job": "Attend the training to see what we can learn about how to use it",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  },
  {
    "id": "job-119",
    "organisation": "Life Without Barriers",
    "sector": "aged care",
    "theme": "Hireup as a service",
    "job": "Not worry about budget remaining, because we're not creating a new service, just filling an existing one",
    "saidBy": "Suman",
    "iaRelevant": false,
    "resolvesAt": ""
  }
]

export const JOB_THEMES = [
  ...new Set(JOBS_TO_BE_DONE.map((job) => job.theme)),
].sort();
