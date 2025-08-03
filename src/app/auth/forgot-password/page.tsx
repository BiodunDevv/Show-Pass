"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
    title: "We've Got You Covered",
    description: "Reset your password and get back to discovering events",
  },
  {
    url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    title: "Quick Recovery",
    description: "Get back to your favorite events in minutes",
  },
  {
    url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop",
    title: "Secure Process",
    description: "Your account security is our top priority",
  },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-lg">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">
                  Check Your Email
                </h1>
                <p className="text-gray-300 mb-6">
                  We've sent a password reset link to{" "}
                  <span className="text-pink-400 font-medium">{email}</span>
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  Don't see the email? Check your spam folder or try again.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/auth/signin"
                    className="block w-full text-center text-xs text-gray-400 hover:text-pink-300 transition-colors"
                  >
                    Back to Sign In
                  </Link>
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
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentImageIndex].url}
                alt={heroImages[currentImageIndex].title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/60 to-slate-900/80" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">ShowPass</span>
              </Link>
            </div>

            <div className="space-y-6">
              <motion.h1
                key={`title-${currentImageIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl font-bold leading-tight"
              >
                {heroImages[currentImageIndex].title}
              </motion.h1>
              <motion.p
                key={`desc-${currentImageIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl text-gray-200"
              >
                {heroImages[currentImageIndex].description}
              </motion.p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-8"
                        : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevImage}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
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
          {/* Back to Sign In Button */}
          <div className="mb-6 fade-in-up">
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
              <div className="flex justify-center mb-6 fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    ShowPass
                  </span>
                </div>
              </div>

              <div className="fade-in-down">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">
                  Forgot Password?
                </h1>
                <p className="text-gray-400 mb-6 text-center">
                  No worries! Enter your email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-xs font-medium text-gray-300 block"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 h-10 bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="text-sm">Sending...</span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm justify-center">
                        Send Reset
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
        {/* CSS animations */}
        <style jsx>{`
          @keyframes fadeSlide {
            0% {
              opacity: 0;
              transform: scale(1.1);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes slideUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .image-container {
            animation: fadeSlide 1s ease-out;
          }

          .text-slide-up {
            animation: slideUp 0.8s ease-out 0.2s both;
          }
        `}</style>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 image-container"
          >
            <Image
              src={heroImages[currentImageIndex].url}
              alt={heroImages[currentImageIndex].title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-purple-900/40 to-pink-900/60" />
          </motion.div>
        </AnimatePresence>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          {/* Top - Logo */}
          <div className="text-slide-up">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Ticket className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">
                ShowPass
              </span>
            </Link>
          </div>

          {/* Center - Dynamic Content */}
          <motion.div
            key={`content-${currentImageIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {heroImages[currentImageIndex].title}
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed max-w-md">
              {heroImages[currentImageIndex].description}
            </p>
          </motion.div>

          {/* Bottom - Navigation */}
          <div className="flex items-center justify-between text-slide-up">
            {/* Dots */}
            <div className="flex space-x-3">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentImageIndex
                      ? "bg-white w-10 h-3"
                      : "bg-white/40 w-3 h-3 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex space-x-3">
              <button
                onClick={prevImage}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={nextImage}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
