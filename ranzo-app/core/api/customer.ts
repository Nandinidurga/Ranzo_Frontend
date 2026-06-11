import { apiFetch } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import type {
  BookingDraft,
  BookingStatusUpdate,
  CompletionSummary,
  LiveTrackingUpdate,
  RecentBooking,
  ServiceCategory,
  ServiceSubcategory,
} from '@/features/customer/types';

export type ServiceCatalogOut = {
  categories: ServiceCategory[];
  recentBookings?: RecentBooking[];
  bookAgain?: RecentBooking[];
};

export async function getServiceCatalog(): Promise<ServiceCatalogOut> {
  return apiFetch<ServiceCatalogOut>(apiV1Path('/services/catalog'));
}

export async function getSubcategories(categoryId: string): Promise<ServiceSubcategory[]> {
  return apiFetch<ServiceSubcategory[]>(
    apiV1Path(`/services/catalog/${categoryId}/subcategories`)
  );
}

export type BookServiceIn = {
  category_id?: string;
  subcategory_id: string;
  address_id: string;
  /** Backend spec uses `schedule_type` (now|schedule). */
  schedule_type?: 'now' | 'schedule';
  /** Back-compat alias used by the UI layer. */
  time_mode?: 'now' | 'schedule';
  scheduled_at?: string;
  /** Backend spec uses `special_instructions`. */
  special_instructions?: string;
  /** Back-compat alias used by the UI layer. */
  instructions?: string;
  estimated_amount?: number;
};

export async function bookService(body: BookServiceIn): Promise<{ id: string }> {
  const payload = {
    category_id: body.category_id,
    subcategory_id: body.subcategory_id,
    schedule_type: body.schedule_type ?? body.time_mode ?? 'now',
    scheduled_at: body.scheduled_at,
    address_id: body.address_id,
    special_instructions: body.special_instructions ?? body.instructions,
  };

  return apiFetch<{ id: string }>(apiV1Path('/services/book'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBookingStatus(bookingId: string): Promise<BookingStatusUpdate> {
  // PDF lists `GET /services/booking/{id}` (no separate `/status` route).
  return apiFetch<BookingStatusUpdate>(apiV1Path(`/services/booking/${bookingId}`), {
    method: 'GET',
  });
}

export async function getLiveTrackingUpdate(bookingId: string): Promise<LiveTrackingUpdate | null> {
  // PDF lists `GET /services/booking/{id}/track`.
  return apiFetch<LiveTrackingUpdate>(apiV1Path(`/services/booking/${bookingId}/track`), {
    method: 'GET',
  });
}

export async function getBookingCompletion(bookingId: string): Promise<CompletionSummary | null> {
  return apiFetch<CompletionSummary>(apiV1Path(`/services/booking/${bookingId}`), {
    method: 'GET',
  });
}

export async function approveBookingCompletion(bookingId: string): Promise<void> {
  await apiFetch(apiV1Path(`/services/booking/${bookingId}/approve`), { method: 'POST' });
}

export async function cancelCustomerBooking(bookingId: string): Promise<void> {
  await apiFetch(apiV1Path(`/services/booking/${bookingId}/cancel`), { method: 'POST' });
}

export async function submitBookingRating(
  bookingId: string,
  rating: number,
  tags: string[],
  review?: string
): Promise<void> {
  // PDF specifies Ratings API: `POST /ratings/submit` (not booking-scoped).
  await apiFetch(apiV1Path('/ratings/submit'), {
    method: 'POST',
    body: JSON.stringify({ booking_id: bookingId, stars: rating, tags, review_text: review }),
  });
}

export async function submitBookingDispute(bookingId: string, reason: string): Promise<void> {
  // Current backend spec does not list dispute endpoint; attempt booking-scoped route.
  await apiFetch(apiV1Path(`/services/booking/${bookingId}/dispute`), {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function resetBookingPoll(bookingId: string) {
  // No-op: polling state is server-side.
  void bookingId;
}

export function estimateTotal(draft: BookingDraft): number {
  return Math.round((draft.priceMin + draft.priceMax) / 2);
}

export function buildBookPayload(draft: BookingDraft, addressId: string): BookServiceIn {
  return {
    category_id: draft.categoryId,
    subcategory_id: draft.subcategoryId,
    address_id: addressId,
    time_mode: draft.timeMode,
    schedule_type: draft.timeMode,
    scheduled_at: draft.scheduledAt ?? undefined,
    instructions: draft.instructions.trim() || undefined,
    special_instructions: draft.instructions.trim() || undefined,
    estimated_amount: estimateTotal(draft),
  };
}
