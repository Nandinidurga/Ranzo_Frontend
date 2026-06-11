import type {
  RecentBooking,
  ServiceCategory,
  ServiceSubcategory,
} from '@/features/customer/types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'electrician', name: 'Electrician', icon: 'flash', color: '#F59E0B' },
  { id: 'plumber', name: 'Plumber', icon: 'water', color: '#3B82F6' },
  { id: 'ac', name: 'AC Repair', icon: 'snow', color: '#06B6D4' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles', color: '#8B5CF6' },
  { id: 'carpenter', name: 'Carpenter', icon: 'hammer', color: '#D97706' },
  { id: 'painting', name: 'Painting', icon: 'color-palette', color: '#EC4899' },
  { id: 'appliance', name: 'Appliance', icon: 'washing-machine', iconSet: 'material', color: '#6B2C8C' },
];

export const SUBCATEGORIES: ServiceSubcategory[] = [
  { id: 'el_wiring', categoryId: 'electrician', name: 'Wiring & switches', icon: 'git-branch', priceMin: 299, priceMax: 799 },
  { id: 'el_fan', categoryId: 'electrician', name: 'Fan installation', icon: 'sync', priceMin: 199, priceMax: 499 },
  { id: 'pl_leak', categoryId: 'plumber', name: 'Leak repair', icon: 'water', priceMin: 249, priceMax: 599 },
  { id: 'pl_tap', categoryId: 'plumber', name: 'Tap & shower', icon: 'rainy', priceMin: 199, priceMax: 449 },
  { id: 'ac_service', categoryId: 'ac', name: 'AC service', icon: 'snow', priceMin: 499, priceMax: 899 },
  { id: 'ac_gas', categoryId: 'ac', name: 'Gas refill', icon: 'flask', priceMin: 1499, priceMax: 2499 },
  { id: 'cl_deep', categoryId: 'cleaning', name: 'Deep cleaning', icon: 'home', priceMin: 999, priceMax: 2499 },
  { id: 'cl_bathroom', categoryId: 'cleaning', name: 'Bathroom cleaning', icon: 'water', priceMin: 399, priceMax: 799 },
  { id: 'ca_furniture', categoryId: 'carpenter', name: 'Furniture assembly', icon: 'bed', priceMin: 349, priceMax: 999 },
  { id: 'pa_interior', categoryId: 'painting', name: 'Interior painting', icon: 'brush', priceMin: 1999, priceMax: 8999 },
  { id: 'ap_washing', categoryId: 'appliance', name: 'Washing machine', icon: 'washing-machine', iconSet: 'material', priceMin: 299, priceMax: 699 },
  { id: 'ap_fridge', categoryId: 'appliance', name: 'Refrigerator', icon: 'fridge-outline', iconSet: 'material', priceMin: 349, priceMax: 749 },
];

export const RECENT_BOOKINGS: RecentBooking[] = [
  {
    id: 'rb1',
    serviceName: 'AC service',
    categoryId: 'ac',
    subcategoryId: 'ac_service',
    bookedAt: '2026-05-18',
  },
  {
    id: 'rb2',
    serviceName: 'Leak repair',
    categoryId: 'plumber',
    subcategoryId: 'pl_leak',
    bookedAt: '2026-05-10',
  },
];

export function subcategoriesForCategory(categoryId: string) {
  return SUBCATEGORIES.filter((s) => s.categoryId === categoryId);
}

export function categoryById(id: string) {
  return SERVICE_CATEGORIES.find((c) => c.id === id);
}

export function subcategoryById(id: string) {
  return SUBCATEGORIES.find((s) => s.id === id);
}
