import { create } from 'zustand';
import { Job, Skill, WorkerCandidate } from '@/data/models';
import {
  buildMockEmployerJobs,
  buildMockJobAlert,
  buildMockWorkers,
} from '@/data/mock';

export type JobsState = {
  alertJob: Job | null;
  acceptedJob: Job | null;
  pendingJob: Job | null;
  candidates: WorkerCandidate[];
  pingedCount: number;
  acceptedCount: number;
  employerJobs: Job[];
  workerHistory: Job[];

  startListening: (skills: Skill[]) => () => void;
  stopListening: () => void;
  setAlert: (job: Job | null) => void;
  acceptAlert: () => Job | null;
  ignoreAlert: () => void;
  expireAlert: () => void;
  postJob: (input: {
    type: Skill;
    lat: number;
    lng: number;
    duration: Job['duration'];
    pay: number;
    notes?: string;
    address: string;
    area: string;
    employerName: string;
    employerPhone: string;
  }) => Job;
  startMatching: (job: Job, opts?: { radius?: 'normal' | 'wide' }) => () => void;
  selectWorker: (workerId: string) => Job | null;
  cancelMatching: () => void;
  completeAcceptedJob: () => void;
  loadEmployerHistory: () => void;
};

let listenerTimer: ReturnType<typeof setTimeout> | null = null;
let matchingTimers: Array<ReturnType<typeof setTimeout>> = [];

export const useJobsStore = create<JobsState>((set, get) => ({
  alertJob: null,
  acceptedJob: null,
  pendingJob: null,
  candidates: [],
  pingedCount: 0,
  acceptedCount: 0,
  employerJobs: [],
  workerHistory: [],

  startListening: (skills) => {
    get().stopListening();
    const tick = () => {
      if (!get().alertJob && !get().acceptedJob) {
        const alert: Job = {
          id: 'job_' + Math.random().toString(36).slice(2, 10),
          ...buildMockJobAlert(skills.length ? skills : ['Electrician']),
        };
        set({ alertJob: alert });
      }
      listenerTimer = setTimeout(tick, 14000 + Math.random() * 8000);
    };
    listenerTimer = setTimeout(tick, 4000);
    return () => get().stopListening();
  },

  stopListening: () => {
    if (listenerTimer) {
      clearTimeout(listenerTimer);
      listenerTimer = null;
    }
  },

  setAlert: (job) => set({ alertJob: job }),

  acceptAlert: () => {
    const j = get().alertJob;
    if (!j) return null;
    const accepted: Job = {
      ...j,
      status: 'assigned',
      scheduledStart: Date.now() + 10 * 60 * 1000,
    };
    set({
      alertJob: null,
      acceptedJob: accepted,
    });
    return accepted;
  },

  ignoreAlert: () => set({ alertJob: null }),
  expireAlert: () => set({ alertJob: null }),

  postJob: (input) => {
    const job: Job = {
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      type: input.type,
      employerId: 'me',
      employerName: input.employerName,
      employerPhone: input.employerPhone,
      lat: input.lat,
      lng: input.lng,
      area: input.area,
      address: input.address,
      distanceKm: 0,
      pay: input.pay,
      duration: input.duration,
      durationLabel: input.duration,
      notes: input.notes,
      status: 'matching',
      createdAt: Date.now(),
    };
    set({ pendingJob: job, candidates: [], pingedCount: 0, acceptedCount: 0 });
    return job;
  },

  startMatching: (job, opts) => {
    matchingTimers.forEach((t) => clearTimeout(t));
    matchingTimers = [];

    const radiusBoost = opts?.radius === 'wide' ? 2 : 1;
    const totalCandidates = Math.floor(Math.random() * 3) + 4;
    const candidates = buildMockWorkers(job.type, totalCandidates).map((c) => ({
      ...c,
      distanceKm: c.distanceKm * radiusBoost,
    }));
    const totalPings = Math.floor(Math.random() * 4) + 8;

    let pinged = 0;
    let accepted = 0;
    const released: typeof candidates = [];

    const pingStep = () => {
      pinged += 1;
      set({ pingedCount: pinged });
      if (pinged < totalPings) {
        matchingTimers.push(setTimeout(pingStep, 700 + Math.random() * 600));
      }
    };

    const acceptStep = () => {
      if (accepted >= candidates.length) return;
      const next = candidates[accepted];
      accepted += 1;
      released.push(next);
      const sorted = [...released].sort((a, b) => a.distanceKm - b.distanceKm);
      set({ acceptedCount: accepted, candidates: sorted });
      if (accepted < candidates.length) {
        matchingTimers.push(setTimeout(acceptStep, 1500 + Math.random() * 1800));
      }
    };

    matchingTimers.push(setTimeout(pingStep, 600));
    matchingTimers.push(setTimeout(acceptStep, 2200));

    return () => {
      matchingTimers.forEach((t) => clearTimeout(t));
      matchingTimers = [];
    };
  },

  selectWorker: (workerId) => {
    const job = get().pendingJob;
    const candidate = get().candidates.find((c) => c.id === workerId);
    if (!job || !candidate) return null;
    const assigned: Job = {
      ...job,
      status: 'assigned',
      workerId: candidate.id,
      workerName: candidate.name,
      workerPhone: candidate.phone,
      distanceKm: candidate.distanceKm,
      scheduledStart: Date.now() + 10 * 60 * 1000,
    };
    set({
      pendingJob: assigned,
      acceptedJob: assigned,
      candidates: [],
    });
    return assigned;
  },

  cancelMatching: () => {
    matchingTimers.forEach((t) => clearTimeout(t));
    matchingTimers = [];
    set({ pendingJob: null, candidates: [], pingedCount: 0, acceptedCount: 0 });
  },

  completeAcceptedJob: () => {
    const job = get().acceptedJob;
    if (!job) return;
    const completed: Job = { ...job, status: 'completed' };
    const list = get().employerJobs;
    set({
      acceptedJob: null,
      pendingJob: null,
      employerJobs: [completed, ...list],
      workerHistory: [completed, ...get().workerHistory],
    });
  },

  loadEmployerHistory: () => {
    if (get().employerJobs.length === 0) {
      set({ employerJobs: buildMockEmployerJobs(3) });
    }
  },
}));
