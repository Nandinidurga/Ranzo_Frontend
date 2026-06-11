import type { BottomNavItem } from '@/core/widgets';

export const WORKER_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    label: 'Work',
    icon: 'home-outline',
    iconActive: 'home',
    href: '/(worker)/dashboard',
  },
  {
    label: 'Jobs',
    icon: 'briefcase-outline',
    iconActive: 'briefcase',
    href: '/(worker)/jobs',
  },
  {
    label: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
    href: '/(worker)/profile',
  },
];
