import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_CONFIG, apiRequest } from "@/lib/api";

// API Response interfaces based on the provided responses
interface Notifications {
  email: boolean;
  newEvents: boolean;
  eventUpdates: boolean;
  eventApprovals?: boolean; // Only for organizers
}

interface Preferences {
  favoriteCategories: string[];
  eventNotificationRadius: number;
}

interface Statistics {
  eventsCreated: number;
  eventsAttended: number;
  accountAge: string;
  lastActivity: string;
  verificationStatus: boolean;
  accountStatus: string;
  organizerMetrics?: {
    totalEventsCreated: number;
    totalRevenue: number;
    averageEventAttendance: number;
    pendingEvents: number;
    approvedEvents: number;
    recentEvents: any[];
  };
  userMetrics?: {
    totalEventsAttended: number;
    favoriteCategory: string;
    upcomingEvents: number;
    recentBookings: any[];
  };
}

interface FinancialSummary {
  totalSpent: number;
  averageSpentPerEvent: number;
  lastPurchase: string | null;
  favoriteCategory: string;
}

interface ActivitySummary {
  totalBookings: number;
  lastBooking: string | null;
  joinDate: string;
  lastLogin: string | null;
}

interface UserProfile extends User {
  totalSpent: number;
  purchaseHistory: any[];
  statistics: Statistics;
  financialSummary: FinancialSummary;
  profileCompleteness: number;
  activitySummary: ActivitySummary;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "organizer" | "admin";
  phone: string;
  isVerified: boolean;
  blocked: boolean;
  notifications: Notifications;
  preferences?: Preferences; // Only for users
  createdEvents?: string[]; // Only for organizers
  attendingEvents: string[];
  verified?: boolean; // Only for organizers
  verificationDocuments?: string[]; // Only for organizers
  rating?: number; // Only for organizers
  totalEventsCreated?: number; // Only for organizers
  totalTicketsSold?: number; // Only for organizers
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Backward compatibility
  id?: string;
  name?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  token: string | null;
  role: "user" | "organizer" | "admin" | null;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Profile actions
  fetchUserProfile: () => Promise<UserProfile>;

  // Password actions
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;

  // Email verification
  verifyEmail: (code: string) => Promise<{ success: boolean; message: string }>;
  resendVerification: (
    email?: string
  ) => Promise<{ success: boolean; message: string }>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user" | "organizer";
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      token: null,
      role: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const data: AuthResponse = await apiRequest(
            API_CONFIG.ENDPOINTS.AUTH.LOGIN,
            {
              method: "POST",
              body: JSON.stringify({ email, password }),
            }
          );

          const { user, token } = data.data;
          set({
            user,
            token,
            role: user.role,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const data: AuthResponse = await apiRequest(
            API_CONFIG.ENDPOINTS.AUTH.REGISTER,
            {
              method: "POST",
              body: JSON.stringify(userData),
            }
          );

          const { user, token } = data.data;
          set({
            user,
            token,
            role: user.role,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
            {
              method: "POST",
              body: JSON.stringify({ email }),
            }
          );

          set({ isLoading: false, error: null });
          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to send reset email";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
            {
              method: "POST",
              body: JSON.stringify({ token, newPassword }),
            }
          );

          set({ isLoading: false, error: null });
          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Password reset failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log("Verifying email with code:", code);
          console.log("API endpoint:", API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL);

          const data = await apiRequest(
            API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL,
            {
              method: "POST",
              body: JSON.stringify({ code }),
            }
          );

          console.log("Verification response:", data);

          // Update user verification status if user is logged in
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, isVerified: true },
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false, error: null });
          }

          return data;
        } catch (error) {
          console.error("Verification API error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Email verification failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      resendVerification: async (email?: string) => {
        set({ isLoading: true, error: null });

        try {
          // If email is provided, use public endpoint (for unverified users)
          // If no email, use authenticated endpoint (for logged in users)
          if (email) {
            const data = await apiRequest(
              API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION_EMAIL,
              {
                method: "POST",
                body: JSON.stringify({ email }),
              }
            );
            set({ isLoading: false, error: null });
            return data;
          } else {
            // Use authenticated endpoint for logged-in users
            const currentToken = get().token;
            if (!currentToken) {
              throw new Error("No authentication token found");
            }

            const data = await apiRequest(
              API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${currentToken}`,
                },
              }
            );
            set({ isLoading: false, error: null });
            return data;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to resend verification email";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchUserProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const currentToken = get().token;
          if (!currentToken) {
            throw new Error("No authentication token found");
          }

          const data = await apiRequest(API_CONFIG.ENDPOINTS.USER.PROFILE, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          });

          const userProfile: UserProfile = data.data;
          set({
            userProfile,
            isLoading: false,
            error: null,
          });

          return userProfile;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user profile";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          userProfile: null,
          token: null,
          role: null,
          error: null,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user, role: user.role });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        token: state.token,
        role: state.role,
      }),
      // Add storage configuration for better persistence
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration if needed
        return persistedState;
      },
    }
  )
);
