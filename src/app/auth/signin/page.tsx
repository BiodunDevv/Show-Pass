"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Ticket,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
    title: "Discover Amazing Events",
    description: "Join thousands of events happening near you",
  },
  {
    url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    title: "Concert Experiences",
    description: "Live music and unforgettable moments",
  },
  {
    url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&h=600&fit=crop",
    title: "Business Networking",
    description: "Connect with professionals and grow your network",
  },
  {
    url: "https://images.unsplash.com/photo-1698581075105-924b6c70b5d6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHRlY2glMjBjb25mZXJlbmNlc3xlbnwwfDJ8MHx8fDA%3D",
    title: "Tech Conferences",
    description: "Stay ahead with the latest technology trends",
  },
  {
    url: "https://plus.unsplash.com/premium_photo-1720012323027-e0672c82bf09?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fEN1bHR1cmFsJTIwZmVzdGl2YWxzfGVufDB8MnwwfHx8MA%3D%3D",
    title: "Cultural Festivals",
    description: "Celebrate diversity and rich cultural heritage",
  },
];

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { login, isLoading, error, setError } = useAuthStore();
  const router = useRouter();

  // Auto-slide images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      // Error is already set in the store
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
          {/* Back to Home Button - Positioned at top */}
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
              {/* Logo - Inside the card */}
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
                  Welcome Back
                </h1>
                <p className="text-gray-400 mb-6 text-center">
                  Sign in to your ShowPass account
                </p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 fade-in-up">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmail(e.target.value)
                        }
                        className="w-full pl-9 h-10 bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium text-gray-300 block"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        className="w-full pl-9 pr-10 h-10 bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-600 rounded transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        ) : (
                          <Eye className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-pink-400 hover:text-pink-300 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="text-sm">Signing in...</span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm justify-center">
                        Sign In
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    Don't have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="text-pink-400 hover:text-pink-300 font-semibold"
                    >
                      Sign up
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

          .image-animate {
            animation: fadeSlide 0.8s ease-out;
          }

          .content-animate {
            animation: slideUp 0.5s ease-out 0.3s both;
          }
        `}</style>

        <div className="absolute inset-0 image-animate">
          <Image
            src={heroImages[currentImageIndex].url}
            alt={heroImages[currentImageIndex].title}
            fill
            className="object-cover"
            priority
            key={currentImageIndex}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        </div>

        {/* Image Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div key={`content-${currentImageIndex}`} className="content-animate">
            <h3 className="text-3xl font-bold mb-2">
              {heroImages[currentImageIndex].title}
            </h3>
            <p className="text-gray-300 text-lg">
              {heroImages[currentImageIndex].description}
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-6 w-6 text-white" />
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
