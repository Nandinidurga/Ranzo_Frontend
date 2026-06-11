/** Seeker wizard: suggested + searchable job skills. */
export const SUGGESTED_SKILLS = [
  'Software Development',
  'Data Entry',
  'Sales',
  'Marketing',
  'Accounting',
  'HR',
] as const;

export const ALL_JOB_SKILLS: string[] = [...SUGGESTED_SKILLS];

export function suggestedSkills(_city?: string, _age?: number): string[] {
  return [...SUGGESTED_SKILLS];
}

export function filterSkills(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_JOB_SKILLS.filter((s) => s.toLowerCase().includes(q));
}
