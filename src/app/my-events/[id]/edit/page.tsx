"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/useAuthStore";
import { useEventStore } from "@/store/useEventStore";
import { API_CONFIG, apiRequest } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ArrowLeft,
  ArrowRight,
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
  CheckCircle,
  AlertCircle,
  Upload,
  Trash2,
  ExternalLink,
  Navigation,
  Loader2,
  AlertTriangle,
  Lock,
  Unlock,
  Info,
  Edit3,
  History,
  Eye,
} from "lucide-react";

interface TicketType {
  _id?: string;
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

interface EventData {
  _id: string;
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
  requiresApproval: boolean;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface FormData {
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
  requiresApproval: boolean;
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
  const { user, token } = useAuthStore();

  const [event, setEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showFullEditWarning, setShowFullEditWarning] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId || !token) return;

      try {
        setIsLoading(true);
        const response = await apiRequest(
          `${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID}/${eventId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.success) {
          const eventData: EventData = response.data;

          // Check if user owns this event
          if (eventData.organizer._id !== user?._id) {
            toast.error("You don't have permission to edit this event");
            router.push("/my-events");
            return;
          }

          setEvent(eventData);

          // Initialize form data
          const initialFormData: FormData = {
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            venue: eventData.venue,
            startDate: new Date(eventData.startDate)
              .toISOString()
              .split("T")[0],
            endDate: new Date(eventData.endDate).toISOString().split("T")[0],
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            ticketTypes: eventData.ticketTypes || [],
            images: eventData.images || [],
            tags: eventData.tags || [],
            maxAttendees: eventData.maxAttendees,
            isPublic: eventData.isPublic,
            requiresApproval: eventData.requiresApproval,
          };

          setFormData(initialFormData);
        } else {
          throw new Error(response.message || "Failed to fetch event");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event data");
        router.push("/my-events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, token, user, router]);

  const isEventApproved = event?.approved || event?.status === "approved";
  const canMakeFullEdit = !isEventApproved;

  // Define steps
  const steps = [
    { number: 1, title: "Basic Info", description: "Event details" },
    { number: 2, title: "Location & Time", description: "When and where" },
    { number: 3, title: "Tickets", description: "Pricing & types" },
    {
      number: 4,
      title: "Media & Review",
      description: "Images, tags & final review",
    },
  ];

  // Step navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Basic Info validation
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (step === 2 && canMakeFullEdit) {
      // Location & Time validation (only for non-approved events)
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

      // Date validation
      if (
        formData.startDate &&
        formData.endDate &&
        formData.startTime &&
        formData.endTime
      ) {
        const startDateTime = new Date(
          `${formData.startDate}T${formData.startTime}`
        );
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        if (endDateTime <= startDateTime) {
          newErrors.endDate = "End date/time must be after start date/time";
        }
      }
    }

    if (step === 3 && canMakeFullEdit) {
      // Tickets validation (only for non-approved events)
      if (formData.ticketTypes.length === 0) {
        newErrors.ticketTypes = "At least one ticket type is required";
      }

      formData.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name.trim()) {
          newErrors[`ticketType.${index}.name`] = "Ticket name is required";
        }
        if (ticket.quantity <= 0) {
          newErrors[`ticketType.${index}.quantity`] =
            "Quantity must be greater than 0";
        }
        if (ticket.price < 0) {
          newErrors[`ticketType.${index}.price`] = "Price cannot be negative";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (field: string, value: any) => {
    if (!formData) return;

    setFormData((prev) => {
      if (!prev) return prev;

      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev[keys[0] as keyof FormData] as any),
            [keys[1]]: value,
          },
        };
      } else if (keys.length === 3) {
        const obj = prev[keys[0] as keyof FormData] as any;
        return {
          ...prev,
          [keys[0]]: {
            ...obj,
            [keys[1]]: {
              ...obj[keys[1]],
              [keys[2]]: value,
            },
          },
        };
      }
      return prev;
    });

    // Clear error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Add tag
  const addTag = () => {
    if (!formData || !newTag.trim() || formData.tags.includes(newTag.trim()))
      return;

    handleInputChange("tags", [...formData.tags, newTag.trim()]);
    setNewTag("");
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    if (!formData) return;
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Add image
  const addImage = () => {
    if (
      !formData ||
      !newImageUrl.trim() ||
      formData.images.includes(newImageUrl.trim())
    )
      return;

    handleInputChange("images", [...formData.images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  // Remove image
  const removeImage = (imageToRemove: string) => {
    if (!formData) return;
    handleInputChange(
      "images",
      formData.images.filter((image) => image !== imageToRemove)
    );
  };

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;

    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadToCloudinary(file);

      if (!formData.images.includes(imageUrl)) {
        handleInputChange("images", [...formData.images, imageUrl]);
      }

      // Clear the input
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Add ticket type
  const addTicketType = () => {
    if (!formData) return;

    const newTicket: TicketType = {
      name: "General",
      price: 0,
      quantity: 50,
      description: "",
      benefits: [],
      isFree: true,
    };

    handleInputChange("ticketTypes", [...formData.ticketTypes, newTicket]);
  };

  // Update ticket type
  const updateTicketType = (
    index: number,
    field: keyof TicketType,
    value: any
  ) => {
    if (!formData) return;

    const updatedTickets = formData.ticketTypes.map((ticket, i) =>
      i === index ? { ...ticket, [field]: value } : ticket
    );

    handleInputChange("ticketTypes", updatedTickets);
  };

  // Remove ticket type
  const removeTicketType = (index: number) => {
    if (!formData) return;

    const updatedTickets = formData.ticketTypes.filter((_, i) => i !== index);
    handleInputChange("ticketTypes", updatedTickets);
  };

  // Add benefit to ticket type
  const addBenefit = (ticketIndex: number, benefit: string) => {
    if (!formData || !benefit.trim()) return;

    const updatedTickets = formData.ticketTypes.map((ticket, i) =>
      i === ticketIndex
        ? { ...ticket, benefits: [...ticket.benefits, benefit.trim()] }
        : ticket
    );

    handleInputChange("ticketTypes", updatedTickets);
  };

  // Remove benefit from ticket type
  const removeBenefit = (ticketIndex: number, benefitIndex: number) => {
    if (!formData) return;

    const updatedTickets = formData.ticketTypes.map((ticket, i) =>
      i === ticketIndex
        ? {
            ...ticket,
            benefits: ticket.benefits.filter((_, bi) => bi !== benefitIndex),
          }
        : ticket
    );

    handleInputChange("ticketTypes", updatedTickets);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";

    // Only validate other fields for non-approved events or when doing minor updates
    if (canMakeFullEdit) {
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

      // Date validation
      if (
        formData.startDate &&
        formData.endDate &&
        formData.startTime &&
        formData.endTime
      ) {
        const startDateTime = new Date(
          `${formData.startDate}T${formData.startTime}`
        );
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        if (endDateTime <= startDateTime) {
          newErrors.endDate = "End date/time must be after start date/time";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData || !event || !validateForm()) return;

    try {
      setIsSubmitting(true);

      let updateData;

      if (canMakeFullEdit) {
        // Full update for non-approved events
        updateData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          venue: formData.venue,
          startDate: new Date(
            `${formData.startDate}T${formData.startTime}`
          ).toISOString(),
          endDate: new Date(
            `${formData.endDate}T${formData.endTime}`
          ).toISOString(),
          startTime: formData.startTime,
          endTime: formData.endTime,
          ticketTypes: formData.ticketTypes.map((ticket) => ({
            ...ticket,
            isFree: ticket.price === 0,
          })),
          images: formData.images,
          tags: formData.tags,
          maxAttendees: formData.maxAttendees,
          isPublic: formData.isPublic,
          requiresApproval: formData.requiresApproval,
        };
      } else {
        // Minor update for approved events
        updateData = {
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          category: formData.category,
          venue: formData.venue,
          tags: formData.tags,
          images: formData.images,
        };
      }

      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.EVENTS.UPDATE}/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.success) {
        toast.success(
          canMakeFullEdit
            ? "Event updated successfully!"
            : "Event updated successfully! Changes will be reflected shortly."
        );
        router.push("/my-events");
      } else {
        throw new Error(response.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update event"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (!formData) return null;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Basic Information
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Update your event's basic details
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Title */}
              <div
                className={
                  canMakeFullEdit ? "" : "opacity-50 pointer-events-none"
                }
              >
                <label className="block text-white font-medium mb-2 text-sm sm:text-base">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={!canMakeFullEdit}
                  placeholder="Enter your event title"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                    errors.title ? "border-red-500" : "border-slate-600/50"
                  } ${!canMakeFullEdit ? "cursor-not-allowed" : ""}`}
                />
                {errors.title && (
                  <p className="mt-2 text-red-400 text-xs sm:text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.title}
                  </p>
                )}
                {!canMakeFullEdit && (
                  <p className="mt-1 text-orange-400 text-xs">
                    Title cannot be changed for approved events
                  </p>
                )}
              </div>

              {/* Description */}
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

              {/* Category */}
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
                    errors.category ? "border-red-500" : "border-slate-600/50"
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
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Location & Schedule
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                {canMakeFullEdit
                  ? "Update when and where your event will take place"
                  : "You can only update venue details for approved events"}
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
                    disabled={!canMakeFullEdit}
                    placeholder="Enter venue name"
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm sm:text-base ${
                      errors["venue.name"]
                        ? "border-red-500"
                        : "border-slate-600/50"
                    } ${
                      !canMakeFullEdit ? "opacity-50 cursor-not-allowed" : ""
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

              {/* Coordinates */}
              <div className="mt-4">
                <h4 className="text-md font-medium text-white mb-2">
                  Coordinates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Latitude
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
                        handleInputChange(
                          "venue.coordinates.latitude",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g. 6.5244"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Longitude
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
                        handleInputChange(
                          "venue.coordinates.longitude",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g. 3.3792"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openGoogleMaps}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Navigation size={16} />
                  Open in Google Maps
                </button>
              </div>
            </div>

            {/* Schedule (only for non-approved events) */}
            {canMakeFullEdit && (
              <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-purple-400" />
                  Event Schedule
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2 text-sm">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                        errors.startDate
                          ? "border-red-500"
                          : "border-slate-600/50"
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-red-400 text-xs">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2 text-sm">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                        errors.endDate
                          ? "border-red-500"
                          : "border-slate-600/50"
                      }`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-red-400 text-xs">
                        {errors.endDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2 text-sm">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        handleInputChange("startTime", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                        errors.startTime
                          ? "border-red-500"
                          : "border-slate-600/50"
                      }`}
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-red-400 text-xs">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2 text-sm">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        handleInputChange("endTime", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                        errors.endTime
                          ? "border-red-500"
                          : "border-slate-600/50"
                      }`}
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-red-400 text-xs">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-white font-medium mb-2 text-sm">
                    Max Attendees
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
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="50"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Ticket Types
                  </h2>
                  <p className="text-slate-400 text-sm sm:text-base">
                    {canMakeFullEdit
                      ? "Configure your event tickets and pricing"
                      : "Ticket pricing cannot be changed for approved events"}
                  </p>
                </div>
                {canMakeFullEdit && (
                  <button
                    onClick={addTicketType}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20 text-sm sm:text-base"
                  >
                    <Plus size={16} />
                    Add Ticket
                  </button>
                )}
              </div>
            </div>

            {!canMakeFullEdit && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center gap-3">
                <Lock className="text-orange-400" size={20} />
                <p className="text-orange-400 text-sm">
                  Ticket types and pricing cannot be modified for approved
                  events to avoid disrupting existing bookings.
                </p>
              </div>
            )}

            {canMakeFullEdit && errors.ticketTypes && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-400 text-sm">{errors.ticketTypes}</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className={`bg-slate-700/20 border border-slate-600/30 rounded-xl p-4 sm:p-6 ${
                    !canMakeFullEdit ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {ticket.name || `Ticket Type ${index + 1}`}
                    </h3>
                    {canMakeFullEdit && formData.ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) =>
                          updateTicketType(index, "name", e.target.value)
                        }
                        disabled={!canMakeFullEdit}
                        className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="e.g., General, VIP, Early Bird"
                      />
                      {errors[`ticketType.${index}.name`] && (
                        <p className="mt-1 text-red-400 text-xs">
                          {errors[`ticketType.${index}.name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price (₦) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={ticket.price}
                        onChange={(e) => {
                          const price = parseInt(e.target.value) || 0;
                          updateTicketType(index, "price", price);
                          updateTicketType(index, "isFree", price === 0);
                        }}
                        disabled={!canMakeFullEdit}
                        className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0 for free"
                      />
                      {errors[`ticketType.${index}.price`] && (
                        <p className="mt-1 text-red-400 text-xs">
                          {errors[`ticketType.${index}.price`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantity *
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
                        disabled={!canMakeFullEdit}
                        className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="e.g., 100"
                      />
                      {errors[`ticketType.${index}.quantity`] && (
                        <p className="mt-1 text-red-400 text-xs">
                          {errors[`ticketType.${index}.quantity`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={ticket.description}
                        onChange={(e) =>
                          updateTicketType(index, "description", e.target.value)
                        }
                        disabled={!canMakeFullEdit}
                        className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Brief description"
                      />
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Benefits
                    </label>
                    <div className="space-y-2">
                      {ticket.benefits.map((benefit, benefitIndex) => (
                        <div
                          key={benefitIndex}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => {
                              const updatedBenefits = [...ticket.benefits];
                              updatedBenefits[benefitIndex] = e.target.value;
                              updateTicketType(
                                index,
                                "benefits",
                                updatedBenefits
                              );
                            }}
                            disabled={!canMakeFullEdit}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Enter benefit"
                          />
                          {canMakeFullEdit && (
                            <button
                              type="button"
                              onClick={() => removeBenefit(index, benefitIndex)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {canMakeFullEdit && (
                        <button
                          type="button"
                          onClick={() => addBenefit(index, "")}
                          className="flex items-center gap-2 px-4 py-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                        >
                          <Plus size={16} />
                          Add Benefit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {canMakeFullEdit && formData.ticketTypes.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-600/50 rounded-xl bg-slate-700/10">
                  <Users className="mx-auto mb-4 text-slate-400" size={48} />
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Media & Final Review
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Add final touches and review your changes
              </p>
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
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden items-center justify-center h-full">
                        <ImageIcon className="text-slate-400" size={32} />
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
                        isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Upload size={16} />
                      {isUploadingImage ? "Uploading..." : "Choose Image"}
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
                      type="button"
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/20"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
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
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-400 hover:text-purple-300"
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
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  onClick={addTag}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Event Summary */}
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
                      onClick={openGoogleMaps}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <Navigation size={16} />
                      View Location
                    </button>
                  )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="p-3 bg-slate-600/20 rounded-lg">
                  <p className="text-slate-400 mb-1">Title</p>
                  <p className="text-white font-medium">
                    {formData.title || "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-slate-600/20 rounded-lg">
                  <p className="text-slate-400 mb-1">Category</p>
                  <p className="text-white font-medium">
                    {formData.category || "Not selected"}
                  </p>
                </div>
                <div className="p-3 bg-slate-600/20 rounded-lg">
                  <p className="text-slate-400 mb-1">Venue</p>
                  <p className="text-white font-medium">
                    {formData.venue.name || "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-slate-600/20 rounded-lg">
                  <p className="text-slate-400 mb-1">Location</p>
                  <p className="text-white font-medium">
                    {formData.venue.city && formData.venue.state
                      ? `${formData.venue.city}, ${formData.venue.state}`
                      : "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-slate-600/20 rounded-lg">
                  <p className="text-slate-400 mb-1">Date</p>
                  <p className="text-white font-medium">
                    {formData.startDate
                      ? new Date(formData.startDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-slate-600/20 rounded-lg">
                  <p className="text-slate-400 mb-1">Time</p>
                  <p className="text-white font-medium">
                    {formData.startTime && formData.endTime
                      ? `${formData.startTime} - ${formData.endTime}`
                      : "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-slate-600/20 rounded-lg sm:col-span-2">
                  <p className="text-slate-400 mb-1">Ticket Types</p>
                  <p className="text-white font-medium">
                    {formData.ticketTypes.length} ticket type
                    {formData.ticketTypes.length !== 1 ? "s" : ""} configured
                  </p>
                </div>
              </div>
            </div>

            {/* Settings (only for non-approved events) */}
            {canMakeFullEdit && (
              <div className="bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-400" />
                  Event Settings
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) =>
                        handleInputChange("isPublic", e.target.checked)
                      }
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-slate-800"
                    />
                    <span className="text-gray-300">Make event public</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.requiresApproval}
                      onChange={(e) =>
                        handleInputChange("requiresApproval", e.target.checked)
                      }
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-slate-800"
                    />
                    <span className="text-gray-300">
                      Require approval for attendance
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };
  const openGoogleMaps = () => {
    if (!formData) return;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-purple-500" size={48} />
          </div>
        </div>
      </div>
    );
  }

  if (!event || !formData) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-9xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h1 className="text-2xl font-bold text-white mb-4">
              Event Not Found
            </h1>
            <Link
              href="/my-events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              Back to My Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-2 sm:px-4 lg:px-6 pt-20 pb-10">
      <div className="max-w-9xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-600/20 border-b border-slate-600/30 p-4 sm:p-6 lg:p-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                Edit Event
              </h1>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto mb-3 sm:mb-4">
                {isEventApproved
                  ? "This event has been approved. You can only make minor updates to venue details and description."
                  : "Update your event details. Full editing is available for non-approved events."}
              </p>

              {/* Show approval status */}
              <div
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                  isEventApproved
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                }`}
              >
                {isEventApproved ? (
                  <>
                    <CheckCircle size={14} />
                    Event Approved
                  </>
                ) : (
                  <>
                    <Clock size={14} />
                    Pending Approval
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-slate-800/50 border-b border-slate-600/30 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        currentStep >= step.number
                          ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/30"
                          : "border-slate-500 text-slate-400 bg-slate-700/50"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle size={16} className="sm:w-5 sm:h-5" />
                      ) : (
                        <span className="text-xs sm:text-sm font-medium">
                          {step.number}
                        </span>
                      )}
                    </div>
                    <div className="ml-2 sm:ml-3 hidden sm:block">
                      <p
                        className={`text-xs sm:text-sm font-medium ${
                          currentStep >= step.number
                            ? "text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden lg:block w-12 xl:w-20 h-0.5 mx-4 transition-all duration-300 ${
                        currentStep > step.number
                          ? "bg-purple-600"
                          : "bg-slate-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {formData && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {/* Step Content */}
              <div className="p-4 sm:p-6 lg:p-8 min-h-[500px] sm:min-h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="bg-slate-800/50 border-t border-slate-600/30 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                    <span>
                      Step {currentStep} of {steps.length}
                    </span>
                    {!canMakeFullEdit && (
                      <span className="text-orange-400">
                        • Limited editing mode
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base min-w-[120px]"
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>
                    )}

                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/25 text-sm sm:text-base min-w-[120px]"
                      >
                        Next
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => router.push("/my-events")}
                          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base min-w-[100px]"
                        >
                          <X size={16} />
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-800 disabled:to-emerald-800 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 disabled:cursor-not-allowed text-sm sm:text-base min-w-[140px]"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Update Event
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
