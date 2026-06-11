export function ageFromDob(isoDate: string): number {
  const dob = new Date(isoDate);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function isAtLeast18(isoDate: string): boolean {
  return ageFromDob(isoDate) >= 18;
}
