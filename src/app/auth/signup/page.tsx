"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Phone,
  Ticket,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  UserCheck,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
    title: "Create Amazing Events",
    description: "Start organizing memorable experiences for your audience",
  },
  {
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    title: "Sell Tickets Easily",
    description:
      "Streamlined ticketing process that converts visitors to attendees",
  },
  {
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
    title: "Track Your Success",
    description: "Comprehensive analytics to measure event performance",
  },
  {
    url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    title: "Build Communities",
    description: "Connect with your audience and grow your following",
  },
  {
    url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
    title: "Global Reach",
    description: "Expand your events to audiences worldwide",
  },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: "user" | "organizer" | "";
}

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accountType: "",
  });

  const { register, isLoading, error, setError, user, token } = useAuthStore();
  const router = useRouter();

  const totalSteps = 3;

  // Auto-slide images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (user && token) {
      router.replace("/");
    }
  }, [user, token, router]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.accountType
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.accountType === "organizer" && !formData.phone) {
      setError("Phone number is required for organizers");
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.accountType as "user" | "organizer",
        ...(formData.phone && { phone: formData.phone }),
      };

      await register(userData);
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      console.error("Registration failed:", error);
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.accountType !== "";
      case 2:
        // Phone is only required for organizers
        const phoneRequired =
          formData.accountType === "organizer" ? formData.phone : true;
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          phoneRequired
        );
      case 3:
        return (
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        );
      default:
        return false;
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Left Side - Image Slideshow (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Multi-Step Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 h-screen overflow-y-auto">
        <div className="w-full max-w-md mx-auto slide-in-right">
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
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    ShowPass
                  </span>
                </div>
              </div>
              {/* Step 1: Account Type */}
              {currentStep === 1 && (
                <div key="step1" className="slide-step">
                  <h1 className="text-2xl font-bold text-white mb-2 text-center">
                    Join ShowPass
                  </h1>
                  <p className="text-gray-400 mb-6 text-center">
                    Choose your account type to get started
                  </p>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 fade-in-up">
                      <p className="text-red-400 text-sm text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => handleInputChange("accountType", "user")}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.accountType === "user"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.accountType === "user"
                              ? "bg-purple-500"
                              : "bg-slate-700"
                          }`}
                        >
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white">
                            Event Attendee
                          </h3>
                          <p className="text-gray-400 text-xs">
                            Discover and attend amazing events
                          </p>
                        </div>
                        {formData.accountType === "user" && (
                          <Check className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleInputChange("accountType", "organizer")
                      }
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.accountType === "organizer"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.accountType === "organizer"
                              ? "bg-purple-500"
                              : "bg-slate-700"
                          }`}
                        >
                          <Building className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white">
                            Event Organizer
                          </h3>
                          <p className="text-gray-400 text-xs">
                            Create and manage your own events
                          </p>
                        </div>
                        {formData.accountType === "organizer" && (
                          <Check className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div key="step2" className="slide-step">
                  <h1 className="text-2xl font-bold text-white mb-2 text-center">
                    Personal Information
                  </h1>
                  <p className="text-gray-400 mb-6 text-center">
                    Tell us a bit about yourself
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-300">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-300">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="pl-9 h-10 w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-300">
                        Phone Number{" "}
                        {formData.accountType === "organizer"
                          ? "*"
                          : "(Optional)"}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          placeholder="+234 801 234 5678"
                          value={formData.phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="pl-9 h-10 w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Security */}
              {currentStep === 3 && (
                <div key="step3" className="slide-step">
                  <h1 className="text-2xl font-bold text-white mb-2 text-center">
                    Secure Your Account
                  </h1>
                  <p className="text-gray-400 mb-6 text-center">
                    Create a strong password to protect your account
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="password"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("password", e.target.value)
                          }
                          className="pl-9 h-10 w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className="pl-9 h-10 w-full bg-slate-700/50 border border-slate-600 text-white placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm px-3 py-2"
                        />
                      </div>
                      {formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <p className="text-red-400 text-xs mt-1">
                            Passwords don&apos;t match
                          </p>
                        )}
                    </div>

                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <h4 className="text-white font-medium mb-2 text-xs">
                        Password Requirements:
                      </h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              formData.password.length >= 8
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          />
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[A-Z]/.test(formData.password)
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          />
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[0-9]/.test(formData.password)
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          />
                          One number
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6 px-0">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 h-10 text-white border border-slate-600 hover:bg-slate-700 rounded-lg transition-all duration-300 flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="text-sm">Back</span>
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className="flex-1 h-10 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <span className="text-sm">Continue</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStepValid() || isLoading}
                    className="flex-1 h-10 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <span className="text-sm">
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </span>
                    {!isLoading && <Check className="h-4 w-4 ml-1" />}
                  </button>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
