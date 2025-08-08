"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthCheck } from "@/components/AuthGuard";
import { useProtectedAction } from "@/components/ProtectedRoute";
import {
  LayoutGrid,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AuthStatusPage() {
  const { user, token, checkAuth, isLoading } = useAuthStore();
  const verifyAuth = useAuthCheck();
  const executeProtected = useProtectedAction();
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [authResult, setAuthResult] = useState<any>(null);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const result = await checkAuth();
      setAuthResult(result);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Manual auth check failed:", error);
      setAuthResult({
        error: error instanceof Error ? error.message : "Check failed",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleProtectedAction = async () => {
    await executeProtected(
      async () => {
        alert("Protected action executed successfully!");
      },
      "/auth/signin",
      "organizer" // Require organizer role
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Authentication Status Dashboard
            </h1>
            <p className="text-slate-400">
              Monitor your authentication state and test auth functionality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Auth State */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <User className="text-purple-400" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  Current State
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Authenticated</span>
                  <div className="flex items-center gap-2">
                    {user && token ? (
                      <>
                        <CheckCircle className="text-green-400" size={16} />
                        <span className="text-green-400 text-sm">Yes</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-red-400" size={16} />
                        <span className="text-red-400 text-sm">No</span>
                      </>
                    )}
                  </div>
                </div>

                {user && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">User</span>
                      <span className="text-white text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Role</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          user.role === "admin"
                            ? "bg-red-600/20 text-red-300"
                            : user.role === "organizer"
                            ? "bg-purple-600/20 text-purple-300"
                            : "bg-blue-600/20 text-blue-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Verified</span>
                      <div className="flex items-center gap-2">
                        {user.isVerified ? (
                          <>
                            <CheckCircle className="text-green-400" size={16} />
                            <span className="text-green-400 text-sm">Yes</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle
                              className="text-orange-400"
                              size={16}
                            />
                            <span className="text-orange-400 text-sm">No</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Token</span>
                  <span
                    className={`text-sm ${
                      token ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {token ? "Present" : "Missing"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Auth Testing */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-blue-400" size={24} />
                <h2 className="text-xl font-semibold text-white">
                  Auth Testing
                </h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleManualCheck}
                  disabled={checking || isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
                >
                  {checking ? (
                    <>
                      <LayoutGrid className="animate-spin" size={16} />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Manual Auth Check
                    </>
                  )}
                </button>

                <button
                  onClick={handleProtectedAction}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Shield size={16} />
                  Test Protected Action
                </button>

                {lastCheck && (
                  <div className="text-center text-slate-400 text-sm">
                    Last check: {lastCheck.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Auth Check Result */}
          {authResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Last Check Result
              </h3>

              {authResult.error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-400" size={16} />
                    <span className="text-red-400 font-medium">Error</span>
                  </div>
                  <p className="text-red-300 text-sm">{authResult.error}</p>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-400 font-medium">Success</span>
                  </div>
                  <pre className="text-green-300 text-sm overflow-x-auto">
                    {JSON.stringify(authResult, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* Usage Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Usage Guide
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-purple-400 font-medium mb-2">
                  ProtectedRoute Component
                </h4>
                <div className="bg-slate-900/50 rounded-lg p-3 font-mono text-slate-300">
                  {`<ProtectedRoute allowedRoles={['organizer']}>\n  <YourComponent />\n</ProtectedRoute>`}
                </div>
              </div>

              <div>
                <h4 className="text-blue-400 font-medium mb-2">
                  AuthGuard Component
                </h4>
                <div className="bg-slate-900/50 rounded-lg p-3 font-mono text-slate-300">
                  {`<AuthGuard redirectTo="/signin">\n  <YourComponent />\n</AuthGuard>`}
                </div>
              </div>

              <div>
                <h4 className="text-green-400 font-medium mb-2">
                  useAuthCheck Hook
                </h4>
                <div className="bg-slate-900/50 rounded-lg p-3 font-mono text-slate-300">
                  {`const verifyAuth = useAuthCheck();\nawait verifyAuth('/signin');`}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
