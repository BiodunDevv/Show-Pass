import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_CONFIG, apiRequest } from "@/lib/api";

// Event interfaces based on the API response
interface Venue {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Organizer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  id: string;
}

interface TicketType {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
  benefits: string[];
  isFree: boolean;
}

interface Warning {
  adminId: string;
  reason: string;
  issuedAt: string;
  severity: "minor" | "major";
  _id: string;
  id: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  organizer: Organizer;
  category: string;
  venue: Venue;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  ticketTypes: TicketType[];
  images: string[];
  approved: boolean;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  tags: string[];
  maxAttendees: number;
  currentAttendees: number;
  isPublic: boolean;
  requiresApproval: boolean;
  isFreeEvent: boolean;
  notificationsSent: boolean;
  warningCount: number;
  flaggedForDeletion: boolean;
  warnings: Warning[];
  postApprovalModifications: any[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  totalTickets: number;
  ticketsSold: number;
  totalRevenue: number;
  isFree: boolean;
  isUpcoming: boolean;
  isOngoing: boolean;
  id: string;
}

interface EventsResponse {
  success: boolean;
  message: string;
  data: Event[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface EventFilters {
  page?: number;
  limit?: number;
  sortBy?: "startDate" | "title" | "category";
  sortOrder?: "asc" | "desc";
  category?: string;
  city?: string;
  state?: string;
  search?: string;
  featured?: boolean;
}

interface QRCodeData {
  bookingId: string;
  eventId: string;
  reference: string;
  generatedAt: string;
}

interface QRVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    booking: any;
    event: Event;
    attendee: any;
    isValid: boolean;
  };
}

interface CheckInResponse {
  success: boolean;
  message: string;
  data?: {
    booking: any;
    checkedInAt: string;
  };
}

interface EventAttendee {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  event: string;
  ticketType: TicketType;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  bookingReference: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

interface EventState {
  events: Event[];
  featuredEvents: Event[];
  freeEvents: Event[];
  categories: string[];
  currentEvent: Event | null;
  eventAttendees: EventAttendee[];
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;

  // Actions
  fetchEvents: (filters?: EventFilters) => Promise<EventsResponse>;
  fetchFeaturedEvents: () => Promise<void>;
  fetchFreeEvents: (filters?: EventFilters) => Promise<void>;
  fetchEventById: (id: string) => Promise<Event>;
  fetchEventCategories: () => Promise<string[]>;
  searchEvents: (
    query: string,
    filters?: Omit<EventFilters, "search">
  ) => Promise<void>;

  // Organizer actions
  createEvent: (eventData: any) => Promise<Event>;
  updateEvent: (eventId: string, updateData: any) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  fetchOrganizerEvents: (filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => Promise<void>;

  // Attendee management
  fetchEventAttendees: (
    eventId: string,
    filters?: { page?: number; limit?: number }
  ) => Promise<void>;
  checkInAttendee: (bookingId: string) => Promise<CheckInResponse>;
  verifyQRCode: (qrCodeData: string) => Promise<QRVerificationResponse>;

  // State management
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
  setCurrentEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      featuredEvents: [],
      freeEvents: [],
      categories: [],
      currentEvent: null,
      eventAttendees: [],
      isLoading: false,
      error: null,
      filters: {
        page: 1,
        limit: 10,
        sortBy: "startDate",
        sortOrder: "asc",
      },

      fetchEvents: async (filters?: EventFilters) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          const currentFilters = { ...get().filters, ...filters };

          Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value.toString());
            }
          });

          const data: EventsResponse = await apiRequest(
            `${API_CONFIG.ENDPOINTS.EVENTS.GET_ALL}?${queryParams.toString()}`,
            {
              method: "GET",
            }
          );

          set({
            events: data.data,
            filters: currentFilters,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch events";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchFeaturedEvents: async () => {
        set({ isLoading: true, error: null });

        try {
          const data: EventsResponse = await apiRequest(
            `${API_CONFIG.ENDPOINTS.EVENTS.GET_ALL}?featured=true&limit=6`,
            {
              method: "GET",
            }
          );

          set({
            featuredEvents: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch featured events";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchFreeEvents: async (filters?: EventFilters) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          const currentFilters = { page: 1, limit: 10, ...filters };

          Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value.toString());
            }
          });

          const data: EventsResponse = await apiRequest(
            `${API_CONFIG.ENDPOINTS.EVENTS.GET_FREE}?${queryParams.toString()}`,
            {
              method: "GET",
            }
          );

          set({
            freeEvents: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch free events";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchEventById: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            `${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID}/${id}`,
            {
              method: "GET",
            }
          );

          const event: Event = data.data;
          set({
            currentEvent: event,
            isLoading: false,
            error: null,
          });

          return event;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch event";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchEventCategories: async () => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            API_CONFIG.ENDPOINTS.EVENTS.GET_CATEGORIES,
            {
              method: "GET",
            }
          );

          const categories: string[] = data.data || [];
          set({
            categories,
            isLoading: false,
            error: null,
          });

          return categories;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch categories";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      searchEvents: async (
        query: string,
        filters?: Omit<EventFilters, "search">
      ) => {
        const searchFilters = { ...filters, search: query };
        await get().fetchEvents(searchFilters);
      },

      setFilters: (filters: Partial<EventFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({
          filters: {
            page: 1,
            limit: 10,
            sortBy: "startDate",
            sortOrder: "asc",
          },
        });
      },

      setCurrentEvent: (event: Event | null) => {
        set({ currentEvent: event });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Organizer event management
      createEvent: async (eventData: any) => {
        set({ isLoading: true, error: null });

        try {
          // Get auth token from localStorage or auth store
          const authData = JSON.parse(
            localStorage.getItem("auth-storage") || "{}"
          );
          const token = authData?.state?.token;

          console.log("Creating event with data:", eventData);
          console.log("Using token:", token ? "Token present" : "No token");

          const data = await apiRequest(API_CONFIG.ENDPOINTS.EVENTS.CREATE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(eventData),
          });

          const newEvent: Event = data.data;
          set((state) => ({
            events: [newEvent, ...state.events],
            isLoading: false,
            error: null,
          }));

          return newEvent;
        } catch (error) {
          console.error("Create event detailed error:", error);

          // Enhanced error logging
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }

          const errorMessage =
            error instanceof Error ? error.message : "Failed to create event";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateEvent: async (eventId: string, updateData: any) => {
        set({ isLoading: true, error: null });

        try {
          const authData = JSON.parse(
            localStorage.getItem("auth-storage") || "{}"
          );
          const token = authData?.state?.token;

          const data = await apiRequest(
            `${API_CONFIG.ENDPOINTS.EVENTS.UPDATE}/${eventId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify(updateData),
            }
          );

          const updatedEvent: Event = data.data;
          set((state) => ({
            events: state.events.map((event) =>
              event._id === eventId ? updatedEvent : event
            ),
            currentEvent:
              state.currentEvent?._id === eventId
                ? updatedEvent
                : state.currentEvent,
            isLoading: false,
            error: null,
          }));

          return updatedEvent;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update event";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteEvent: async (eventId: string) => {
        set({ isLoading: true, error: null });

        try {
          const authData = JSON.parse(
            localStorage.getItem("auth-storage") || "{}"
          );
          const token = authData?.state?.token;

          await apiRequest(`${API_CONFIG.ENDPOINTS.EVENTS.DELETE}/${eventId}`, {
            method: "DELETE",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

          set((state) => ({
            events: state.events.filter((event) => event._id !== eventId),
            currentEvent:
              state.currentEvent?._id === eventId ? null : state.currentEvent,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete event";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchOrganizerEvents: async (filters?: {
        page?: number;
        limit?: number;
        status?: string;
      }) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
              }
            });
          }

          const data: EventsResponse = await apiRequest(
            `${
              API_CONFIG.ENDPOINTS.EVENTS.GET_ORGANIZER_EVENTS
            }?${queryParams.toString()}`,
            {
              method: "GET",
              headers: {
                Authorization: (() => {
                  const authData = JSON.parse(
                    localStorage.getItem("auth-storage") || "{}"
                  );
                  const token = authData?.state?.token;
                  return token ? `Bearer ${token}` : "";
                })(),
              },
            }
          );

          set({
            events: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch organizer events";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Attendee management
      fetchEventAttendees: async (
        eventId: string,
        filters?: { page?: number; limit?: number }
      ) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
              }
            });
          }

          const data = await apiRequest(
            `${
              API_CONFIG.ENDPOINTS.EVENTS.GET_ATTENDEES
            }/${eventId}/attendees?${queryParams.toString()}`,
            {
              method: "GET",
            }
          );

          set({
            eventAttendees: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch event attendees";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      checkInAttendee: async (bookingId: string): Promise<CheckInResponse> => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            `${API_CONFIG.ENDPOINTS.BOOKINGS.CHECK_IN}/${bookingId}/checkin`,
            {
              method: "PUT",
            }
          );

          // Update the attendee in the local state
          set((state) => ({
            eventAttendees: state.eventAttendees.map((attendee) =>
              attendee._id === bookingId
                ? {
                    ...attendee,
                    checkedIn: true,
                    checkedInAt: new Date().toISOString(),
                  }
                : attendee
            ),
            isLoading: false,
            error: null,
          }));

          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to check in attendee";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      verifyQRCode: async (
        qrCodeData: string
      ): Promise<QRVerificationResponse> => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            API_CONFIG.ENDPOINTS.BOOKINGS.VERIFY_QR,
            {
              method: "POST",
              body: JSON.stringify({ qrCode: qrCodeData }),
            }
          );

          set({ isLoading: false, error: null });
          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to verify QR code";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "event-storage",
      partialize: (state) => ({
        events: state.events,
        featuredEvents: state.featuredEvents,
        freeEvents: state.freeEvents,
        categories: state.categories,
        currentEvent: state.currentEvent,
        filters: state.filters,
      }),
    }
  )
);
