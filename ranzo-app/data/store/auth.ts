import { create } from 'zustand';
import {
  Role,
  AppMode,
  PlatformRole,
  EmployerProfile,
  WorkerProfile,
} from '@/data/models';
import { APP_MODE } from '@/core/config/appMode';
import {
  KEY_AUTH,
  KEY_EMPLOYER,
  KEY_WORKER,
  clearAll,
  loadJSON,
  removeJSON,
  saveJSON,
} from '@/data/storage';

export type AuthState = {
  hydrated: boolean;
  token: string | null;
  refreshToken: string | null;
  app: AppMode | null;
  primaryRole: PlatformRole | null;
  roleSelectionPending: boolean;
  role: Role | null;
  worker: WorkerProfile | null;
  employer: EmployerProfile | null;
  userId: string | null;
  isDetailsFilled: boolean;
  hydrate: () => Promise<void>;
  setAppModule: (app: AppMode) => Promise<void>;
  setPrimaryRole: (primaryRole: PlatformRole) => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  signIn: (
    token: string,
    role: Role,
    opts?: {
      refreshToken?: string | null;
      userId?: string | null;
      isDetailsFilled?: boolean;
      app?: AppMode | null;
      primaryRole?: PlatformRole | null;
    }
  ) => Promise<void>;
  setWorkerProfile: (profile: WorkerProfile) => Promise<void>;
  setEmployerProfile: (profile: EmployerProfile) => Promise<void>;
  setWorker: (profile: WorkerProfile | null) => Promise<void>;
  setEmployer: (profile: EmployerProfile | null) => Promise<void>;
  setOnline: (online: boolean) => Promise<void>;
  setUserMeta: (meta: { userId: string | null; isDetailsFilled: boolean }) => Promise<void>;
  /** Single write after login — faster than signIn + setWorker + setEmployer. */
  setRoleSelectionPending: (pending: boolean) => Promise<void>;
  setSessionAfterAuth: (payload: {
    token: string;
    refreshToken: string;
    role: Role;
    userId: string;
    app: AppMode | null;
    primaryRole: PlatformRole | null;
    roleSelectionPending?: boolean;
    isDetailsFilled?: boolean;
    worker: WorkerProfile | null;
    employer: EmployerProfile | null;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

type Persisted = {
  app?: AppMode | null;
  primaryRole?: PlatformRole | null;
  roleSelectionPending?: boolean;
  role: Role | null;
  userId?: string | null;
  isDetailsFilled?: boolean;
};

async function persistAuth(get: () => AuthState) {
  const s = get();
  const { saveSecureTokens } = await import('@/core/auth/secureLogin');
  await saveSecureTokens(s.token, s.refreshToken);
  await saveJSON(KEY_AUTH, {
    app: s.app,
    primaryRole: s.primaryRole,
    roleSelectionPending: s.roleSelectionPending,
    role: s.role,
    userId: s.userId,
    isDetailsFilled: s.isDetailsFilled,
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  token: null,
  refreshToken: null,
  app: null,
  primaryRole: null,
  roleSelectionPending: false,
  role: null,
  worker: null,
  employer: null,
  userId: null,
  isDetailsFilled: false,

  hydrate: async () => {
    const { loadSecureTokens } = await import('@/core/auth/secureLogin');
    const secure = await loadSecureTokens();
    const legacyAuth = await loadJSON<
      Persisted & { token?: string | null; refreshToken?: string | null }
    >(KEY_AUTH);
    const auth: Persisted = legacyAuth ?? {
      app: null,
      primaryRole: null,
      roleSelectionPending: false,
      role: null,
      userId: null,
      isDetailsFilled: false,
    };
    const worker = await loadJSON<WorkerProfile>(KEY_WORKER);
    const employer = await loadJSON<EmployerProfile>(KEY_EMPLOYER);
    set({
      token: secure.accessToken ?? legacyAuth?.token ?? null,
      refreshToken: secure.refreshToken ?? legacyAuth?.refreshToken ?? null,
      app: auth.app ?? APP_MODE,
      primaryRole: auth.primaryRole ?? null,
      roleSelectionPending: auth.roleSelectionPending ?? false,
      role: auth.role,
      worker,
      employer,
      userId: auth.userId ?? null,
      isDetailsFilled: auth.isDetailsFilled ?? false,
      hydrated: true,
    });
  },

  setAppModule: async (app) => {
    set({ app });
    await persistAuth(get);
  },

  setPrimaryRole: async (primaryRole) => {
    set({ primaryRole });
    await persistAuth(get);
  },

  setRoleSelectionPending: async (roleSelectionPending) => {
    set({ roleSelectionPending });
    await persistAuth(get);
  },

  setRole: async (role) => {
    set({ role });
    await persistAuth(get);
  },

  signIn: async (token, role, opts) => {
    set({
      token,
      refreshToken: opts?.refreshToken ?? get().refreshToken ?? null,
      role,
      userId: opts?.userId ?? get().userId ?? null,
      isDetailsFilled: opts?.isDetailsFilled ?? get().isDetailsFilled ?? false,
      app: opts?.app ?? get().app ?? APP_MODE,
      primaryRole: opts?.primaryRole ?? get().primaryRole ?? null,
    });
    await persistAuth(get);
  },

  setWorkerProfile: async (profile) => {
    set({ worker: profile, isDetailsFilled: true });
    await saveJSON(KEY_WORKER, profile);
    await persistAuth(get);
  },

  setEmployerProfile: async (profile) => {
    set({ employer: profile, isDetailsFilled: true });
    await saveJSON(KEY_EMPLOYER, profile);
    await persistAuth(get);
  },

  setWorker: async (profile) => {
    set({ worker: profile });
    if (profile) await saveJSON(KEY_WORKER, profile);
    else await removeJSON(KEY_WORKER);
  },

  setEmployer: async (profile) => {
    set({ employer: profile });
    if (profile) await saveJSON(KEY_EMPLOYER, profile);
    else await removeJSON(KEY_EMPLOYER);
  },

  setOnline: async (online) => {
    const w = get().worker;
    if (!w) return;
    const next = { ...w, online };
    set({ worker: next });
    await saveJSON(KEY_WORKER, next);
  },

  setUserMeta: async (meta) => {
    set({ userId: meta.userId, isDetailsFilled: meta.isDetailsFilled });
    await persistAuth(get);
  },

  setSessionAfterAuth: async (payload) => {
    set({
      token: payload.token,
      refreshToken: payload.refreshToken,
      role: payload.role,
      userId: payload.userId,
      app: payload.app,
      primaryRole: payload.primaryRole,
      roleSelectionPending: payload.roleSelectionPending ?? false,
      isDetailsFilled: payload.isDetailsFilled ?? false,
      worker: payload.worker,
      employer: payload.employer,
    });
    await Promise.all([
      persistAuth(get),
      payload.worker
        ? saveJSON(KEY_WORKER, payload.worker)
        : removeJSON(KEY_WORKER),
      payload.employer
        ? saveJSON(KEY_EMPLOYER, payload.employer)
        : removeJSON(KEY_EMPLOYER),
    ]);
  },

  signOut: async () => {
    const rt = get().refreshToken;
    if (rt) {
      const { logout } = await import('@/core/api/auth');
      await logout(rt).catch(() => {});
    }
    const { invalidateProfileMeCache } = await import('@/core/api/profileSync');
    invalidateProfileMeCache();
    await clearAll();
    set({
      token: null,
      refreshToken: null,
      app: APP_MODE,
      primaryRole: null,
      roleSelectionPending: false,
      role: null,
      worker: null,
      employer: null,
      userId: null,
      isDetailsFilled: false,
    });
  },
}));
