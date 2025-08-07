"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Plus,
  X,
  DollarSign,
  Users,
  Tag,
  FileText,
  Image as ImageIcon,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Upload,
  Trash2,
  ExternalLink,
  Navigation,
  Loader2,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/useAuthStore";
import { useEventStore } from "@/store/useEventStore";
import { uploadToCloudinary, validateFile } from "@/lib/cloudinary";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description: string;
  benefits: string[];
  isFree: boolean;
}

interface Venue {
  name: string;
  address: string;
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface EventFormData {
  title: string;
  description: string;
  category: string;
  venue: Venue;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  ticketTypes: TicketType[];
  images: string[];
  tags: string[];
  maxAttendees: number;
  isPublic: boolean;
}

const predefinedTicketTypes = [
  "VIP",
  "Regular",
  "Premium",
  "Standard",
  "Early Bird",
  "Free",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { createEvent, categories, fetchEventCategories, isLoading } =
    useEventStore();

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category: "",
    venue: {
      name: "",
      address: "",
      city: "",
      state: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    ticketTypes: [],
    images: [],
    tags: [],
    maxAttendees: 0,
    isPublic: true,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [locationValidated, setLocationValidated] = useState(false);

  // Redirect if not organizer
  useEffect(() => {
    if (!user || !token) {
      router.push("/auth/signin");
      return;
    }
    if (user.role !== "organizer") {
      router.push("/events");
      return;
    }
    fetchEventCategories();
  }, [user, token, router, fetchEventCategories]);

  // Update ticket types when event type changes
  useEffect(() => {
    if (formData.ticketTypes.length > 0) {
      setFormData((prev) => ({
        ...prev,
        ticketTypes: prev.ticketTypes.map((ticket) => ({
          ...ticket,
          price: isFreeEvent ? 0 : ticket.price,
          isFree: isFreeEvent,
        })),
      }));
    }
  }, [isFreeEvent]);

  // Calculate max attendees when ticket types change
  useEffect(() => {
    const totalQuantity = formData.ticketTypes.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    );
    setFormData((prev) => ({ ...prev, maxAttendees: totalQuantity }));
  }, [formData.ticketTypes]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EventFormData] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      name: "Regular",
      price: isFreeEvent ? 0 : 10000,
      quantity: 100,
      description: "",
      benefits: [],
      isFree: isFreeEvent,
    };
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicket],
    }));
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket
      ),
    }));
  };

  const removeTicketType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const addBenefit = (ticketIndex: number, benefit: string) => {
    if (benefit.trim()) {
      updateTicketType(ticketIndex, "benefits", [
        ...formData.ticketTypes[ticketIndex].benefits,
        benefit.trim(),
      ]);
    }
  };

  const removeBenefit = (ticketIndex: number, benefitIndex: number) => {
    updateTicketType(
      ticketIndex,
      "benefits",
      formData.ticketTypes[ticketIndex].benefits.filter(
        (_, i) => i !== benefitIndex
      )
    );
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      if (!formData.images.includes(imageUrl)) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = "";
  };

  const removeImage = (imageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageToRemove),
    }));
  };

  const validateCoordinates = async (lat: number, lng: number) => {
    // Check if coordinates are provided and not zero
    if (!lat || !lng || lat === 0 || lng === 0) {
      toast.error(
        "Please enter valid coordinates (both latitude and longitude must be non-zero)"
      );
      return false;
    }

    // Check if coordinates are within valid ranges
    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90 degrees");
      return false;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180 degrees");
      return false;
    }

    // Basic coordinate validation for Nigeria (approximate bounds)
    if (lat < 4 || lat > 14 || lng < 2.5 || lng > 15) {
      toast.warning(
        "Coordinates seem to be outside Nigeria. Please verify they are correct."
      );
    }

    setIsValidatingLocation(true);
    try {
      // Use reverse geocoding to validate coordinates
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=demo&limit=1`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0];
          toast.success(`Location found: ${location.formatted}`);
          setLocationValidated(true);
          return true;
        }
      }

      // Fallback validation - just check if coordinates are reasonable
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setLocationValidated(true);
        toast.info("Coordinates appear valid");
        return true;
      }

      toast.error("Invalid coordinates. Please check and try again.");
      setLocationValidated(false);
      return false;
    } catch (error) {
      console.error("Coordinate validation error:", error);
      // Don't block the user if validation service fails
      setLocationValidated(true);
      toast.info(
        "Could not validate coordinates online, but they appear valid"
      );
      return true;
    } finally {
      setIsValidatingLocation(false);
    }
  };

  const openGoogleMaps = () => {
    const { latitude, longitude } = formData.venue.coordinates;

    // If coordinates are available, use them for more precise location
    if (latitude && longitude && latitude !== 0 && longitude !== 0) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(googleMapsUrl, "_blank");
      return;
    }

    // Fallback to address search if coordinates are not available
    if (!formData.venue.address.trim() && !formData.venue.city.trim()) {
      toast.error(
        "Please enter venue address and city first, or provide coordinates"
      );
      return;
    }

    const addressParts = [
      formData.venue.name,
      formData.venue.address,
      formData.venue.city,
      formData.venue.state,
    ].filter((part) => part && part.trim());

    if (addressParts.length === 0) {
      toast.error("Please enter venue details first");
      return;
    }

    const address = addressParts.join(", ");
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/${encodedAddress}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleCoordinateChange = (
    field: "latitude" | "longitude",
    value: string
  ) => {
    // Allow empty string for clearing the field
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        venue: {
          ...prev.venue,
          coordinates: {
            ...prev.venue.coordinates,
            [field]: 0,
          },
        },
      }));
      setLocationValidated(false);
      return;
    }

    const numValue = parseFloat(value);

    // Check if the parsed value is a valid number
    if (isNaN(numValue)) {
      return; // Don't update if invalid number
    }

    const currentValue = formData.venue.coordinates[field];

    // If coordinates change significantly, reset validation
    if (Math.abs(currentValue - numValue) > 0.001) {
      setLocationValidated(false);
    }

    setFormData((prev) => ({
      ...prev,
      venue: {
        ...prev.venue,
        coordinates: {
          ...prev.venue.coordinates,
          [field]: numValue,
        },
      },
    }));

    // Clear coordinate errors when user starts typing
    if (errors[`venue.coordinates.${field}`]) {
      setErrors((prev) => ({ ...prev, [`venue.coordinates.${field}`]: "" }));
    }
  };

  const handleValidateLocation = () => {
    const { latitude, longitude } = formData.venue.coordinates;
    validateCoordinates(latitude, longitude);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (step === 2) {
      if (!formData.venue.name.trim())
        newErrors["venue.name"] = "Venue name is required";
      if (!formData.venue.address.trim())
        newErrors["venue.address"] = "Address is required";
      if (!formData.venue.city.trim())
        newErrors["venue.city"] = "City is required";
      if (!formData.venue.state.trim())
        newErrors["venue.state"] = "State is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (!formData.startTime) newErrors.startTime = "Start time is required";
      if (!formData.endTime) newErrors.endTime = "End time is required";

      // Coordinate validation
      if (
        !formData.venue.coordinates.latitude ||
        formData.venue.coordinates.latitude === 0
      ) {
        newErrors["venue.coordinates.latitude"] = "Latitude is required";
      } else if (
        formData.venue.coordinates.latitude < -90 ||
        formData.venue.coordinates.latitude > 90
      ) {
        newErrors["venue.coordinates.latitude"] =
          "Latitude must be between -90 and 90";
      }

      if (
        !formData.venue.coordinates.longitude ||
        formData.venue.coordinates.longitude === 0
      ) {
        newErrors["venue.coordinates.longitude"] = "Longitude is required";
      } else if (
        formData.venue.coordinates.longitude < -180 ||
        formData.venue.coordinates.longitude > 180
      ) {
        newErrors["venue.coordinates.longitude"] =
          "Longitude must be between -180 and 180";
      }
    }

    if (step === 3) {
      if (formData.ticketTypes.length === 0) {
        newErrors.ticketTypes = "At least one ticket type is required";
      } else {
        // Validate each ticket type
        formData.ticketTypes.forEach((ticket, index) => {
          if (!ticket.name.trim()) {
            newErrors[`ticketType.${index}.name`] = "Ticket name is required";
          }
          if (ticket.quantity <= 0) {
            newErrors[`ticketType.${index}.quantity`] =
              "Quantity must be greater than 0";
          }
          if (!isFreeEvent && ticket.price <= 0) {
            newErrors[`ticketType.${index}.price`] =
              "Price must be greater than 0 for paid events";
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Format the event data according to the expected backend structure
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        venue: {
          name: formData.venue.name,
          address: formData.venue.address,
          city: formData.venue.city,
          state: formData.venue.state,
          coordinates: {
            latitude: formData.venue.coordinates.latitude,
            longitude: formData.venue.coordinates.longitude,
          },
        },
        startDate: new Date(
          `${formData.startDate}T${formData.startTime}:00`
        ).toISOString(),
        endDate: new Date(
          `${formData.endDate}T${formData.endTime}:00`
        ).toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        ticketTypes: formData.ticketTypes.map((ticket) => ({
          name: ticket.name,
          price: isFreeEvent ? 0 : ticket.price,
          quantity: ticket.quantity,
          description: ticket.description || "",
          benefits:
            ticket.benefits && ticket.benefits.length > 0
              ? ticket.benefits
              : [],
          isFree: isFreeEvent,
        })),
        images:
          formData.images && formData.images.length > 0 ? formData.images : [],
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
        maxAttendees: formData.maxAttendees,
        isPublic: formData.isPublic,
      };

      console.log("Submitting event data:", eventData);
      await createEvent(eventData);
      toast.success("Event created successfully!");
      setSuccessMessage("Event created successfully!");
      setTimeout(() => {
        router.push("/events/my-events");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to create event:", error);

      // Extract more detailed error information
      let errorMessage = "Failed to create event. Please try again.";
      if (error.message) {
        if (error.message.includes("401")) {
          errorMessage = "Authentication failed. Please sign in again.";
        } else if (
          error.message.includes("400") ||
          error.message.includes("Validation")
        ) {
          errorMessage = "Please check all required fields and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", description: "Event details" },
    { number: 2, title: "Location & Time", description: "When and where" },
    { number: 3, title: "Tickets", description: "Pricing & types" },
    { number: 4, title: "Review", description: "Final details" },
  ];

  if (!user || user.role !== "organizer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background Effects - matching events page */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Header section - matching events page style */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            {/* Back navigation */}
            <div className="flex items-start justify-start mb-4 sm:mb-6">
              <Link
                href="/my-event"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-sm sm:text-base">Back to My Events</span>
              </Link>
            </div>

            {/* Title section */}
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/30 text-xs sm:text-sm text-purple-300 backdrop-blur-sm">
              <Calendar
                size={14}
                className="mr-1.5 sm:mr-2"
                fill="currentColor"
              />
              Create Your Event
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-2">
              Create New Event
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed px-4">
              Fill in the details below to create an amazing event that your
              audience will love
            </p>
          </motion.div>

          {/* Event Type Toggle - Enhanced responsive design */}
          <motion.div
            className="flex justify-center mb-6 sm:mb-8 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-1 p-1 bg-[#1E2132]/80 backdrop-blur-sm border border-[#2E313C] rounded-xl w-full max-w-md sm:w-auto">
              <button
                onClick={() => setIsFreeEvent(false)}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base flex-1 sm:flex-initial ${
                  !isFreeEvent
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                }`}
              >
                <DollarSign size={16} />
                <span className="whitespace-nowrap">Paid Event</span>
              </button>
              <button
                onClick={() => setIsFreeEvent(true)}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base flex-1 sm:flex-initial ${
                  isFreeEvent
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                }`}
              >
                <Users size={16} />
                <span className="whitespace-nowrap">Free Event</span>
              </button>
            </div>
          </motion.div>

          {/* Progress Steps - Fully responsive */}
          <motion.div
            className="mb-6 sm:mb-8 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Mobile: Compact horizontal scroll */}
            <div className="block sm:hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="flex items-center flex-shrink-0"
                  >
                    <div className="text-center min-w-[60px]">
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                            : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle size={14} />
                        ) : (
                          step.number
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400 truncate">
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-6 mx-2 flex-shrink-0 transition-colors ${
                          currentStep > step.number
                            ? "bg-purple-600"
                            : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet: Medium layout */}
            <div className="hidden sm:block lg:hidden">
              <div className="flex items-center justify-center overflow-x-auto">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="flex items-center flex-shrink-0"
                  >
                    <div className="text-center max-w-[120px]">
                      <div
                        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-900/20"
                            : "border-slate-600 text-slate-400 bg-slate-800/30"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle size={18} />
                        ) : (
                          <span className="font-medium text-sm">
                            {step.number}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div
                          className={`text-sm font-medium transition-colors ${
                            currentStep >= step.number
                              ? "text-white"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-12 mx-3 transition-colors ${
                          currentStep > step.number
                            ? "bg-purple-600"
                            : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Full layout */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-center overflow-x-auto">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="flex items-center flex-shrink-0"
                  >
                    <div className="text-center max-w-[160px]">
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          currentStep >= step.number
                            ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-900/20"
                            : "border-slate-600 text-slate-400 bg-slate-800/30"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle size={20} />
                        ) : (
                          <span className="font-medium">{step.number}</span>
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <div
                          className={`text-sm font-medium transition-colors ${
                            currentStep >= step.number
                              ? "text-white"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 leading-tight">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-16 xl:w-24 mx-4 transition-colors ${
                          currentStep > step.number
                            ? "bg-purple-600"
                            : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form Content - Fully responsive design */}
          <motion.div
            className="bg-[#1E2132]/80 backdrop-blur-sm border border-[#2E313C] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl mx-2 sm:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Event Details
                      </h2>
                      <p className="text-slate-400 text-sm sm:text-base">
                        Tell us about your event
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            handleInputChange("title", e.target.value)
                          }
                          placeholder="Enter your event title"
                          className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                            errors.title
                              ? "border-red-500"
                              : "border-slate-600/50"
                          }`}
                        />
                        {errors.title && (
                          <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.title}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          placeholder="Describe your event in detail"
                          rows={6}
                          className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all duration-300 text-sm sm:text-base ${
                            errors.description
                              ? "border-red-500"
                              : "border-slate-600/50"
                          }`}
                        />
                        {errors.description && (
                          <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange("category", e.target.value)
                          }
                          className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                            errors.category
                              ? "border-red-500"
                              : "border-slate-600/50"
                          }`}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location & Time */}
                {currentStep === 2 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Location & Schedule
                      </h2>
                      <p className="text-slate-400 text-sm sm:text-base">
                        When and where will your event take place?
                      </p>
                    </div>

                    {/* Venue Information */}
                    <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-purple-400" />
                        Venue Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            Venue Name *
                          </label>
                          <input
                            type="text"
                            value={formData.venue.name}
                            onChange={(e) =>
                              handleInputChange("venue.name", e.target.value)
                            }
                            placeholder="Enter venue name"
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors["venue.name"]
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors["venue.name"] && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors["venue.name"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            Address *
                          </label>
                          <input
                            type="text"
                            value={formData.venue.address}
                            onChange={(e) =>
                              handleInputChange("venue.address", e.target.value)
                            }
                            placeholder="Enter address"
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors["venue.address"]
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors["venue.address"] && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors["venue.address"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            City *
                          </label>
                          <input
                            type="text"
                            value={formData.venue.city}
                            onChange={(e) =>
                              handleInputChange("venue.city", e.target.value)
                            }
                            placeholder="Enter city"
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors["venue.city"]
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors["venue.city"] && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors["venue.city"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            State *
                          </label>
                          <input
                            type="text"
                            value={formData.venue.state}
                            onChange={(e) =>
                              handleInputChange("venue.state", e.target.value)
                            }
                            placeholder="Enter state"
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors["venue.state"]
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors["venue.state"] && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors["venue.state"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coordinates Section - Enhanced design */}
                    <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-1 flex items-center gap-2">
                            <Navigation size={18} className="text-green-400" />
                            Venue Coordinates
                          </h3>
                          <p className="text-sm text-slate-400">
                            Get precise coordinates from Google Maps for
                            accurate location
                          </p>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={openGoogleMaps}
                            disabled={
                              (!formData.venue.coordinates.latitude ||
                                formData.venue.coordinates.latitude === 0) &&
                              (!formData.venue.coordinates.longitude ||
                                formData.venue.coordinates.longitude === 0) &&
                              !formData.venue.address.trim() &&
                              !formData.venue.city.trim()
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                            title={
                              (formData.venue.coordinates.latitude &&
                                formData.venue.coordinates.latitude !== 0) ||
                              (formData.venue.coordinates.longitude &&
                                formData.venue.coordinates.longitude !== 0)
                                ? "Open Google Maps at the specified coordinates"
                                : formData.venue.address.trim() ||
                                  formData.venue.city.trim()
                                ? "Open Google Maps to search for the venue address"
                                : "Please enter coordinates or venue address/city first"
                            }
                          >
                            <ExternalLink size={16} />
                            Open in Maps
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            Latitude *
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={
                              formData.venue.coordinates.latitude === 0
                                ? ""
                                : formData.venue.coordinates.latitude
                            }
                            onChange={(e) =>
                              handleCoordinateChange("latitude", e.target.value)
                            }
                            placeholder="e.g. 6.5244"
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors["venue.coordinates.latitude"]
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors["venue.coordinates.latitude"] && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors["venue.coordinates.latitude"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            Longitude *
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={
                              formData.venue.coordinates.longitude === 0
                                ? ""
                                : formData.venue.coordinates.longitude
                            }
                            onChange={(e) =>
                              handleCoordinateChange(
                                "longitude",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 3.3792"
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors["venue.coordinates.longitude"]
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors["venue.coordinates.longitude"] && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors["venue.coordinates.longitude"]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Coordinate validation and help */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={handleValidateLocation}
                            disabled={
                              isValidatingLocation ||
                              !formData.venue.coordinates.latitude ||
                              !formData.venue.coordinates.longitude ||
                              formData.venue.coordinates.latitude === 0 ||
                              formData.venue.coordinates.longitude === 0
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-lg transition-colors text-sm"
                          >
                            {isValidatingLocation ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Navigation size={16} />
                            )}
                            {isValidatingLocation
                              ? "Validating..."
                              : "Validate Location"}
                          </button>

                          {locationValidated && (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                              <CheckCircle size={16} />
                              Location validated
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Help text */}
                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">
                          How to get coordinates from Google Maps:
                        </h4>
                        <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
                          <li>Click "Open in Maps" to search for your venue</li>
                          <li>Right-click on the exact location</li>
                          <li>
                            Copy the coordinates (first number is latitude,
                            second is longitude)
                          </li>
                          <li>Paste them into the fields above</li>
                          <li>Click "Validate Location" to confirm</li>
                        </ol>
                      </div>
                    </div>

                    {/* Date and Time Section - Enhanced design */}
                    <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-400" />
                        Event Schedule
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              handleInputChange("startDate", e.target.value)
                            }
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors.startDate
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors.startDate && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.startDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            End Date *
                          </label>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                              handleInputChange("endDate", e.target.value)
                            }
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors.endDate
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors.endDate && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.endDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) =>
                              handleInputChange("startTime", e.target.value)
                            }
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors.startTime
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors.startTime && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.startTime}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                            End Time *
                          </label>
                          <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) =>
                              handleInputChange("endTime", e.target.value)
                            }
                            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                              errors.endTime
                                ? "border-red-500"
                                : "border-slate-600/50"
                            }`}
                          />
                          {errors.endTime && (
                            <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.endTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Tickets */}
                {currentStep === 3 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                            Ticket Types
                          </h2>
                          <p className="text-slate-400 text-sm sm:text-base">
                            Set up your ticket pricing and availability
                          </p>
                        </div>
                        <button
                          onClick={addTicketType}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20 text-sm sm:text-base"
                        >
                          <Plus size={16} />
                          Add Ticket
                        </button>
                      </div>
                    </div>

                    {errors.ticketTypes && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-400" size={20} />
                        <p className="text-red-400 text-sm">
                          {errors.ticketTypes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {formData.ticketTypes.map((ticket, index) => (
                        <div
                          key={index}
                          className="bg-slate-700/20 border border-slate-600/30 rounded-xl p-4 sm:p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                              <Ticket size={18} className="text-purple-400" />
                              Ticket Type {index + 1}
                            </h3>
                            <button
                              onClick={() => removeTicketType(index)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                                Name
                              </label>
                              <select
                                value={ticket.name}
                                onChange={(e) =>
                                  updateTicketType(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base"
                              >
                                {predefinedTicketTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                                Price (₦)
                              </label>
                              <input
                                type="number"
                                value={ticket.price}
                                onChange={(e) =>
                                  updateTicketType(
                                    index,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                                disabled={isFreeEvent}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-300 text-sm sm:text-base"
                              />
                            </div>

                            <div>
                              <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={ticket.quantity}
                                onChange={(e) =>
                                  updateTicketType(
                                    index,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base"
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                              Description
                            </label>
                            <textarea
                              value={ticket.description}
                              onChange={(e) =>
                                updateTicketType(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Describe this ticket type"
                              rows={3}
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all duration-300 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                              Benefits
                            </label>
                            <div className="space-y-2">
                              {ticket.benefits.map((benefit, benefitIndex) => (
                                <div
                                  key={benefitIndex}
                                  className="flex items-center gap-2 p-2 bg-slate-600/20 rounded-lg"
                                >
                                  <span className="flex-1 text-slate-300 text-sm">
                                    {benefit}
                                  </span>
                                  <button
                                    onClick={() =>
                                      removeBenefit(index, benefitIndex)
                                    }
                                    className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a benefit"
                                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm"
                                  id={`benefit-input-${index}`}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      const target =
                                        e.target as HTMLInputElement;
                                      if (target.value.trim()) {
                                        addBenefit(index, target.value);
                                        target.value = "";
                                      }
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `benefit-input-${index}`
                                    ) as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      addBenefit(index, input.value);
                                      input.value = "";
                                    }
                                  }}
                                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.ticketTypes.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-slate-600/50 rounded-xl bg-slate-700/10">
                        <Users
                          className="mx-auto mb-4 text-slate-400"
                          size={48}
                        />
                        <p className="text-slate-400 mb-4 text-sm sm:text-base">
                          No ticket types added yet
                        </p>
                        <button
                          onClick={addTicketType}
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20 text-sm sm:text-base"
                        >
                          Add Your First Ticket Type
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Review & Additional Details
                      </h2>
                      <p className="text-slate-400 text-sm sm:text-base">
                        Add final touches and review your event
                      </p>
                    </div>

                    {/* Tags Section - Enhanced design */}
                    <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Tag size={18} className="text-yellow-400" />
                        Event Tags
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-white transition-colors ml-1"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <button
                          onClick={addTag}
                          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Images Section - Enhanced design */}
                    <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <ImageIcon size={18} className="text-blue-400" />
                        Event Images
                      </h3>

                      {/* Image previews */}
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                          {formData.images.map((image, index) => (
                            <div
                              key={index}
                              className="relative group aspect-square bg-slate-700/50 rounded-lg sm:rounded-xl overflow-hidden border border-slate-600/30"
                            >
                              <img
                                src={image}
                                alt={`Event image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                              <div className="hidden items-center justify-center h-full">
                                <ImageIcon
                                  className="text-slate-400"
                                  size={32}
                                />
                              </div>
                              <button
                                onClick={() => removeImage(image)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload options */}
                      <div className="space-y-4">
                        {/* File upload */}
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">
                            Upload from device
                          </label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className={`flex items-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 text-sm sm:text-base ${
                                isUploadingImage
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <Upload size={16} />
                              {isUploadingImage
                                ? "Uploading..."
                                : "Choose Image"}
                            </label>
                            <span className="text-xs sm:text-sm text-slate-400">
                              JPG, PNG up to 10MB
                            </span>
                          </div>
                        </div>

                        {/* URL input */}
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">
                            Or add image URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addImage();
                                }
                              }}
                            />
                            <button
                              onClick={addImage}
                              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Summary - Enhanced design */}
                    <div className="bg-slate-700/20 border border-slate-600/30 rounded-xl p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                          <Eye size={18} className="text-green-400" />
                          Event Summary
                        </h3>
                        {formData.venue.coordinates.latitude &&
                          formData.venue.coordinates.longitude && (
                            <button
                              type="button"
                              onClick={() => {
                                const { latitude, longitude } =
                                  formData.venue.coordinates;
                                window.open(
                                  `https://www.google.com/maps?q=${latitude},${longitude}`,
                                  "_blank"
                                );
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                            >
                              <MapPin size={14} />
                              View Location
                            </button>
                          )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                        <div className="p-3 bg-slate-600/20 rounded-lg">
                          <span className="text-slate-400 text-xs uppercase tracking-wide">
                            Title
                          </span>
                          <p className="text-white font-medium mt-1">
                            {formData.title || "Not set"}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-600/20 rounded-lg">
                          <span className="text-slate-400 text-xs uppercase tracking-wide">
                            Category
                          </span>
                          <p className="text-white font-medium mt-1">
                            {formData.category || "Not set"}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-600/20 rounded-lg">
                          <span className="text-slate-400 text-xs uppercase tracking-wide">
                            Venue
                          </span>
                          <p className="text-white font-medium mt-1">
                            {formData.venue.name || "Not set"}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-600/20 rounded-lg">
                          <span className="text-slate-400 text-xs uppercase tracking-wide">
                            Location
                          </span>
                          <p className="text-white font-medium text-xs mt-1">
                            {formData.venue.coordinates.latitude &&
                            formData.venue.coordinates.longitude
                              ? `${formData.venue.coordinates.latitude.toFixed(
                                  4
                                )}, ${formData.venue.coordinates.longitude.toFixed(
                                  4
                                )}`
                              : "Coordinates not set"}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-600/20 rounded-lg">
                          <span className="text-slate-400 text-xs uppercase tracking-wide">
                            Max Attendees
                          </span>
                          <p className="text-white font-medium mt-1">
                            {formData.maxAttendees}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-600/20 rounded-lg">
                          <span className="text-slate-400 text-xs uppercase tracking-wide">
                            Event Type
                          </span>
                          <p className="text-white font-medium mt-1">
                            {isFreeEvent ? "Free Event" : "Paid Event"}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-600/20 rounded-lg md:col-span-2">
                          <span className="text-slate-400 text-xs uppercase tracking-wide">
                            Schedule
                          </span>
                          <p className="text-white font-medium mt-1">
                            {formData.startDate &&
                            formData.startTime &&
                            formData.endDate &&
                            formData.endTime
                              ? `${formData.startDate} ${formData.startTime} - ${formData.endDate} ${formData.endTime}`
                              : "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-400" size={20} />
                        <p className="text-red-400 text-sm sm:text-base">
                          {errors.submit}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Navigation Buttons - Enhanced responsive design */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8 pt-6 border-t border-slate-700/50">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 disabled:bg-slate-800/30 disabled:text-slate-500 text-white rounded-lg sm:rounded-xl transition-all duration-300 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-1"
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20 text-sm sm:text-base order-1 sm:order-2"
              >
                Next
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-green-900/20 text-sm sm:text-base order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Add scrollbar styles */}
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
