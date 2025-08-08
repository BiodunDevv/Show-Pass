"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/useAuthStore";
import { useEventStore } from "@/store/useEventStore";
import { uploadToCloudinary, validateFile } from "@/lib/cloudinary";
import ProtectedRoute from "@/components/ProtectedRoute";
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
  Edit,
  History,
  Bell,
  AlertTriangle,
} from "lucide-react";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description: string;
  benefits: string[];
}

interface FormData {
  title: string;
  description: string;
  category: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  maxAttendees: number;
  ticketTypes: TicketType[];
  tags: string[];
  images: string[];
}

interface Errors {
  [key: string]: string;
}

interface EventChanges {
  minor: string[];
  major: string[];
}

const categories = [
  "Technology",
  "Music",
  "Business",
  "Food",
  "Fashion",
  "Entertainment",
  "Sports",
  "Education",
  "Health",
  "Arts",
  "Other",
];

const steps = [
  {
    number: 1,
    title: "Event Details",
    description: "Basic information",
  },
  {
    number: 2,
    title: "Location & Time",
    description: "Venue and schedule",
  },
  {
    number: 3,
    title: "Tickets",
    description: "Pricing and availability",
  },
  {
    number: 4,
    title: "Review & Save",
    description: "Finalize changes",
  },
];

export default function EditEventPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]} fallbackPath="/auth/signin">
      <EditEventContent />
    </ProtectedRoute>
  );
}

function EditEventContent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { user } = useAuthStore();
  const { updateEvent, fetchEventById } = useEventStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [eventChanges, setEventChanges] = useState<EventChanges>({
    minor: [],
    major: [],
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [showChangePreview, setShowChangePreview] = useState(false);

  const [formData, setFormData] = useState<FormData>({
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
    startTime: "",
    endDate: "",
    endTime: "",
    maxAttendees: 50,
    ticketTypes: [],
    tags: [],
    images: [],
  });

  const [errors, setErrors] = useState<Errors>({});

  // Load existing event data
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const event = await fetchEventById(eventId);

        if (!event) {
          toast.error("Event not found");
          router.push("/my-events");
          return;
        }

        console.log("Loaded event data:", event);
        console.log("Current user:", user);
        // Check if user owns this event
        if (event.organizer._id !== user?._id) {
          toast.error("You don't have permission to edit this event");
          router.push("/my-events");
          return;
        }

        // Convert event data to form format
        const eventFormData: FormData = {
          title: event.title,
          description: event.description,
          category: event.category,
          venue: {
            name: event.venue.name,
            address: event.venue.address,
            city: event.venue.city,
            state: event.venue.state,
            coordinates: {
              latitude: event.venue.coordinates?.latitude || 0,
              longitude: event.venue.coordinates?.longitude || 0,
            },
          },
          startDate: new Date(event.startDate).toISOString().split("T")[0],
          startTime: new Date(event.startDate).toTimeString().slice(0, 5),
          endDate: new Date(event.endDate).toISOString().split("T")[0],
          endTime: new Date(event.endDate).toTimeString().slice(0, 5),
          maxAttendees: event.maxAttendees,
          ticketTypes: event.ticketTypes || [],
          tags: event.tags || [],
          images: event.images || [],
        };

        setFormData(eventFormData);
        setOriginalData(JSON.parse(JSON.stringify(eventFormData)));
        setIsFreeEvent(
          !event.ticketTypes ||
            event.ticketTypes.length === 0 ||
            event.ticketTypes.every((t: any) => t.price === 0)
        );
      } catch (error) {
        console.error("Error loading event:", error);
        toast.error("Failed to load event data");
        router.push("/my-events");
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId, fetchEventById, user, router]);

  // Detect changes and categorize them
  useEffect(() => {
    if (!originalData) return;

    const changes: EventChanges = { minor: [], major: [] };

    // Major changes that affect attendees significantly
    const majorFields = [
      "startDate",
      "startTime",
      "endDate",
      "endTime",
      "venue.name",
      "venue.address",
      "venue.city",
      "venue.state",
      "ticketTypes",
    ];

    // Minor changes
    const minorFields = ["description", "tags", "images", "maxAttendees"];

    // Check for changes
    Object.keys(formData).forEach((key) => {
      if (key === "venue") {
        Object.keys(formData.venue).forEach((venueKey) => {
          if (venueKey === "coordinates") {
            // Check coordinates separately
            if (
              formData.venue.coordinates.latitude !==
                originalData.venue.coordinates.latitude ||
              formData.venue.coordinates.longitude !==
                originalData.venue.coordinates.longitude
            ) {
              changes.major.push("Event location coordinates");
            }
          } else {
            const venueField = `venue.${venueKey}`;
            if (
              formData.venue[venueKey as keyof typeof formData.venue] !==
              originalData.venue[venueKey as keyof typeof originalData.venue]
            ) {
              if (majorFields.includes(venueField)) {
                changes.major.push(`Venue ${venueKey}`);
              }
            }
          }
        });
      } else if (key === "ticketTypes") {
        // Deep compare ticket types
        if (
          JSON.stringify(formData.ticketTypes) !==
          JSON.stringify(originalData.ticketTypes)
        ) {
          changes.major.push("Ticket types and pricing");
        }
      } else if (key === "tags" || key === "images") {
        if (
          JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
        ) {
          changes.minor.push(key === "tags" ? "Event tags" : "Event images");
        }
      } else {
        if (
          formData[key as keyof FormData] !==
          originalData[key as keyof FormData]
        ) {
          if (majorFields.includes(key)) {
            changes.major.push(
              key === "startDate"
                ? "Start date"
                : key === "startTime"
                ? "Start time"
                : key === "endDate"
                ? "End date"
                : key === "endTime"
                ? "End time"
                : key
            );
          } else if (minorFields.includes(key)) {
            changes.minor.push(
              key === "description"
                ? "Event description"
                : key === "maxAttendees"
                ? "Maximum attendees"
                : key
            );
          }
        }
      }
    });

    setEventChanges(changes);
  }, [formData, originalData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        const obj = prev[keys[0] as keyof FormData] as any;
        return {
          ...prev,
          [keys[0]]: {
            ...obj,
            [keys[1]]: value,
          },
        };
      } else if (keys.length === 3) {
        const obj = prev[keys[0] as keyof FormData] as any;
        const nestedObj = obj[keys[1]] as any;
        return {
          ...prev,
          [keys[0]]: {
            ...obj,
            [keys[1]]: {
              ...nestedObj,
              [keys[2]]: value,
            },
          },
        };
      }
      return prev;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCoordinateChange = (
    type: "latitude" | "longitude",
    value: string
  ) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    handleInputChange(`venue.coordinates.${type}`, numValue);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Event title is required";
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
      if (!formData.startTime) newErrors.startTime = "Start time is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (!formData.endTime) newErrors.endTime = "End time is required";

      // Validate coordinates
      if (formData.venue.coordinates.latitude === 0) {
        newErrors["venue.coordinates.latitude"] = "Latitude is required";
      }
      if (formData.venue.coordinates.longitude === 0) {
        newErrors["venue.coordinates.longitude"] = "Longitude is required";
      }

      // Validate date logic
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      if (endDateTime <= startDateTime) {
        newErrors.endDate = "End date/time must be after start date/time";
      }
    }

    if (step === 3) {
      if (!isFreeEvent && formData.ticketTypes.length === 0) {
        newErrors.ticketTypes =
          "At least one ticket type is required for paid events";
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

  const removeImage = (imageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image !== imageToRemove),
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      toast.error("Please select a valid image file (JPEG/PNG, max 10MB)");
      return;
    }

    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openGoogleMaps = () => {
    const { latitude, longitude } = formData.venue.coordinates;
    const { address, city } = formData.venue;

    let url = "https://www.google.com/maps/search/";

    if (latitude && longitude && latitude !== 0 && longitude !== 0) {
      url += `${latitude},${longitude}`;
    } else if (address.trim() || city.trim()) {
      const searchQuery = `${address} ${city}`.trim();
      url += encodeURIComponent(searchQuery);
    } else {
      toast.error("Please enter coordinates or venue address/city first");
      return;
    }

    window.open(url, "_blank");
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      name: "General",
      price: 0,
      quantity: 50,
      description: "",
      benefits: [],
    };
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicket],
    }));
  };

  const updateTicketType = (
    index: number,
    field: keyof TicketType,
    value: any
  ) => {
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

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setIsSubmitting(true);

      // Prepare update data
      const updateData = {
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
          `${formData.startDate}T${formData.startTime}`
        ).toISOString(),
        endDate: new Date(
          `${formData.endDate}T${formData.endTime}`
        ).toISOString(),
        maxAttendees: formData.maxAttendees,
        ticketTypes: isFreeEvent ? [] : formData.ticketTypes,
        tags: formData.tags,
        images: formData.images,
      };

      await updateEvent(eventId, updateData);

      setSuccessMessage("Event updated successfully!");
      setTimeout(() => {
        router.push("/my-events");
      }, 2000);
    } catch (error: any) {
      console.error("Update error:", error);
      setErrors({ submit: error.message || "Failed to update event" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading event data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background effects */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                href="/my-events"
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
              <Edit size={14} className="mr-1.5 sm:mr-2" fill="currentColor" />
              Edit Event
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-2">
              Edit Event
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed px-4">
              Update your event details. Changes will be automatically
              categorized and attendees will be notified if necessary.
            </p>

            {/* Changes Preview */}
            {(eventChanges.minor.length > 0 ||
              eventChanges.major.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 max-w-2xl mx-auto"
              >
                <button
                  onClick={() => setShowChangePreview(!showChangePreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-colors mx-auto"
                >
                  <History size={16} />
                  {eventChanges.minor.length + eventChanges.major.length}{" "}
                  change(s) detected
                  <Eye size={14} />
                </button>

                <AnimatePresence>
                  {showChangePreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-left"
                    >
                      {eventChanges.major.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle
                              size={16}
                              className="text-orange-400"
                            />
                            <span className="text-orange-400 font-medium text-sm">
                              Major Changes (Attendees will be notified)
                            </span>
                          </div>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {eventChanges.major.map((change, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {eventChanges.minor.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Bell size={16} className="text-blue-400" />
                            <span className="text-blue-400 font-medium text-sm">
                              Minor Changes
                            </span>
                          </div>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {eventChanges.minor.map((change, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
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
                {/* Include the same step content as the create page, but with formData pre-populated */}
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Event Details
                      </h2>
                      <p className="text-slate-400 text-sm sm:text-base">
                        Update your event information
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

                {/* Continue with the remaining steps... */}

                {/* Step 2: Location & Time */}
                {currentStep === 2 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Location & Schedule
                      </h2>
                      <p className="text-slate-400 text-sm sm:text-base">
                        Update when and where your event takes place
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

                    {/* Coordinates Section */}
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
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <ExternalLink size={16} />
                            Open in Maps
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>
                      </div>
                    </div>

                    {/* Date and Time Section */}
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

                    {/* Max Attendees */}
                    <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Users size={18} className="text-orange-400" />
                        Capacity
                      </h3>

                      <div>
                        <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                          Maximum Attendees *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.maxAttendees}
                          onChange={(e) =>
                            handleInputChange(
                              "maxAttendees",
                              parseInt(e.target.value) || 50
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base"
                        />
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
                            Update pricing and ticket options
                          </p>
                        </div>
                        {!isFreeEvent && (
                          <button
                            onClick={addTicketType}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                          >
                            <Plus size={16} />
                            Add Ticket Type
                          </button>
                        )}
                      </div>
                    </div>

                    {errors.ticketTypes && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-400" size={20} />
                        <p className="text-red-400 text-sm sm:text-base">
                          {errors.ticketTypes}
                        </p>
                      </div>
                    )}

                    {/* Free Event Message */}
                    {isFreeEvent && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                        <Users className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-green-300 mb-2">
                          Free Event
                        </h3>
                        <p className="text-green-400/80 text-sm sm:text-base">
                          This is a free event. Attendees can register without
                          payment.
                        </p>
                      </div>
                    )}

                    {/* Paid Event - Ticket Types */}
                    {!isFreeEvent && (
                      <div className="space-y-4">
                        {formData.ticketTypes.map((ticket, index) => (
                          <div
                            key={index}
                            className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30"
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                  <option value="General">General</option>
                                  <option value="VIP">VIP</option>
                                  <option value="Premium">Premium</option>
                                  <option value="Student">Student</option>
                                  <option value="Early Bird">Early Bird</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                                  Price (₦)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={ticket.price}
                                  onChange={(e) =>
                                    updateTicketType(
                                      index,
                                      "price",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base"
                                />
                              </div>

                              <div>
                                <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={ticket.quantity}
                                  onChange={(e) =>
                                    updateTicketType(
                                      index,
                                      "quantity",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
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
                                placeholder="Describe what's included with this ticket"
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all duration-300 text-sm sm:text-base"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.ticketTypes.length === 0 && !isFreeEvent && (
                      <div className="bg-slate-700/20 border border-slate-600/30 rounded-xl p-8 text-center">
                        <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-300 mb-2">
                          No Ticket Types Added
                        </h3>
                        <p className="text-slate-400 mb-4 text-sm sm:text-base">
                          Add ticket types to define pricing for your event
                        </p>
                        <button
                          onClick={addTicketType}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto text-sm sm:text-base"
                        >
                          <Plus size={16} />
                          Add First Ticket Type
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
                        Review your changes and finalize updates
                      </p>
                    </div>

                    {/* Tags Section */}
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

                    {/* Images Section */}
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

                    {/* Event Summary */}
                    <div className="bg-slate-700/20 border border-slate-600/30 rounded-xl p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                          <Eye size={18} className="text-green-400" />
                          Updated Event Summary
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
                        <div className="p-3 bg-slate-600/20 rounded-lg">
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

                    {/* Changes Summary */}
                    {(eventChanges.minor.length > 0 ||
                      eventChanges.major.length > 0) && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-medium text-blue-300 mb-4 flex items-center gap-2">
                          <History size={18} />
                          Changes Summary
                        </h3>

                        {eventChanges.major.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle
                                size={16}
                                className="text-orange-400"
                              />
                              <span className="text-orange-400 font-medium">
                                Major Changes (Attendees will be notified)
                              </span>
                            </div>
                            <div className="bg-orange-500/10 rounded-lg p-3">
                              <ul className="text-sm text-orange-200 space-y-1">
                                {eventChanges.major.map((change, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {eventChanges.minor.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Bell size={16} className="text-blue-400" />
                              <span className="text-blue-400 font-medium">
                                Minor Changes
                              </span>
                            </div>
                            <div className="bg-blue-500/10 rounded-lg p-3">
                              <ul className="text-sm text-blue-200 space-y-1">
                                {eventChanges.minor.map((change, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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

            {/* Navigation Buttons */}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Event
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/* Submit Error */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 mx-2 sm:mx-0"
            >
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm sm:text-base">
                {errors.submit}
              </p>
            </motion.div>
          )}
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
