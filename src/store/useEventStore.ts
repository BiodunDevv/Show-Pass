import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_CONFIG, apiRequest } from "@/lib/api";
import { useAuthStore } from "./useAuthStore";

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

export interface EventAttendee {
  bookingId: string;
  attendeeType: "booker" | "attendee";
  name: string;
  email: string;
  phone: string;
  bookingStatus: string;
  ticketType: string;
  bookingDate: string;
  totalAmount: number;
  paymentReference: string;
  isCheckedIn: boolean;
  checkInTime: string | null;
  verificationCode: string;
  ticketNumber: number;
  codeHash: string;
  bookingUser: {
    name: string;
    email: string;
    phone: string;
  };
  totalBookingAmount: number;
  bookingQuantity: number;
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
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      filter?: string;
    }
  ) => Promise<{
    success: boolean;
    data?: any[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
    statusSummary?: any;
    error?: string;
  }>;
  checkInAttendee: (bookingId: string) => Promise<CheckInResponse>;
  verifyQRCode: (qrCodeData: string) => Promise<QRVerificationResponse>;
  verifyEventCode: (
    eventId: string,
    verificationCode: string
  ) => Promise<QRVerificationResponse>;

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
        filters?: {
          page?: number;
          limit?: number;
          search?: string;
          filter?: string;
        }
      ) => {
        // Get token from localStorage
        const authData = JSON.parse(
          localStorage.getItem("auth-storage") || "{}"
        );
        const token = authData?.state?.token;

        if (!token) {
          set({ error: "Authentication required", isLoading: false });
          return { success: false, error: "Authentication required" };
        }

        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          if (filters?.search?.trim()) {
            queryParams.append("search", filters.search.trim());
          }
          if (filters?.filter && filters.filter !== "all") {
            queryParams.append("status", filters.filter);
          }

          console.log(
            "Fetching attendees for event ID:",
            eventId,
            queryParams.toString()
          );

          const data = await apiRequest(
            `${
              API_CONFIG.ENDPOINTS.EVENTS.GET_ATTENDEES
            }/${eventId}/attendees?${queryParams.toString()}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (data.success) {
            const attendees = data.data?.attendees || [];
            set({
              eventAttendees: attendees,
              isLoading: false,
              error: null,
            });

            return {
              success: true,
              data: attendees,
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: data.data?.totalAttendees || attendees.length,
                limit: attendees.length,
              },
              statusSummary: data.data?.statusSummary,
            };
          } else {
            console.error("Failed to fetch attendees:", data.message);
            set({
              error: "Failed to fetch event attendees",
              isLoading: false,
            });
            return {
              success: false,
              error: "Failed to fetch event attendees",
            };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch event attendees";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      checkInAttendee: async (bookingId: string): Promise<CheckInResponse> => {
        set({ isLoading: true, error: null });

        try {
          // Get the authentication token
          const token = useAuthStore.getState().token;

          if (!token) {
            throw new Error("Authentication required. Please login first.");
          }

          const data = await apiRequest(
            `${API_CONFIG.ENDPOINTS.BOOKINGS.CHECK_IN}/${bookingId}/checkin`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update the attendee in the local state
          set((state) => ({
            eventAttendees: state.eventAttendees.map((attendee) =>
              attendee.bookingId === bookingId
                ? {
                    ...attendee,
                    isCheckedIn: true,
                    checkInTime: new Date().toISOString(),
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
          // Get the authentication token
          const token = useAuthStore.getState().token;

          if (!token) {
            throw new Error("Authentication required. Please login first.");
          }

          const data = await apiRequest(
            API_CONFIG.ENDPOINTS.BOOKINGS.VERIFY_QR,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
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

      verifyEventCode: async (
        eventId: string,
        verificationCode: string
      ): Promise<QRVerificationResponse> => {
        set({ isLoading: true, error: null });

        try {
          const token = useAuthStore.getState().token;
          if (!token) {
            throw new Error("Authentication required. Please login first.");
          }
          if (!eventId || !verificationCode) {
            throw new Error("Event ID and verification code are required");
          }

          // Debug logging
          console.log("Verifying event code with:", {
            eventId,
            verificationCode: verificationCode.slice(0, 3) + "...", // Don't log full code for security
            endpoint: API_CONFIG.ENDPOINTS.BOOKINGS.VERIFY_EVENT,
          });

          let data: any;
          try {
            // Try with the most likely field names the backend expects
            data = await apiRequest(
              API_CONFIG.ENDPOINTS.BOOKINGS.VERIFY_EVENT,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  event_id: eventId,
                  verification_code: verificationCode,
                }),
              }
            );
          } catch (primaryError) {
            const message =
              primaryError instanceof Error
                ? primaryError.message
                : String(primaryError);
            // Try alternative field names if the first attempt fails
            try {
              data = await apiRequest(
                API_CONFIG.ENDPOINTS.BOOKINGS.VERIFY_EVENT,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    eventId: eventId,
                    verificationCode: verificationCode,
                  }),
                }
              );
            } catch (secondaryError) {
              // Try with the alternate names from the retry logic
              try {
                data = await apiRequest(
                  API_CONFIG.ENDPOINTS.BOOKINGS.VERIFY_EVENT,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      freeEventId: eventId,
                      code: verificationCode,
                    }),
                  }
                );
              } catch (tertiaryError) {
                // Final attempt with simple field names
                data = await apiRequest(
                  API_CONFIG.ENDPOINTS.BOOKINGS.VERIFY_EVENT,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: eventId,
                      code: verificationCode,
                    }),
                  }
                );
              }
            }
          }

          // If we can map booking id to attendee in current list, mark as checked-in
          const maybeBookingId = data?.data?.booking?.id;
          set((state) => ({
            eventAttendees: state.eventAttendees.map((attendee) =>
              attendee.bookingId === maybeBookingId
                ? {
                    ...attendee,
                    isCheckedIn: true,
                    checkInTime: new Date().toISOString(),
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
              : "Failed to verify event code";
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
