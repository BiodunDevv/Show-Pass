"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Ticket,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
    title: "Secure Reset",
    description: "Your account security is our top priority",
  },
  {
    url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    title: "Almost Done",
    description: "Just one more step to regain access",
  },
  {
    url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop",
    title: "New Beginning",
    description: "Get back to discovering amazing events",
  },
];

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { resetPassword, isLoading, error } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    return errors;
  };

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    setValidationErrors(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationErrors(["Passwords do not match"]);
      return;
    }

    if (!token) {
      return;
    }

    setValidationErrors([]);

    try {
      await resetPassword(token, newPassword);
      setIsCompleted(true);
    } catch (error) {
      console.error("Reset password error:", error);
      // Error is handled by the auth store
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        {/* Left Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-lg">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">
                  Password Reset Successful!
                </h1>
                <p className="text-gray-300 mb-6">
                  Your password has been updated successfully. You can now sign
                  in with your new password.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/auth/signin")}
                    className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                  >
                    Continue to Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Slideshow (Hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentImageIndex].url}
                alt={heroImages[currentImageIndex].title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Image Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentImageIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-3xl font-bold mb-2">Welcome Back!</h3>
                <p className="text-gray-300 text-lg">
                  Your account is secure and ready to use.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Request New Reset Link
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Back to Sign In Button */}
          <div className="mb-6">
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300 group backdrop-blur-sm border border-slate-700/30"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Sign In</span>
            </Link>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-lg">
            <div className="p-6">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    ShowPass
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white mb-2 text-center">
                  Reset Password
                </h1>
                <p className="text-gray-400 mb-6 text-center">
                  Create a new secure password for your account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {(error || validationErrors.length > 0) && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-2 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          {error && <p>{error}</p>}
                          {validationErrors.map((err, index) => (
                            <p key={index}>{err}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="text-xs font-medium text-gray-300 block"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="w-full pl-9 pr-9 h-10 bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-xs font-medium text-gray-300 block"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-9 h-10 bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="text-xs text-gray-400">
                      <p className="mb-1">Password must contain:</p>
                      <ul className="space-y-1">
                        <li
                          className={
                            newPassword.length >= 8
                              ? "text-green-400"
                              : "text-gray-400"
                          }
                        >
                          • At least 8 characters
                        </li>
                        <li
                          className={
                            /(?=.*[a-z])/.test(newPassword)
                              ? "text-green-400"
                              : "text-gray-400"
                          }
                        >
                          • One lowercase letter
                        </li>
                        <li
                          className={
                            /(?=.*[A-Z])/.test(newPassword)
                              ? "text-green-400"
                              : "text-gray-400"
                          }
                        >
                          • One uppercase letter
                        </li>
                        <li
                          className={
                            /(?=.*\d)/.test(newPassword)
                              ? "text-green-400"
                              : "text-gray-400"
                          }
                        >
                          • One number
                        </li>
                      </ul>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      isLoading ||
                      validationErrors.length > 0 ||
                      newPassword !== confirmPassword
                    }
                  >
                    {isLoading ? (
                      <span className="text-sm">Updating Password...</span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm justify-center">
                        Update Password
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    Remember your password?{" "}
                    <Link
                      href="/auth/signin"
                      className="text-pink-400 hover:text-pink-300 font-semibold"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Slideshow (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentImageIndex].url}
              alt={heroImages[currentImageIndex].title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Image Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentImageIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-3xl font-bold mb-2">
                {heroImages[currentImageIndex].title}
              </h3>
              <p className="text-gray-300 text-lg">
                {heroImages[currentImageIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
