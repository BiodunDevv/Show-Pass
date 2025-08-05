import { create } from "zustand";
import { apiRequest, API_CONFIG, getAuthHeaders } from "@/lib/api";
import { useAuthStore } from "./useAuthStore";

export interface BookingAttendee {
  name: string;
  email: string;
  phone: string;
  _id: string;
  id: string;
}

export interface BookingEvent {
  _id: string;
  title: string;
  description?: string;
  category: string;
  startDate: string;
  endDate: string;
  images: string[];
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  organizer?: string;
  totalTickets: number;
  ticketsSold: number;
  totalRevenue: number;
  isFree: boolean;
  isUpcoming: boolean;
  isOngoing: boolean;
  id: string;
}

export interface BookingUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  id: string;
}

export interface IndividualQR {
  attendeeId: string;
  qrCode: string;
  qrCodeImage: string;
  attendee: BookingAttendee;
}

export interface Booking {
  _id: string;
  user: BookingUser;
  event: BookingEvent;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  platformFee: number;
  vat: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  frontendPaymentId: string;
  qrCode: string;
  qrCodeImage: string;
  attendeeInfo: BookingAttendee[];
  individualQRs?: IndividualQR[];
  isCheckedIn: boolean;
  createdAt: string;
  updatedAt: string;
  paymentReference: string;
  statusDisplay: string;
  canCancel: boolean;
  id: string;
}

export interface BookingMeta {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface BookingStore {
  userBookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  meta: BookingMeta | null;

  // Actions
  fetchUserBookings: (page?: number, limit?: number) => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<Booking | null>;
  clearError: () => void;
  clearBookings: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  userBookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
  meta: null,

  fetchUserBookings: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });

      // Get the token from auth store
      const { token } = useAuthStore.getState();

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await apiRequest(
        `${
          API_CONFIG.ENDPOINTS.BOOKINGS.GET_MY_TICKETS
        }?${queryParams.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (response.success) {
        set({
          userBookings: response.data || [],
          meta: response.meta || null,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Failed to fetch user bookings:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch bookings",
        isLoading: false,
      });
    }
  },

  fetchBookingById: async (bookingId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Get the token from auth store
      const { token } = useAuthStore.getState();

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.GET_BY_ID}/${bookingId}`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (response.success) {
        set({
          currentBooking: response.data,
          isLoading: false,
        });
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch booking");
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch booking",
        isLoading: false,
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  clearBookings: () =>
    set({ userBookings: [], currentBooking: null, meta: null }),
}));
