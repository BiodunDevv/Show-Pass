"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Ticket,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type VerificationStatus = "initial" | "loading" | "success" | "error";

export default function VerifyPage() {
  const [status, setStatus] = useState<VerificationStatus>("initial");
  const [countdown, setCountdown] = useState(5);
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { verifyEmail, resendVerification, error } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const images = [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
  ];

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Image rotation
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      return;
    }

    setStatus("loading");

    try {
      console.log("Starting verification with code:", verificationCode);
      const result = await verifyEmail(verificationCode);
      console.log("Verification successful:", result);
      setStatus("success");

      // Start countdown for auto-redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup timer after 5 seconds
      setTimeout(() => clearInterval(timer), 5000);
    } catch (error: any) {
      console.error("Email verification failed:", error);
      setStatus("error");
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      alert("Please provide your email address");
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    try {
      await resendVerification(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to resend verification code:", error);
    } finally {
      setIsResending(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "loading":
        return {
          icon: <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />,
          title: "Verifying Your Email",
          message: "Please wait while we verify your email address...",
          bgColor: "bg-blue-500/20",
          borderColor: "border-blue-500/20",
        };
      case "success":
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: "Email Verified Successfully!",
          message: "Your email has been verified. Welcome to ShowPass!",
          bgColor: "bg-green-500/20",
          borderColor: "border-green-500/20",
        };
      case "error":
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: "Verification Failed",
          message: error || "Invalid verification code. Please try again.",
          bgColor: "bg-red-500/20",
          borderColor: "border-red-500/20",
        };
      default:
        return {
          icon: <Ticket className="h-12 w-12 text-purple-500" />,
          title: "Verify Your Email",
          message: "Enter the 6-digit code sent to your email address",
          bgColor: "bg-purple-500/20",
          borderColor: "border-purple-500/20",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Left Side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 h-screen overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Back to ShowPass Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300 group backdrop-blur-sm border border-slate-700/30"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to ShowPass</span>
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

              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">
                  {config.title}
                </h1>
                <p className="text-gray-400 mb-6">{config.message}</p>

                {/* Verification Form - Only show when in initial state */}
                {status === "initial" && (
                  <form onSubmit={handleVerification} className="space-y-4">
                    {/* Email Input (if not provided via URL) */}
                    {!email && (
                      <div className="text-left">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    )}

                    {/* Verification Code Input */}
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          setVerificationCode(value);
                        }}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the 6-digit code sent to your email
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={verificationCode.length !== 6}
                      className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Verify Email
                    </button>

                    {/* Resend Code Button */}
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-400 mb-2">
                        Didn't receive the code?
                      </p>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending || !email}
                        className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Resend Code
                          </>
                        )}
                      </button>
                      {resendSuccess && (
                        <p className="text-green-400 text-xs mt-1">
                          New code sent successfully!
                        </p>
                      )}
                    </div>
                  </form>
                )}

                {/* Success State */}
                {status === "success" && (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-green-400 font-medium mb-2">
                        What's Next?
                      </p>
                      <ul className="text-sm text-gray-400 space-y-1 text-left">
                        <li>• Complete your profile setup</li>
                        <li>• Start discovering amazing events</li>
                        <li>• Create your first event (organizers)</li>
                      </ul>
                    </div>

                    <div className="text-sm text-gray-400">
                      Redirecting to home in{" "}
                      <span className="text-pink-400 font-semibold">
                        {countdown}
                      </span>{" "}
                      seconds...
                    </div>

                    <button
                      onClick={() => router.push("/")}
                      className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                    >
                      <span className="flex items-center gap-2 text-sm justify-center">
                        Continue to Home
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                )}

                {/* Error State */}
                {status === "error" && (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setStatus("initial");
                        setVerificationCode("");
                      }}
                      className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                    >
                      Try Again
                    </button>
                    <Link
                      href="/auth/signin"
                      className="w-full h-10 text-white border border-slate-600 hover:bg-slate-700 rounded-lg transition-all duration-300 text-sm flex items-center justify-center"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                )}

                {/* Loading State */}
                {status === "loading" && (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      This may take a few moments...
                    </p>
                  </div>
                )}
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
              src={images[currentImageIndex]}
              alt="ShowPass Verification"
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
              key={status}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-3xl font-bold mb-2">
                {status === "success"
                  ? "Welcome to ShowPass!"
                  : "Almost There!"}
              </h3>
              <p className="text-gray-300 text-lg">
                {status === "success"
                  ? "You're all set! Start creating amazing event experiences."
                  : "Just one more step to complete your email verification."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
