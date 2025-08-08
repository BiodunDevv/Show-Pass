"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: LogoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md shadow-xl relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>

              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-400 text-sm">
                  Are you sure you want to log out? You'll need to sign in again
                  to access your account.
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>{isLoading ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
