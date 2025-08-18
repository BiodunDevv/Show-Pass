"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LayoutGrid, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "organizer" | "admin")[];
  fallbackPath?: string;
  showRoleError?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["user", "organizer", "admin"],
  fallbackPath = "/auth/signin",
  showRoleError = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, role, checkAuth, isLoading } = useAuthStore();
  const [authState, setAuthState] = useState<
    "checking" | "authenticated" | "failed" | "insufficient_role"
  >("checking");
  const [error, setError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const MAX_RETRIES = 2;

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      // Wait for hydration to complete
      if (!isHydrated) return;

      setAuthState("checking");
      setError("");

      try {
        // Quick check: if no token, redirect immediately
        if (!token) {
          if (isMounted) {
            setAuthState("failed");
            setError("No authentication token found");
            // Store the attempted URL to redirect back after login
            if (pathname !== fallbackPath) {
              localStorage.setItem("redirectAfterLogin", pathname);
            }
            setTimeout(() => router.replace(fallbackPath), 1500);
          }
          return;
        }

        // If we have user data and it's valid, check role permission
        if (user && token) {
          if (allowedRoles.includes(user.role)) {
            if (isMounted) setAuthState("authenticated");
            return;
          } else {
            if (isMounted) {
              setAuthState("insufficient_role");
              setError(
                `This page requires ${allowedRoles.join(
                  " or "
                )} access. You are logged in as ${user.role}.`
              );
            }
            return;
          }
        }

        // Verify with server
        const response = await checkAuth();

        if (!isMounted) return;

        if (response.data.isAuthenticated && response.data.user) {
          const userRole = response.data.user.role;

          if (allowedRoles.includes(userRole)) {
            setAuthState("authenticated");
          } else {
            setAuthState("insufficient_role");
            setError(
              `This page requires ${allowedRoles.join(
                " or "
              )} access. You are logged in as ${userRole}.`
            );
          }
        } else {
          setAuthState("failed");
          setError("Authentication verification failed");
          if (pathname !== fallbackPath) {
            localStorage.setItem("redirectAfterLogin", pathname);
          }
          setTimeout(() => router.replace(fallbackPath), 1500);
        }
      } catch (error: any) {
        console.error("Auth verification failed:", error);

        if (!isMounted) return;

        if (
          retryCount < MAX_RETRIES &&
          error?.message !== "No authentication token found"
        ) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => verifyAuth(), 2000);
          return;
        }

        setAuthState("failed");
        setError(error?.message || "Authentication check failed");

        if (pathname !== fallbackPath) {
          localStorage.setItem("redirectAfterLogin", pathname);
        }
        setTimeout(() => router.replace(fallbackPath), 1500);
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [
    user,
    token,
    checkAuth,
    router,
    pathname,
    allowedRoles,
    fallbackPath,
    retryCount,
    isHydrated,
  ]);

  const LoadingComponent = () => (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-600/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <LayoutGrid
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500"
            size={24}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-purple-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <motion.div
          className="space-y-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-white">
            Verifying Authentication
          </h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            {retryCount > 0
              ? `Retrying... (${retryCount}/${MAX_RETRIES})`
              : "Checking your credentials and permissions..."}
          </p>
        </motion.div>

        {/* Enhanced loading animation */}
        <div className="flex justify-center mt-6 space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  const ErrorComponent = ({
    type,
  }: {
    type: "failed" | "insufficient_role";
  }) => (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          type === "insufficient_role"
            ? "from-orange-900/20 via-slate-900 to-orange-900/20"
            : "from-red-900/20 via-slate-900 to-red-900/20"
        }`}
      />

      <motion.div
        className="relative z-10 text-center max-w-md mx-auto p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div
            className={`absolute inset-0 rounded-full ${
              type === "insufficient_role"
                ? "bg-orange-600/20"
                : "bg-red-600/20"
            }`}
          />
          {type === "insufficient_role" ? (
            <AlertCircle
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500"
              size={24}
            />
          ) : (
            <LayoutGrid
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500"
              size={24}
            />
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">
            {type === "insufficient_role"
              ? "Access Denied"
              : "Authentication Required"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error ||
              (type === "insufficient_role"
                ? "You do not have permission to access this page"
                : "Please sign in to continue")}
          </p>
        </div>

        {type !== "insufficient_role" && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex justify-center space-x-1">
              <RefreshCw className="text-purple-400 animate-spin" size={16} />
              <span className="text-sm text-purple-400">
                Redirecting to sign in...
              </span>
            </div>
          </motion.div>
        )}

        {type === "insufficient_role" && showRoleError && (
          <motion.button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        )}
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {authState === "checking" && <LoadingComponent />}
      {authState === "failed" && <ErrorComponent type="failed" />}
      {authState === "insufficient_role" && (
        <ErrorComponent type="insufficient_role" />
      )}
      {authState === "authenticated" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility hook for checking auth programmatically
export const useProtectedAction = () => {
  const { checkAuth } = useAuthStore();
  const router = useRouter();

  const executeIfAuthenticated = async (
    action: () => void | Promise<void>,
    redirectTo: string = "/auth/signin",
    requiredRole?: "user" | "organizer" | "admin"
  ) => {
    try {
      const response = await checkAuth();

      if (!response.data.isAuthenticated) {
        router.push(redirectTo);
        return false;
      }

      if (requiredRole && response.data.user.role !== requiredRole) {
        console.error(
          `Action requires ${requiredRole} role, but user is ${response.data.user.role}`
        );
        return false;
      }

      await action();
      return true;
    } catch (error) {
      console.error("Protected action failed:", error);
      router.push(redirectTo);
      return false;
    }
  };

  return executeIfAuthenticated;
};
