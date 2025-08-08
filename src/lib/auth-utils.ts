// Authentication utilities
import { useRouter } from "next/navigation";

/**
 * Handles redirect after successful login
 */
export const handlePostLoginRedirect = (
  router: ReturnType<typeof useRouter>
) => {
  // Check if there's a stored redirect URL
  const redirectUrl = localStorage.getItem("redirectAfterLogin");

  if (redirectUrl && redirectUrl !== "/auth/signin") {
    localStorage.removeItem("redirectAfterLogin");
    router.replace(redirectUrl);
  } else {
    // Default redirect based on user role or preference
    router.replace("/events"); // or dashboard
  }
};

/**
 * Stores current URL for post-login redirect
 */
export const storeRedirectUrl = (url: string) => {
  if (url && !url.includes("/auth/")) {
    localStorage.setItem("redirectAfterLogin", url);
  }
};

/**
 * Clear stored redirect URL
 */
export const clearRedirectUrl = () => {
  localStorage.removeItem("redirectAfterLogin");
};

/**
 * Get stored redirect URL
 */
export const getRedirectUrl = (): string | null => {
  return localStorage.getItem("redirectAfterLogin");
};
