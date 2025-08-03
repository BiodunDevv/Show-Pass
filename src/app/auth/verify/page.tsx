"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

type VerificationStatus = "loading" | "success" | "error" | "expired";

export default function VerifyPage() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [countdown, setCountdown] = useState(5);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    const performVerification = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        console.log("Starting verification with token:", token);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Verification successful");
        setStatus("success");

        // Start countdown for auto-redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              router.push("/auth/signin");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Cleanup timer after 5 seconds
        setTimeout(() => clearInterval(timer), 5000);
      } catch (error: any) {
        console.error("Email verification failed:", error);

        // Check if it's an expired token
        if (
          error.message?.includes("expired") ||
          error.message?.includes("invalid") ||
          error.message?.includes("Token")
        ) {
          setStatus("expired");
        } else {
          setStatus("error");
        }
      }
    };

    performVerification();
  }, [searchParams, router]);

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
      case "expired":
        return {
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
          title: "Verification Link Expired",
          message:
            "This verification link has expired. Please request a new one.",
          bgColor: "bg-yellow-500/20",
          borderColor: "border-yellow-500/20",
        };
      default:
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: "Verification Failed",
          message:
            "We couldn't verify your email. The link may be invalid or expired.",
          bgColor: "bg-red-500/20",
          borderColor: "border-red-500/20",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Panel - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
          alt="Welcome to ShowPass"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/60 to-slate-900/80" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">ShowPass</span>
            </Link>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              {status === "success"
                ? "Welcome to ShowPass!"
                : "Email Verification"}
            </h1>
            <p className="text-xl text-gray-200">
              {status === "success"
                ? "You're all set! Start creating amazing event experiences."
                : "Join thousands of event creators and attendees across Nigeria."}
            </p>
          </div>

          <div className="text-sm text-gray-400">
            <p>© 2025 ShowPass. Secure email verification.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">ShowPass</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl text-center"
          >
            {/* Status Icon */}
            <div
              className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 ${config.borderColor} border`}
            >
              {config.icon}
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              {config.title}
            </h1>
            <p className="text-gray-300 mb-8">{config.message}</p>

            {/* Status-specific content */}
            {status === "success" && (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-medium mb-2">
                    What's Next?
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1 text-left">
                    <li>• Sign in to your account</li>
                    <li>• Complete your profile setup</li>
                    <li>• Start discovering amazing events</li>
                    <li>• Create your first event (organizers)</li>
                  </ul>
                </div>

                <div className="text-sm text-gray-400">
                  Redirecting to sign in in{" "}
                  <span className="text-pink-400 font-semibold">
                    {countdown}
                  </span>{" "}
                  seconds...
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 mt-8">
              {status === "success" && (
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Continue to Sign In
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              {(status === "error" || status === "expired") && (
                <>
                  <Link
                    href="/auth/verify-email"
                    className="block w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] text-center"
                  >
                    Request New Verification
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                  >
                    Back to Sign In
                  </Link>
                </>
              )}

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
                  <p className="text-xs text-gray-400">
                    This may take a few moments...
                  </p>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Need help?{" "}
                <Link
                  href="/contact"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
