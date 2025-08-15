"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, Ticket, AlertTriangle } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check initial connection
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineModal(false);
      setIsRetrying(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineModal(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Additional check for actual internet connectivity
    const checkConnectivity = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setShowOfflineModal(true);
        return;
      }

      try {
        const response = await fetch("/favicon.ico", {
          method: "HEAD",
          cache: "no-cache",
        });
        const connected = response.ok;

        if (!connected && isOnline) {
          setIsOnline(false);
          setShowOfflineModal(true);
        } else if (connected && !isOnline) {
          setIsOnline(true);
          setShowOfflineModal(false);
          setIsRetrying(false);
        }
      } catch {
        if (isOnline) {
          setIsOnline(false);
          setShowOfflineModal(true);
        }
      }
    };

    // Check connectivity every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleRetryConnection = async () => {
    setIsRetrying(true);

    try {
      const response = await fetch("/favicon.ico", {
        method: "HEAD",
        cache: "no-cache",
      });

      if (response.ok) {
        setIsOnline(true);
        setShowOfflineModal(false);
        setIsRetrying(false);
      } else {
        setTimeout(() => setIsRetrying(false), 2000);
      }
    } catch {
      setTimeout(() => setIsRetrying(false), 2000);
    }
  };

  return (
    <>
      {/* Network Status Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-red-600 text-white px-4 py-2 text-center text-sm font-medium"
          >
            <div className="flex items-center justify-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span>No internet connection</span>
              <button
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="ml-2 text-red-200 hover:text-white underline disabled:opacity-50"
              >
                {isRetrying ? "Checking..." : "Retry"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Modal */}
      <AnimatePresence>
        {showOfflineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700/50 rounded-xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-800 to-red-900/20" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                      <Ticket className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <WifiOff className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Connection Lost
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Oops! It looks like you've lost your internet connection.
                    ShowPass needs an internet connection to help you discover
                    and book amazing events.
                  </p>
                  <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center space-x-2 text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        Please check your connection
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleRetryConnection}
                    disabled={isRetrying}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isRetrying ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                        <span>Checking Connection...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4" />
                        <span>Try Again</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-500 text-xs">
                      The page will automatically refresh when your connection
                      is restored
                    </p>
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <p className="text-gray-400 text-xs text-center">
                    💡 Try checking your WiFi, mobile data, or network settings
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
