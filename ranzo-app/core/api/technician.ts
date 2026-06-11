import { apiFetch } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import type { PayoutDetails } from '@/features/technician/stores/technicianStore';
import type { TechnicianWizardDraft } from '@/features/technician/stores/wizardStore';
import { upsertWorkerProfile } from '@/core/api/profile';

export async function goOnline() {
  return apiFetch<{ success: boolean }>(apiV1Path('/technician/go-online'), {
    method: 'POST',
  });
}

export async function goOffline() {
  return apiFetch<{ success: boolean }>(apiV1Path('/technician/go-offline'), {
    method: 'POST',
  });
}

export type TechnicianIncomingOffer = {
  bookingId: string;
  serviceName: string;
  customerName: string;
  addressLine: string;
  etaMinutes?: number;
  payoutEstimate?: number;
};

export async function getTechnicianIncomingOffer() {
  return apiFetch<TechnicianIncomingOffer | null>(
    apiV1Path('/services/bookings/tech'),
    { method: 'GET' }
  );
}

export async function acceptTechnicianBooking(bookingId: string) {
  return apiFetch<{ success: boolean }>(
    apiV1Path(`/services/booking/${bookingId}/accept`),
    { method: 'POST' }
  );
}

export async function declineTechnicianBooking(bookingId: string) {
  return apiFetch<{ success: boolean }>(
    apiV1Path(`/services/booking/${bookingId}/reject`),
    { method: 'POST' }
  );
}

export async function getAssignedJobId(): Promise<string | null> {
  const list = await apiFetch<{ items?: Array<{ id?: string; status?: string }> }>(
    apiV1Path('/services/bookings/tech'),
    { method: 'GET' }
  );
  const active =
    list.items?.find((b) => b.status === 'assigned' || b.status === 'accepted') ??
    list.items?.[0];
  return typeof active?.id === 'string' ? active.id : null;
}

export async function saveTechnicianWizardStep1(draft: TechnicianWizardDraft) {
  const city = draft.location.split(',')[0]?.trim() || draft.location.trim() || 'Hyderabad';
  return upsertWorkerProfile({
    name: draft.fullName.trim(),
    skills: [],
    experience: '1–3 yrs',
    lat: 17.44,
    lng: 78.39,
    address: draft.location,
    city,
  });
}

export async function verifyTechnicianAadhaar(aadhaar: string) {
  // PDF uses `/verify/aadhaar/initiate` + callback; this app currently uses a single-step verify.
  return apiFetch<{ verified: boolean }>(apiV1Path('/verify/aadhaar/initiate'), {
    method: 'POST',
    body: JSON.stringify({ aadhaar_number: aadhaar }),
  });
}

export async function saveTechnicianServices(draft: TechnicianWizardDraft) {
  return apiFetch<Record<string, unknown>>(apiV1Path('/profile/technician/step/3'), {
    method: 'PATCH',
    body: JSON.stringify({
      services_offered: draft.services.map((s) => ({
        subcategory_id: s.subcategoryId,
        name: s.name,
        hourly_rate: Number(s.hourlyRate) || 0,
        experience_years: Number(s.experienceYears) || 0,
      })),
      working_hours: { start: draft.workingHoursStart, end: draft.workingHoursEnd },
      working_days: draft.workingDays,
      service_radius_km: draft.serviceRadiusKm,
    }),
  });
}

export async function saveTechnicianPayout(
  payout: PayoutDetails
): Promise<{ verified: boolean }> {
  return apiFetch<{ verified: boolean }>(apiV1Path('/profile/technician/step/4'), {
    method: 'PATCH',
    body: JSON.stringify({
      bank_account: {
        holder_name: payout.holderName,
        account_number: payout.accountNumber,
        ifsc: payout.ifsc,
      },
      payout_verified: true,
    }),
  });
}

export async function bookingArrived(bookingId: string) {
  return apiFetch<{ success: boolean }>(apiV1Path(`/services/booking/${bookingId}/arrived`), {
    method: 'POST',
  });
}

export async function bookingStarted(bookingId: string) {
  return apiFetch<{ success: boolean }>(apiV1Path(`/services/booking/${bookingId}/started`), {
    method: 'POST',
  });
}

export async function bookingCompleted(bookingId: string) {
  return apiFetch<{ success: boolean }>(apiV1Path(`/services/booking/${bookingId}/complete`), {
    method: 'POST',
  });
}

export type TechnicianServiceBooking = {
  id: string;
  customerName: string;
  customerPhoneMasked?: string;
  customerPhotoUri?: string | null;
  serviceName: string;
  address: string;
  distanceKm?: number;
  instructions?: string;
};

export async function getTechnicianBooking(bookingId: string) {
  return apiFetch<TechnicianServiceBooking>(apiV1Path(`/services/booking/${bookingId}`), {
    method: 'GET',
  });
}

export type WalletBalanceOut = { balance: number };
export type WalletTxnOut = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  label: string;
  date: string;
};
export type PendingPayoutOut = { id: string; amount: number; date: string };

export async function getWalletBalance() {
  return apiFetch<WalletBalanceOut>(apiV1Path('/wallet/balance'), { method: 'GET' });
}

export async function getTransactions() {
  return apiFetch<{ items: WalletTxnOut[] }>(apiV1Path('/wallet/transactions'), { method: 'GET' });
}

export async function getPendingPayouts() {
  // Not specified in PDF; treat as empty list for now.
  return Promise.resolve({ items: [] as PendingPayoutOut[] });
}

export async function withdrawAmount(amount: number) {
  return apiFetch<{ success: boolean }>(apiV1Path('/wallet/withdraw'), {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export type CompletedJobItem = {
  id: string;
  title: string;
  rating: number;
  earn: number;
  date: string;
};

export async function getCompletedJobs(): Promise<CompletedJobItem[]> {
  const res = await apiFetch<{ items?: any[] }>(apiV1Path('/services/bookings/tech'), {
    method: 'GET',
  });
  const items = Array.isArray(res.items) ? res.items : [];
  return items
    .filter((b) => String(b.status ?? '') === 'completed')
    .map((b) => ({
      id: String(b.id ?? b._id ?? ''),
      title: String(b.service_name ?? b.serviceName ?? 'Service'),
      rating: Number(b.rating ?? 0),
      earn: Number(b.earnings ?? b.earn ?? 0),
      date: String(b.completed_at ?? b.date ?? ''),
    }));
}
