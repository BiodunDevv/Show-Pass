"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&h=600&fit=crop",
    title: "Almost There!",
    description: "Just one more step to join the ShowPass community",
  },
  {
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
    title: "Secure Verification",
    description: "We protect your account with email verification",
  },
  {
    url: "https://images.unsplash.com/photo-1555981815-af7a70ec1d20?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGdldCUyMHN0YXJ0ZWR8ZW58MHwyfDB8fHww",
    title: "Get Started",
    description: "Create amazing events after verification",
  },
];

export default function VerifyEmailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  const { resendVerification, user, isLoading, error, setError } =
    useAuthStore();

  // Auto-slide images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleResendEmail = async () => {
    setError(null);

    if (!user?.email) {
      setError("No email address found. Please sign up again.");
      return;
    }

    try {
      await resendVerification(user.email);
      setResendCount((prev) => prev + 1);
      setCooldownTime(60); // 60 second cooldown
    } catch (error) {
      console.error("Failed to resend email:", error);
      // Error is already set in the store
    }
  };

  const canResend = cooldownTime === 0 && resendCount < 3;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 h-screen overflow-y-auto">
        <style jsx>{`
          @keyframes slideInLeft {
            0% {
              opacity: 0;
              transform: translateX(-50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInDown {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .slide-in-left {
            animation: slideInLeft 0.6s ease-out;
          }

          .fade-in-up {
            animation: fadeInUp 0.4s ease-out 0.1s both;
          }

          .fade-in-down {
            animation: fadeInDown 0.4s ease-out 0.3s both;
          }
        `}</style>

        <div className="w-full max-w-md mx-auto slide-in-left">
          {/* Back to ShowPass Button */}
          <div className="mb-6 fade-in-up">
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
              <div className="flex justify-center mb-6 fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    ShowPass
                  </span>
                </div>
              </div>

              <div className="fade-in-down text-center">
                <h1 className="text-2xl font-bold text-white mb-4">
                  Check Your Email
                </h1>
                <p className="text-gray-400 mb-6">
                  We&apos;ve sent a verification link to your email address. Click
                  the link in the email to verify your account and get started.
                </p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 fade-in-up">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Status Messages */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-blue-400 font-medium">Email Sent</p>
                      <p className="text-gray-400 text-sm">
                        Check your inbox and spam folder
                      </p>
                    </div>
                  </div>

                  {resendCount > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-green-400 font-medium">
                          Email Resent
                        </p>
                        <p className="text-gray-400 text-sm">
                          Check your inbox again
                        </p>
                      </div>
                    </div>
                  )}

                  {resendCount >= 3 && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-yellow-400 font-medium">
                          Maximum Attempts Reached
                        </p>
                        <p className="text-gray-400 text-sm">
                          Please contact support if you need help
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={!canResend || isLoading}
                    className="w-full h-10 text-white border border-slate-600 hover:bg-slate-700 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border-2 border-gray-400/20 border-t-gray-400 rounded-full animate-spin" />
                        Resending...
                      </span>
                    ) : cooldownTime > 0 ? (
                      <span className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        Resend in {cooldownTime}s
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm">
                        <RefreshCw className="h-4 w-4" />
                        Resend Verification Email
                      </span>
                    )}
                  </button>

                  <Link
                    href="/"
                    className="w-full h-10 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group flex items-center justify-center"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      Continue to Home
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>

                {/* Help Text */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <p className="text-xs text-gray-400">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <Link
                      href="/contact"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      contact support
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

        {/* Navigation Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <ArrowRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentImageIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
