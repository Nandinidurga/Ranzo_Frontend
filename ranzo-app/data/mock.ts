import {
  Job,
  Skill,
  WorkerCandidate,
  DurationOption,
} from './models';

const FIRST_NAMES = [
  'Ravi',
  'Rajesh',
  'Suresh',
  'Anil',
  'Vinod',
  'Mahesh',
  'Karthik',
  'Naveen',
  'Sunil',
  'Ramesh',
  'Praveen',
  'Bhaskar',
];
const LAST_NAMES = ['Kumar', 'Reddy', 'Sharma', 'Yadav', 'Singh', 'Rao', 'Naidu'];
const AREAS = [
  'Brodipet',
  'Arundelpet',
  'Lakshmipuram',
  'Pattabhipuram',
  'Chuttugunta',
  'Nallapadu',
  'Gorantla',
];

const EMPLOYERS = [
  { name: 'Ramesh Stores', phone: '+919000000001' },
  { name: 'Sai Construction', phone: '+919000000002' },
  { name: 'Krishna Apartments', phone: '+919000000003' },
  { name: 'Lakshmi Hardware', phone: '+919000000004' },
];

const NOTES_BY_TYPE: Partial<Record<Skill, string[]>> = {
  Electrician: [
    'Fan installation needed',
    'Power tripping issue, urgent',
    'New plug points (3)',
  ],
  Plumber: ['Leaking tap in kitchen', 'Bathroom drain blocked'],
  'AC Technician': ['1.5 ton split AC service', 'AC not cooling'],
  Carpenter: ['Door hinge repair', 'Cupboard shelf fix'],
  Painter: ['One bedroom wall', 'Touch-up work'],
  Driver: ['Local trip, 4 hours', 'Drop to airport'],
  Mason: ['Small wall repair'],
  Helper: ['Loading and unloading'],
};

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function buildMockJobAlert(skills: Skill[]): Omit<Job, 'id'> {
  const type = pick(skills);
  const employer = pick(EMPLOYERS);
  const range = {
    Electrician: [400, 800] as [number, number],
    Plumber: [350, 700] as [number, number],
    'AC Technician': [500, 1000] as [number, number],
    Carpenter: [400, 900] as [number, number],
    Painter: [350, 700] as [number, number],
    Driver: [500, 1200] as [number, number],
    Mason: [400, 900] as [number, number],
    Helper: [200, 500] as [number, number],
  }[type];
  const pay = Math.round((Math.random() * (range[1] - range[0]) + range[0]) / 50) * 50;
  const distance = +(Math.random() * 4 + 0.4).toFixed(1);
  const durationOptions: DurationOption[] = ['1 hr', '2 hrs', 'Half day', 'Full day'];
  const duration = pick(durationOptions);
  const notesArr = NOTES_BY_TYPE[type] ?? ['Job needed urgently'];
  return {
    type,
    employerId: 'emp_' + Math.random().toString(36).slice(2, 8),
    employerName: employer.name,
    employerPhone: employer.phone,
    lat: 16.3067 + (Math.random() - 0.5) * 0.04,
    lng: 80.4365 + (Math.random() - 0.5) * 0.04,
    area: pick(AREAS),
    address: `${pick(AREAS)}, Guntur`,
    distanceKm: distance,
    pay,
    duration,
    durationLabel: duration,
    notes: pick(notesArr),
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60_000,
  };
}

export function buildMockWorkers(skill: Skill, count = 6): WorkerCandidate[] {
  return Array.from({ length: count }).map((_, i) => {
    const otherSkills = (
      ['Electrician', 'Plumber', 'AC Technician', 'Carpenter', 'Painter', 'Driver', 'Mason', 'Helper'] as Skill[]
    ).filter((s) => s !== skill);
    const skills: Skill[] = [skill];
    if (Math.random() > 0.5) skills.push(pick(otherSkills));
    const experiences = ['0–1 yr', '1–3 yrs', '3+ yrs'];
    return {
      id: 'wrk_' + i + '_' + Math.random().toString(36).slice(2, 6),
      name: randomName(),
      phone: '+9190000' + String(10000 + Math.floor(Math.random() * 89999)),
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      jobsCompleted: Math.floor(Math.random() * 80) + 5,
      distanceKm: +(Math.random() * 3 + 0.3).toFixed(1),
      skills,
      experienceLabel: pick(experiences),
    };
  });
}

export function buildMockEmployerJobs(count = 3): Job[] {
  const skills: Skill[] = ['Electrician', 'Plumber', 'AC Technician', 'Carpenter', 'Painter'];
  return Array.from({ length: count }).map((_, i) => {
    const base = buildMockJobAlert(skills);
    const statuses = ['completed', 'completed', 'cancelled', 'pending'] as const;
    const status = statuses[i % statuses.length];
    return {
      ...base,
      id: 'job_hist_' + i,
      status: status as Job['status'],
      createdAt: Date.now() - i * 86400_000,
    };
  });
}
