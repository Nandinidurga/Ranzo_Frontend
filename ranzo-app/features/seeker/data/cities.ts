export const INDIAN_CITIES = [
  'Hyderabad',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kochi',
  'Visakhapatnam',
  'Indore',
  'Nagpur',
  'Coimbatore',
];

export function filterCities(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return INDIAN_CITIES.slice(0, 8);
  return INDIAN_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
}
