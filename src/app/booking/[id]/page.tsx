/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Check,
  Plus,
  Minus,
  CreditCard,
  Shield,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  QrCode,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiRequest, API_CONFIG } from "@/lib/api";
import PaymentForm from "@/components/PaymentForm";

interface EventDetails {
  _id: string;
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
  endDate: string;
  startTime: string;
  endTime: string;
  ticketTypes: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    description: string;
    benefits: string[];
    isFree: boolean;
  }>;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    verified?: boolean;
  };
  images: string[];
  tags: string[];
  maxAttendees: number;
  currentAttendees: number;
  isFreeEvent: boolean;
  approved: boolean;
  status: string;
  featured?: boolean;
}

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

interface BookingResponse {
  _id: string;
  user: string;
  event: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  platformFee: number;
  vat: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  paymentReference: string;
  frontendPaymentId: string;
  qrCode: string;
  qrCodeImage: string;
  attendeeInfo: AttendeeInfo[];
  createdAt: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();

  // Event and booking state
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ticket selection state
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  // Attendee information state
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([
    { name: "", email: "", phone: "" },
  ]);
  const [useMyDetails, setUseMyDetails] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Payment and booking state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState<BookingResponse | null>(null);

  // UI state
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !token) {
      router.push("/auth/signin");
      return;
    }
  }, [user, token, router]);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(
          `${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID}/${params.id}`
        );

        if (data.success) {
          setEvent(data.data);
          // Set default ticket type if available
          if (data.data.ticketTypes.length > 0) {
            setSelectedTicketType(data.data.ticketTypes[0]._id);
          }
        } else {
          throw new Error(data.message || "Failed to fetch event");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEventDetails();
    }
  }, [params.id]);

  // Update attendees array when quantity changes
  useEffect(() => {
    setAttendees((prevAttendees) => {
      const newAttendees = Array.from(
        { length: quantity },
        (_, index) => prevAttendees[index] || { name: "", email: "", phone: "" }
      );
      return newAttendees;
    });
  }, [quantity]);

  // Auto-fill first attendee with user details
  useEffect(() => {
    if (useMyDetails && user) {
      setAttendees((prevAttendees) => {
        if (prevAttendees.length > 0) {
          const updatedAttendees = [...prevAttendees];
          updatedAttendees[0] = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || "",
          };
          return updatedAttendees;
        }
        return prevAttendees;
      });
    }
  }, [useMyDetails, user]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `₦${price.toLocaleString()}`;
  };

  const calculateFees = (subtotal: number) => {
    const platformFeeRate = 0.05; // 5%
    const vatRate = 0.075; // 7.5%

    const platformFee = subtotal * platformFeeRate;
    const vat = subtotal * vatRate;
    const finalAmount = subtotal + platformFee + vat;

    return {
      subtotal,
      platformFee,
      vat,
      finalAmount,
    };
  };

  const getSelectedTicket = () => {
    return event?.ticketTypes.find(
      (ticket) => ticket._id === selectedTicketType
    );
  };

  const getPriceBreakdown = () => {
    const selectedTicket = getSelectedTicket();
    if (!selectedTicket) return null;

    const subtotal = selectedTicket.price * quantity;

    // For free events, don't apply fees
    if (selectedTicket.isFree || selectedTicket.price === 0) {
      return {
        subtotal: 0,
        platformFee: 0,
        vat: 0,
        finalAmount: 0,
      };
    }

    return calculateFees(subtotal);
  };

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedTicketType) {
      newErrors.ticketType = "Please select a ticket type";
    }

    if (quantity < 1 || quantity > 10) {
      newErrors.quantity = "Quantity must be between 1 and 10";
    }

    const selectedTicket = getSelectedTicket();
    if (
      selectedTicket &&
      quantity > selectedTicket.quantity - selectedTicket.sold
    ) {
      newErrors.quantity = `Only ${
        selectedTicket.quantity - selectedTicket.sold
      } tickets available`;
    }

    // Validate attendee information
    attendees.forEach((attendee, index) => {
      if (!attendee.name.trim()) {
        newErrors[`attendee_${index}_name`] = "Name is required";
      }
      if (!attendee.email.trim()) {
        newErrors[`attendee_${index}_email`] = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(attendee.email)) {
        newErrors[`attendee_${index}_email`] = "Invalid email format";
      }
      if (!attendee.phone.trim()) {
        newErrors[`attendee_${index}_phone`] = "Phone number is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if all attendee forms are completely filled
  const isAttendeeFormComplete = () => {
    return attendees.every(
      (attendee) =>
        attendee.name.trim() !== "" &&
        attendee.email.trim() !== "" &&
        /\S+@\S+\.\S+/.test(attendee.email) &&
        attendee.phone.trim() !== ""
    );
  };

  // Event handlers
  const handleQuantityChange = (newQuantity: number) => {
    const selectedTicket = getSelectedTicket();
    if (!selectedTicket) return;

    const maxAvailable = selectedTicket.quantity - selectedTicket.sold;
    const finalQuantity = Math.min(
      Math.max(1, newQuantity),
      Math.min(10, maxAvailable)
    );
    setQuantity(finalQuantity);
  };

  const handleAttendeeChange = (
    index: number,
    field: keyof AttendeeInfo,
    value: string
  ) => {
    const updatedAttendees = [...attendees];
    updatedAttendees[index] = {
      ...updatedAttendees[index],
      [field]: value,
    };
    setAttendees(updatedAttendees);

    // Clear error for this field immediately when user starts typing
    const errorKey = `attendee_${index}_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }

    // Real-time validation for immediate feedback
    if (value.trim() === "") {
      return; // Don't show error while user is still typing
    }

    // Validate email format in real-time
    if (
      field === "email" &&
      value.trim() !== "" &&
      !/\S+@\S+\.\S+/.test(value)
    ) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "Invalid email format",
      }));
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsProcessingPayment(true);

    try {
      const selectedTicket = getSelectedTicket();
      if (!selectedTicket) {
        throw new Error("No ticket selected");
      }

      // Validate form before proceeding
      if (!validateForm()) {
        throw new Error("Please fill in all required fields correctly");
      }

      // Determine if this is a free event
      const isFreeEvent = selectedTicket.isFree || selectedTicket.price === 0;

      // Choose the appropriate endpoint based on event type
      const endpoint = isFreeEvent
        ? "/api/booking/free-event"
        : API_CONFIG.ENDPOINTS.BOOKINGS.CREATE;

      // Prepare booking data based on event type
      let bookingData: any;

      if (isFreeEvent) {
        // For free events, use the exact structure expected by the backend
        bookingData = {
          eventId: params.id,
          ticketType: selectedTicket.name,
          quantity,
          attendeeInfo: attendees,
        };
      } else {
        // For paid events, include payment information
        bookingData = {
          eventId: params.id,
          ticketType: selectedTicket.name,
          quantity,
          attendeeInfo: attendees,
          frontendPaymentId: paymentId,
        };
      }

      console.log("Creating booking with data:", bookingData);
      console.log("Using endpoint:", endpoint);

      // Create booking
      const bookingResponse = await apiRequest(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      console.log("Booking response:", bookingResponse);

      if (bookingResponse.success) {
        setBookingData(bookingResponse.data);
        setBookingComplete(true);
        console.log("Booking created successfully:", bookingResponse.data);

        // Clear any previous errors
        setError(null);
      } else {
        throw new Error(
          bookingResponse.message || "Booking failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Booking creation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Booking creation failed. Please try again."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle free event registration (no payment required)
  const handleFreeEventRegistration = async () => {
    setIsProcessingPayment(true);

    try {
      const selectedTicket = getSelectedTicket();
      if (!selectedTicket) {
        throw new Error("No ticket selected");
      }

      // Validate form before proceeding
      if (!validateForm()) {
        throw new Error("Please fill in all required fields correctly");
      }

      // Prepare booking data for free event - exact structure from your example
      const bookingData = {
        eventId: params.id,
        ticketType: selectedTicket.name,
        quantity,
        attendeeInfo: attendees,
      };

      console.log("Creating free event booking with data:", bookingData);

      // Create booking for free event
      const bookingResponse = await apiRequest("/api/booking/free-event", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      console.log("Free event booking response:", bookingResponse);

      if (bookingResponse.success) {
        setBookingData(bookingResponse.data);
        setBookingComplete(true);
        console.log(
          "Free event booking created successfully:",
          bookingResponse.data
        );

        // Clear any previous errors
        setError(null);
      } else {
        throw new Error(
          bookingResponse.message || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Free event registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessingPayment(false);
  };

  const handleCopyBookingReference = async () => {
    if (!bookingData) return;

    try {
      await navigator.clipboard.writeText(bookingData.paymentReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQRCode = () => {
    if (!bookingData?.qrCodeImage) return;

    const link = document.createElement("a");
    link.download = `${event?.title}-ticket-qr.png`;
    link.href = bookingData.qrCodeImage;
    link.click();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-9xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-8 bg-slate-800 rounded"></div>
              <div className="space-y-2">
                <div className="h-6 bg-slate-800 rounded w-32"></div>
                <div className="h-4 bg-slate-800 rounded w-48"></div>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-24 bg-slate-800 rounded-lg"></div>
                <div className="h-64 bg-slate-800 rounded-lg"></div>
                <div className="h-32 bg-slate-800 rounded-lg"></div>
                <div className="h-48 bg-slate-800 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-slate-800 rounded-lg"></div>
                <div className="h-32 bg-slate-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Booking Not Available
            </h1>
            <p className="text-gray-400 mb-8">
              {error || "The event you are trying to book is not available."}
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Booking confirmation state
  if (bookingComplete && bookingData) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-400">
              Your tickets have been successfully booked. Check your email for
              details.
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Booking Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBookingReference}
                  className={`p-2 rounded-lg transition-colors ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-gray-300"
                  }`}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Event Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="text-white">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Venue</p>
                      <p className="text-white">{event.venue.name}</p>
                      <p className="text-gray-300 text-sm">
                        {event.venue.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Ticket Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Ticket Type</p>
                    <p className="text-white font-medium">
                      {bookingData.ticketType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Quantity</p>
                    <p className="text-white font-medium">
                      {bookingData.quantity} ticket(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-green-400 font-bold text-lg">
                      ₦{bookingData.finalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Booking Reference</p>
                    <p className="text-purple-400 font-mono text-sm">
                      {bookingData.paymentReference}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Attendee Information
            </h3>
            <div className="grid gap-4">
              {bookingData.attendeeInfo.map((attendee, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">
                    Attendee {index + 1}
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="text-white">{attendee.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{attendee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{attendee.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          {bookingData.qrCodeImage && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Your Ticket QR Code
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    View QR
                  </button>
                  <button
                    onClick={downloadQRCode}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 inline-block">
                  <img
                    src={bookingData.qrCodeImage}
                    alt="Ticket QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Show this QR code at the event entrance
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/events/${event._id}`}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Event
            </Link>
            <Link
              href="/events"
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Ticket className="h-4 w-4" />
              Browse More Events
            </Link>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Ticket QR Code</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-white rounded-lg p-6 mx-auto inline-block">
                  <img
                    src={bookingData.qrCodeImage}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    {event.title}
                  </h3>
                  <p className="text-green-400 font-medium">
                    {bookingData.ticketType} Ticket
                  </p>
                  <p className="text-gray-400 text-sm">
                    Show this QR code at the event entrance
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const priceBreakdown = getPriceBreakdown();
  const selectedTicket = getSelectedTicket();

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Book Tickets</h1>
            <p className="text-gray-400">
              Complete your booking for {event.title}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={event.images[0] || "/placeholder-event.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {event.title}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4 text-purple-400" />
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="h-4 w-4 text-purple-400" />
                      {event.venue.name}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4 text-purple-400" />
                      {event.currentAttendees} / {event.maxAttendees} attending
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                Select Ticket Type
              </h3>
              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => {
                  const available = ticket.quantity - ticket.sold;
                  const isSelected = selectedTicketType === ticket._id;
                  const isAvailable = available > 0;

                  return (
                    <div
                      key={ticket._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10"
                          : isAvailable
                          ? "border-slate-600 hover:border-slate-500"
                          : "border-slate-700 bg-slate-700/30 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        isAvailable && setSelectedTicketType(ticket._id)
                      }
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {ticket.name}
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            {ticket.description}
                          </p>
                          {ticket.benefits && ticket.benefits.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-gray-400 text-xs font-medium">
                                Includes:
                              </p>
                              <ul className="text-gray-300 text-xs space-y-1">
                                {ticket.benefits.map((benefit, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-purple-400">
                            {formatPrice(ticket.price)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {available} of {ticket.quantity} left
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                available > 0
                                  ? "bg-gradient-to-r from-green-500 to-green-400"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.max(
                                  5,
                                  (available / ticket.quantity) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.ticketType && (
                <p className="text-red-400 text-sm mt-2">{errors.ticketType}</p>
              )}
            </div>

            {/* Quantity Selection */}
            {selectedTicket && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-6">
                  Select Quantity
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Number of tickets</p>
                    <p className="text-gray-400 text-sm">
                      Maximum 10 tickets per booking
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-bold text-white w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        quantity >=
                        Math.min(
                          10,
                          selectedTicket.quantity - selectedTicket.sold
                        )
                      }
                      className="w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {errors.quantity && (
                  <p className="text-red-400 text-sm mt-2">{errors.quantity}</p>
                )}
              </div>
            )}

            {/* Attendee Information */}
            {selectedTicket && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Attendee Information
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-400">
                        {(() => {
                          const totalFields = attendees.length * 3; // 3 fields per attendee
                          const completedFields = attendees.reduce(
                            (count, attendee) => {
                              return (
                                count +
                                (attendee.name.trim() ? 1 : 0) +
                                (attendee.email.trim() &&
                                /\S+@\S+\.\S+/.test(attendee.email)
                                  ? 1
                                  : 0) +
                                (attendee.phone.trim() ? 1 : 0)
                              );
                            },
                            0
                          );
                          return `${completedFields} of ${totalFields} fields completed`;
                        })()}
                      </p>
                      {/* Progress bar */}
                      <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-32">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isAttendeeFormComplete()
                              ? "bg-gradient-to-r from-green-500 to-green-400"
                              : "bg-gradient-to-r from-yellow-500 to-orange-400"
                          }`}
                          style={{
                            width: `${Math.max(
                              5,
                              (attendees.reduce((count, attendee) => {
                                return (
                                  count +
                                  (attendee.name.trim() ? 1 : 0) +
                                  (attendee.email.trim() &&
                                  /\S+@\S+\.\S+/.test(attendee.email)
                                    ? 1
                                    : 0) +
                                  (attendee.phone.trim() ? 1 : 0)
                                );
                              }, 0) /
                                (attendees.length * 3)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {user && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useMyDetails}
                        onChange={(e) => setUseMyDetails(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">
                        Use my details for first attendee
                      </span>
                    </label>
                  )}
                </div>

                <div className="space-y-6">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Attendee {index + 1}
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={attendee.name}
                            onChange={(e) =>
                              handleAttendeeChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="Enter full name"
                          />
                          {errors[`attendee_${index}_name`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`attendee_${index}_name`]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={attendee.email}
                            onChange={(e) =>
                              handleAttendeeChange(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="Enter email address"
                          />
                          {errors[`attendee_${index}_email`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`attendee_${index}_email`]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={attendee.phone}
                            onChange={(e) =>
                              handleAttendeeChange(
                                index,
                                "phone",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="Enter phone number"
                          />
                          {errors[`attendee_${index}_phone`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`attendee_${index}_phone`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="space-y-6">
            {/* Event Organizer */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Event Organizer
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {event.organizer.firstName[0]}
                    {event.organizer.lastName[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">
                      {event.organizer.fullName}
                    </p>
                    {event.organizer.verified && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {event.organizer.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {selectedTicket && priceBreakdown && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-6">
                  Booking Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">
                      {selectedTicket.name} × {quantity}
                    </span>
                    <span className="text-white font-medium">
                      {selectedTicket.isFree || selectedTicket.price === 0
                        ? "Free"
                        : `₦${priceBreakdown.subtotal.toLocaleString()}`}
                    </span>
                  </div>

                  {!selectedTicket.isFree && selectedTicket.price > 0 && (
                    <div className="border-t border-slate-700 pt-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-gray-300">
                          ₦{priceBreakdown.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Platform Fee (5%)</span>
                        <span className="text-gray-300">
                          ₦{priceBreakdown.platformFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">VAT (7.5%)</span>
                        <span className="text-gray-300">
                          ₦{priceBreakdown.vat.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">
                        Total
                      </span>
                      <span className="text-lg font-bold text-green-400">
                        {selectedTicket.isFree || selectedTicket.price === 0
                          ? "Free"
                          : `₦${priceBreakdown.finalAmount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Form / Free Registration */}
                {!selectedTicketType ? (
                  <div className="mb-6">
                    <button
                      disabled
                      className="w-full py-4 bg-gray-600 text-gray-400 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      Select a ticket type to continue
                    </button>
                  </div>
                ) : Object.keys(errors).length > 0 ? (
                  <div className="mb-6 space-y-3">
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm font-medium">
                          Please complete all required fields
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-red-400">
                        {Object.keys(errors).length} error
                        {Object.keys(errors).length > 1 ? "s" : ""} found
                      </div>
                    </div>
                    <button
                      disabled
                      className="w-full py-4 bg-gray-600 text-gray-400 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      Complete form to continue
                    </button>
                  </div>
                ) : selectedTicket?.isFree || selectedTicket?.price === 0 ? (
                  <div className="mb-6">
                    <button
                      onClick={handleFreeEventRegistration}
                      disabled={
                        isProcessingPayment || !isAttendeeFormComplete()
                      }
                      className={`w-full py-4 ${
                        !isAttendeeFormComplete()
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      } disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : !isAttendeeFormComplete() ? (
                        <>
                          <AlertCircle className="h-5 w-5" />
                          Complete attendee information to continue
                        </>
                      ) : (
                        <>
                          <Ticket className="h-5 w-5" />
                          Register for Free Event
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mb-6">
                    {!isAttendeeFormComplete() ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                            <p className="text-yellow-300 text-sm font-medium">
                              Complete all attendee information to proceed with
                              payment
                            </p>
                          </div>
                        </div>
                        <button
                          disabled
                          className="w-full py-4 bg-gray-600 text-gray-400 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <CreditCard className="h-5 w-5" />
                          Complete form to pay
                        </button>
                      </div>
                    ) : (
                      <PaymentForm
                        amount={priceBreakdown.finalAmount}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        isProcessing={isProcessingPayment}
                        currency="NGN"
                        userEmail={attendees[0]?.email || user?.email || ""}
                        userName={
                          attendees[0]?.name ||
                          user?.firstName + " " + user?.lastName ||
                          ""
                        }
                        userPhone={attendees[0]?.phone || user?.phone || ""}
                      />
                    )}
                  </div>
                )}

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">
                      {selectedTicket?.isFree || selectedTicket?.price === 0
                        ? "Free Registration"
                        : "Secure Payment"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {selectedTicket?.isFree || selectedTicket?.price === 0
                      ? "Your registration is free and secure. You can cancel anytime before the event."
                      : "Your payment information is encrypted and secure. You can cancel within 24 hours for a full refund."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
