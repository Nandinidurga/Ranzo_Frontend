import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home' as any);
  }, [router]);

  return null;
}
