import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getCachedProfileSync,
  invalidateProfileMeCache,
  isProfileEmpty,
  isSuccessfulProfileStatus,
  setCachedProfileSync,
  syncProfileMeFromApi,
  type ProfileMeSyncResult,
} from '@/core/api/profileSync';
import { useAuthStore } from '@/data/store';

export type ProfileScreenPhase = 'loading' | 'form' | 'view';

export { invalidateProfileMeCache };

function getInitialPhase(): ProfileScreenPhase {
  const s = useAuthStore.getState();
  if (s.isDetailsFilled) return 'view';
  return 'form';
}

function phaseFromResult(result: ProfileMeSyncResult): ProfileScreenPhase {
  const ok = isSuccessfulProfileStatus(result.status);
  if (!ok) {
    return useAuthStore.getState().isDetailsFilled ? 'view' : 'form';
  }
  const empty =
    !result.data || isProfileEmpty(result.data.profile, result.data.role);
  return empty ? 'form' : 'view';
}

function hasLocalProfileCache(): boolean {
  return useAuthStore.getState().isDetailsFilled;
}

export function useProfileMeScreen() {
  const [phase, setPhase] = useState<ProfileScreenPhase>(getInitialPhase);
  const [syncResult, setSyncResult] = useState<ProfileMeSyncResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const visited = useRef(false);
  const loadSeq = useRef(0);

  const load = useCallback(async (opts?: { force?: boolean; silent?: boolean }) => {
    const seq = ++loadSeq.current;
    const force = opts?.force ?? false;
    const silent = opts?.silent ?? visited.current;
    const userId = useAuthStore.getState().userId;
    const hasCache = hasLocalProfileCache();

    const cached = getCachedProfileSync(userId, force);
    if (cached) {
      setSyncResult(cached);
      setPhase(phaseFromResult(cached));
      return cached;
    }

    if (!silent && !hasCache) {
      setPhase('loading');
    } else if (silent && hasCache) {
      setRefreshing(true);
    }

    try {
      const result = await syncProfileMeFromApi();
      if (seq !== loadSeq.current) return result;

      setCachedProfileSync(userId, result);
      setSyncResult(result);
      setPhase(phaseFromResult(result));
      return result;
    } finally {
      if (seq === loadSeq.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const silent = visited.current;
      visited.current = true;
      void load({ silent });
    }, [load])
  );

  const reload = useCallback(() => {
    invalidateProfileMeCache();
    return load({ force: true, silent: hasLocalProfileCache() });
  }, [load]);

  return {
    phase,
    syncResult,
    profileData: syncResult?.data ?? null,
    refreshing,
    reload,
  };
}
