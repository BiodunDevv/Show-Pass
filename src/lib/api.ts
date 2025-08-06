// API configuration utilities
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://showpass-backend-production.up.railway.app",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      FORGOT_PASSWORD: "/api/auth/forgot-password",
      RESET_PASSWORD: "/api/auth/reset-password",
      VERIFY_EMAIL: "/api/auth/verify-email",
      RESEND_VERIFICATION: "/api/auth/resend-verification",
      RESEND_VERIFICATION_EMAIL: "/api/auth/resend-verification-email",
      SETTINGS: "/api/auth/settings",
      ACCOUNT: "/api/auth/account",
      REACTIVATE: "/api/auth/reactivate",
      PROFILE_COMPREHENSIVE: "/api/auth/profile/comprehensive",
    },
    USER: {
      PROFILE: "/api/user-details/profile",
      ORGANIZER_PROFILE: "/api/user-details/organizer",
    },
    EVENTS: {
      GET_ALL: "/api/events",
      GET_FREE: "/api/events/free",
      GET_BY_ID: "/api/events",
      GET_CATEGORIES: "/api/events/categories",
      CREATE: "/api/events",
      UPDATE: "/api/events",
      DELETE: "/api/events",
      GET_ORGANIZER_EVENTS: "/api/events/organizer",
      GET_ATTENDEES: "/api/events",
    },
    ARTICLES: {
      GET_ALL: "/api/articles",
      GET_FEATURED: "/api/articles/featured",
      GET_BY_ID: "/api/articles",
      GET_BY_SLUG: "/api/articles/slug",
      GET_CATEGORIES: "/api/articles/categories",
      GET_BY_CATEGORY: "/api/articles/category",
      CREATE: "/api/articles",
      UPDATE: "/api/articles",
      DELETE: "/api/articles",
      LIKE: "/api/articles",
      ADD_COMMENT: "/api/articles",
      GET_COMMENTS: "/api/articles",
      ADD_REPLY: "/api/articles",
    },
    BOOKINGS: {
      CREATE: "/api/booking",
      FREE_EVENT: "/api/booking/free-event",
      CHECK_IN: "/api/booking",
      VERIFY_QR: "/api/booking/verify-qr",
      GET_MY_TICKETS: "/api/booking/my-tickets",
      GET_BY_ID: "/api/booking",
    },
  },
} as const;

// Create API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Create more specific error messages based on status code
      let errorMessage =
        data.message || `API request failed: ${response.status}`;

      if (response.status === 401) {
        errorMessage = `401: Unauthorized - ${
          data.message || "Authentication required"
        }`;
      } else if (response.status === 403) {
        errorMessage = `403: Forbidden - ${data.message || "Access denied"}`;
      } else if (response.status === 404) {
        errorMessage = `404: Not Found - ${
          data.message || "Resource not found"
        }`;
      } else if (response.status >= 500) {
        errorMessage = `${response.status}: Server Error - ${
          data.message || "Internal server error"
        }`;
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth token helper
export const getAuthHeaders = (token?: string) => ({
  Authorization: token ? `Bearer ${token}` : "",
});
