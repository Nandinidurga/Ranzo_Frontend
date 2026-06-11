export type CustomerAddress = {
  id: string;
  label: string;
  line1: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

export type ServiceIconSet = 'ionicons' | 'material';

export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  iconSet?: ServiceIconSet;
  color?: string;
};

export type ServiceSubcategory = {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  iconSet?: ServiceIconSet;
  priceMin: number;
  priceMax: number;
};

export type BookingTimeMode = 'now' | 'schedule';

export type BookingDraft = {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  priceMin: number;
  priceMax: number;
  timeMode: BookingTimeMode;
  scheduledAt: string | null;
  addressId: string | null;
  instructions: string;
};

export type BookingStatus =
  | 'searching'
  | 'sent'
  | 'accepted'
  | 'assigned'
  | 'failed'
  | 'completed';

export type TrackingPhase = 'on_way' | 'arrived' | 'in_progress' | 'complete';

export type BookingStatusUpdate = {
  id: string;
  status: BookingStatus;
  message: string;
  techniciansSent?: number;
  techniciansAccepted?: number;
  technician?: {
    id?: string;
    name: string;
    rating: number;
    etaMinutes: number;
    photoUri?: string | null;
    phoneMasked?: string;
  };
  refundProcessed?: boolean;
};

export type LiveTrackingUpdate = {
  bookingId: string;
  phase: TrackingPhase;
  banner: string;
  etaMinutes: number;
  technician: NonNullable<BookingStatusUpdate['technician']>;
  techLat: number;
  techLng: number;
  customerLat: number;
  customerLng: number;
};

export type BillMaterial = {
  name: string;
  price: number;
};

export type CompletionSummary = {
  bookingId: string;
  serviceName: string;
  technicianName: string;
  photosBefore: string[];
  photosAfter: string[];
  materials: BillMaterial[];
  serviceCharge: number;
  materialsTotal: number;
  tax: number;
  total: number;
  prepaid: boolean;
  approved: boolean;
};

export type RecentBooking = {
  id: string;
  serviceName: string;
  categoryId: string;
  subcategoryId: string;
  bookedAt: string;
};
