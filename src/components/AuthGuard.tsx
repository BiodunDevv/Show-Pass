"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LayoutGrid } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

export default function AuthGuard({
  children,
  redirectTo = "/auth/signin",
  showLoading = true,
}: AuthGuardProps) {
  const router = useRouter();
  const { user, token, checkAuth, isLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    const verifyAuthentication = async () => {
      // If no token, redirect immediately
      if (!token) {
        setAuthFailed(true);
        setIsCheckingAuth(false);
        router.replace(redirectTo);
        return;
      }

      // If user exists and token exists, assume authenticated (skip API call for performance)
      if (user && token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Check authentication status with the server
        await checkAuth();
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthFailed(true);
        setIsCheckingAuth(false);
        router.replace(redirectTo);
      }
    };

    verifyAuthentication();
  }, [user, token, checkAuth, router, redirectTo]);

  // Show loading state while checking authentication
  if ((isCheckingAuth || isLoading) && showLoading) {
    return (
      <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
        {/* Loading content */}
        <div className="relative z-10 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-pulse"></div>
            <LayoutGrid
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500 animate-spin"
              size={20}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Verifying Authentication
            </h3>
            <p className="text-sm text-slate-400">
              Please wait while we check your credentials...
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // If authentication failed, don't render children (redirect is handled in useEffect)
  if (authFailed && showLoading) {
    return (
      <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-slate-900 to-red-900/20" />
        <div className="relative z-10 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-red-600/20"></div>
            <LayoutGrid
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500"
              size={20}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Authentication Required
            </h3>
            <p className="text-sm text-slate-400">
              Redirecting to sign in page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}

// Hook for imperative auth checking
export const useAuthCheck = () => {
  const { checkAuth } = useAuthStore();
  const router = useRouter();

  const verifyAuth = async (
    redirectTo: string = "/auth/signin"
  ): Promise<boolean> => {
    try {
      const response = await checkAuth();
      return response.data.isAuthenticated;
    } catch (error) {
      console.error("Auth verification failed:", error);
      router.replace(redirectTo);
      return false;
    }
  };

  return verifyAuth;
};
