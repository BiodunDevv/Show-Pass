"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  Navigation,
  Ticket,
  Badge,
  ExternalLink,
  Copy,
  Check,
  Share2,
  QrCode,
  Eye,
  X,
  CheckCircle,
  Download,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEventStore } from "@/store/useEventStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore, type Booking } from "@/store/useBookingStore";
import { API_CONFIG, apiRequest } from "@/lib/api";

interface EventDetails {
  _id: string;
  title: string;
  description: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fullName?: string;
  };
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    name: string;
    address: string;
    city: string;
    state: string;
  };
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
  images: string[];
  tags: string[];
  maxAttendees: number;
  currentAttendees: number;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  isPublic: boolean;
  requiresApproval: boolean;
  isFreeEvent: boolean;
  notificationsSent: boolean;
  warningCount: number;
  flaggedForDeletion: boolean;
  warnings: any[];
  postApprovalModifications: any[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  accessContext?: {
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canFlag: boolean;
    viewingAs: "owner" | "admin" | "public";
  };
  statusInfo?: {
    isApproved: boolean;
    isPending: boolean;
    isOwner: boolean;
    requiresApproval: boolean;
    visibilityReason: string;
  };
  bookingStats?: {
    confirmed: number;
    pending: number;
    cancelled: number;
    totalTicketsSold: number;
  };
  // Computed properties
  totalTickets?: number;
  ticketsSold?: number;
  totalRevenue?: number;
  isFree?: boolean;
  isUpcoming?: boolean;
  isOngoing?: boolean;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, fetchUserProfile, token } = useAuthStore();
  const { userBookings, fetchUserBookings } = useBookingStore();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showOrganizerProfile, setShowOrganizerProfile] = useState(false);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);
  const [organizerProfileLoading, setOrganizerProfileLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{
    image: string;
    ticketType: string;
    eventTitle: string;
  } | null>(null);

  // Attendees sidebar state
  const [showAttendeesSidebar, setShowAttendeesSidebar] = useState(false);
  const [eventAttendees, setEventAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeesPage, setAttendeesPage] = useState(1);
  const [attendeesTotal, setAttendeesTotal] = useState(0);
  const [attendeesSearch, setAttendeesSearch] = useState("");

  // Check if current user is the organizer of this event
  const isEventOrganizer =
    (user && event && user._id === event.organizer._id) ||
    event?.statusInfo?.isOwner === true;

  // Get user's tickets for this specific event
  const userEventTickets = userBookings.filter(
    (booking) => booking.event && booking.event._id === params.id
  );

  // Check if user has purchased tickets for this event
  const userEventPurchases = userPurchases.filter(
    (purchase) => purchase.event && purchase.event._id === params.id
  );

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add authorization header if user is logged in
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const data = await apiRequest(
          `${API_CONFIG.ENDPOINTS.EVENTS.GET_BY_ID}/${params.id}`,
          {
            method: "GET",
            headers,
          }
        );

        if (data.success) {
          setEvent(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch event");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEventDetails();
    }
  }, [params.id, token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      year: date.getFullYear(),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `₦${price.toLocaleString()}`;
  };

  const openGoogleMaps = () => {
    if (!event) return;
    const { latitude, longitude } = event.venue.coordinates;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const handleBooking = () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (!event) {
      return;
    }

    // Redirect to booking page
    router.push(`/booking/${event._id}`);
  };

  const handleCopyEventUrl = async () => {
    try {
      const eventUrl =
        typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value =
        typeof window !== "undefined" ? window.location.href : "";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const fetchOrganizerProfile = async (organizerId: string) => {
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    try {
      setOrganizerProfileLoading(true);
      setShowOrganizerProfile(true);

      console.log("Fetching organizer profile for ID:", organizerId);
      console.log(
        "Using endpoint:",
        `${API_CONFIG.ENDPOINTS.USER.ORGANIZER_PROFILE}/${organizerId}`
      );

      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.USER.ORGANIZER_PROFILE}/${organizerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setOrganizerProfile(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch organizer profile:", error);

      // Try alternative endpoints
      console.log("Trying alternative endpoint...");
      try {
        const alternativeData = await apiRequest(`/api/users/${organizerId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (alternativeData.success) {
          setOrganizerProfile(alternativeData.data);
          return;
        }
      } catch (altError) {
        console.error("Alternative endpoint also failed:", altError);

        // Try another alternative
        try {
          const data3 = await apiRequest(`/api/organizers/${organizerId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (data3.success) {
            setOrganizerProfile(data3.data);
            return;
          }
        } catch (error3) {
          console.error("All organizer profile endpoints failed:", error3);
          alert(
            "Unable to load organizer profile. The feature may not be available yet."
          );
          setShowOrganizerProfile(false);
        }
      }
    } finally {
      setOrganizerProfileLoading(false);
    }
  };

  const closeOrganizerProfile = () => {
    setShowOrganizerProfile(false);
    // Reset organizer profile data after animation completes
    setTimeout(() => {
      setOrganizerProfile(null);
      setOrganizerProfileLoading(false);
    }, 300);
  };

  // Fetch event attendees function
  const fetchEventAttendees = async (page: number = 1, search: string = "") => {
    if (!token || !event) {
      return;
    }

    try {
      setAttendeesLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "20");
      if (search.trim()) {
        queryParams.append("search", search.trim());
      }

      console.log("Fetching attendees for event ID:", event._id);

      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.EVENTS.GET_ATTENDEES}/${
          event._id
        }/attendees?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setEventAttendees(data.data || []);
        setAttendeesTotal(data.meta?.total || 0);
        setAttendeesPage(page);
      } else {
        console.error("Failed to fetch attendees:", data.message);
        // Try alternative endpoints
        try {
          const alternativeData = await apiRequest(
            `/api/bookings?eventId=${event._id}&page=${page}&limit=20${
              search ? `&search=${search}` : ""
            }`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (alternativeData.success) {
            setEventAttendees(alternativeData.data || []);
            setAttendeesTotal(alternativeData.meta?.total || 0);
            setAttendeesPage(page);
          }
        } catch (altError) {
          console.error("Alternative attendees endpoint failed:", altError);
        }
      }
    } catch (error) {
      console.error("Failed to fetch event attendees:", error);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const openAttendeesSidebar = () => {
    if (!isEventOrganizer) {
      alert("Only event organizers can view attendees.");
      return;
    }

    setShowAttendeesSidebar(true);
    if (eventAttendees.length === 0) {
      fetchEventAttendees(1, attendeesSearch);
    }
  };

  const closeAttendeesSidebar = () => {
    setShowAttendeesSidebar(false);
    // Reset attendees data after animation completes
    setTimeout(() => {
      setEventAttendees([]);
      setAttendeesPage(1);
      setAttendeesSearch("");
    }, 300);
  };

  const handleAttendeesSearch = (searchTerm: string) => {
    setAttendeesSearch(searchTerm);
    setAttendeesPage(1);
    fetchEventAttendees(1, searchTerm);
  };

  const handleAttendeesPageChange = (newPage: number) => {
    fetchEventAttendees(newPage, attendeesSearch);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-9xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-slate-800 rounded-lg mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-32 bg-slate-800 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-9xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-white mb-4">
              Event Not Found
            </h1>
            <p className="text-gray-400 mb-8">
              {error || "The event you are looking for does not exist."}
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

  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Events</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden mb-4 sm:mb-6">
          <Image
            src={
              event.images[0] ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"
            }
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 text-center">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {startDate.day}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 uppercase font-medium">
                  {startDate.month}
                </div>
              </div>
              {event.featured && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span className="hidden sm:inline">Featured</span>
                </div>
              )}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {event.category}
              </div>
              {/* Event Status Indicator */}
              {event.statusInfo?.isPending && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Pending Approval</span>
                </div>
              )}
              {event.status === "approved" && event.statusInfo?.isApproved && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Approved</span>
                </div>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
              {event.title}
            </h1>
            <p className="text-gray-200 text-sm sm:text-base lg:text-lg">
              by {event.organizer.firstName} {event.organizer.lastName}
            </p>
          </div>
        </div>

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6 order-2 xl:order-1">
            {/* Event Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                Event Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white font-medium">
                      {startDate.fullDate}
                    </p>
                    {startDate.fullDate !== endDate.fullDate && (
                      <p className="text-gray-300 text-sm">
                        Ends: {endDate.fullDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="text-white font-medium">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Venue</p>
                    <p className="text-white font-medium">{event.venue.name}</p>
                    <p className="text-gray-300 text-sm">
                      {event.venue.address}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {event.venue.city}, {event.venue.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Attendees</p>
                    <p className="text-white font-medium">
                      {event.currentAttendees} / {event.maxAttendees}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {event.maxAttendees - event.currentAttendees} spots
                      remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Status & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-700/30 rounded-lg">
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {event.ticketTypes.reduce(
                      (sum, ticket) => sum + ticket.quantity,
                      0
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Total Tickets
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-green-400">
                    {event.ticketTypes.reduce(
                      (sum, ticket) => sum + ticket.sold,
                      0
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Tickets Sold
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-purple-400">
                    ₦
                    {event.ticketTypes
                      .reduce(
                        (total, ticket) => total + ticket.sold * ticket.price,
                        0
                      )
                      .toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Total Revenue
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
                  About This Event
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  {event.description}
                </p>
              </div>

              {/* Event Status Information for Organizers */}
              {event.statusInfo && event.statusInfo.isOwner && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    Event Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          event.statusInfo.isApproved
                            ? "bg-green-400"
                            : event.statusInfo.isPending
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="text-white font-medium">
                        {event.statusInfo.isApproved
                          ? "Approved"
                          : event.statusInfo.isPending
                          ? "Pending Approval"
                          : "Rejected"}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {event.statusInfo.visibilityReason}
                    </p>
                    {event.statusInfo.isPending && (
                      <p className="text-yellow-400 text-sm">
                        Your event is currently under review. You can still edit
                        it while pending approval.
                      </p>
                    )}
                    {event.accessContext && (
                      <div className="flex gap-2 mt-3">
                        {event.accessContext.canEdit && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            Can Edit
                          </span>
                        )}
                        {event.accessContext.canDelete && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                            Can Delete
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-purple-300 rounded-full text-xs sm:text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Status Indicators */}
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                {new Date(event.startDate) > new Date() && (
                  <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm border border-green-500/30">
                    🗓️ <span className="hidden sm:inline">Upcoming Event</span>
                    <span className="sm:hidden">Upcoming</span>
                  </span>
                )}
                {new Date(event.startDate) <= new Date() &&
                  new Date(event.endDate) >= new Date() && (
                    <span className="px-2 sm:px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm border border-orange-500/30">
                      🔴 <span className="hidden sm:inline">Live Now</span>
                      <span className="sm:hidden">Live</span>
                    </span>
                  )}
                {event.featured && (
                  <span className="px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs sm:text-sm border border-yellow-500/30">
                    ⭐ <span className="hidden sm:inline">Featured Event</span>
                    <span className="sm:hidden">Featured</span>
                  </span>
                )}
                {event.ticketTypes.some((ticket) => ticket.price > 0) && (
                  <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs sm:text-sm border border-blue-500/30">
                    💳 <span className="hidden sm:inline">Paid Event</span>
                    <span className="sm:hidden">Paid</span>
                  </span>
                )}
                {event.isPublic && (
                  <span className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs sm:text-sm border border-purple-500/30">
                    🌍 <span className="hidden sm:inline">Public Event</span>
                    <span className="sm:hidden">Public</span>
                  </span>
                )}
              </div>
            </div>

            {/* Event Images Gallery */}
            {event.images && event.images.length > 1 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Event Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {event.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-36 sm:h-48 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`${event.title} - Image ${index + 2}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Location
                </h2>
                <button
                  onClick={openGoogleMaps}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Open in Google Maps</span>
                  <span className="sm:hidden">Maps</span>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-white font-medium text-sm sm:text-base">
                  {event.venue.name}
                </p>
                <p className="text-gray-300 text-sm">{event.venue.address}</p>
                <p className="text-gray-300 text-sm">
                  {event.venue.city}, {event.venue.state}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  📍 Coordinates: {event.venue.coordinates.latitude},{" "}
                  {event.venue.coordinates.longitude}
                </p>
              </div>

              {/* Embedded Google Map - Responsive height */}
              <div className="h-60 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
                <iframe
                  src={`https://maps.google.com/maps?q=${event.venue.coordinates.latitude},${event.venue.coordinates.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* User Tickets Section - Show user's tickets for this event */}
            {user && userEventTickets.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Your Tickets
                  </h2>
                  <Link
                    href="/my-tickets"
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-3">
                  {userEventTickets.slice(0, 3).map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">
                            {booking.ticketType}
                          </p>
                          <p className="text-sm text-gray-400">
                            Ref: {booking.paymentReference}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-400">
                            {formatPrice(booking.totalAmount)}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              booking.paymentStatus === "completed"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : booking.paymentStatus === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          Purchased:{" "}
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href={`/my-tickets/${booking._id}`}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            Details
                          </Link>
                          {booking.qrCodeImage && (
                            <button
                              onClick={() => {
                                setSelectedQRCode({
                                  image: booking.qrCodeImage,
                                  ticketType: booking.ticketType,
                                  eventTitle: event.title,
                                });
                                setShowQRModal(true);
                              }}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md flex items-center gap-1 transition-colors"
                            >
                              <QrCode className="h-3 w-3" />
                              QR
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {userEventTickets.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/my-tickets"
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      View {userEventTickets.length - 3} more tickets →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Responsive Layout */}
          <div className="order-1 xl:order-2 space-y-4 sm:space-y-6">
            {" "}
            {/* Ticket Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                {userEventPurchases.length > 0
                  ? "Buy More Tickets"
                  : "Select Tickets"}
              </h3>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTicket === ticket._id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setSelectedTicket(ticket._id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white text-sm sm:text-base">
                        {ticket.name}
                      </h4>
                      <p className="text-base sm:text-lg font-bold text-purple-400">
                        {formatPrice(ticket.price)}
                      </p>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">
                      {ticket.description}
                    </p>

                    {/* Availability */}
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {ticket.quantity - ticket.sold} of {ticket.quantity}{" "}
                        remaining
                      </p>
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              ((ticket.quantity - ticket.sold) /
                                ticket.quantity) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {ticket.benefits && ticket.benefits.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-400 text-xs mb-2 font-medium">
                          What's Included:
                        </p>
                        <ul className="text-gray-300 text-xs space-y-1">
                          {ticket.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Badge className="h-3 w-3 text-green-400 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Booking Actions */}
              {isEventOrganizer ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-blue-400" />
                      <p className="text-blue-300 font-semibold">
                        You're the Organizer
                      </p>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {event.statusInfo?.isPending
                        ? "Your event is pending approval. Once approved, users can purchase tickets."
                        : "This is your event. Users can purchase tickets once it's approved."}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Event Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-green-400">
                          {event.ticketTypes.reduce(
                            (sum, ticket) => sum + ticket.sold,
                            0
                          )}
                        </p>
                        <p className="text-xs text-gray-400">Sold</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-400">
                          {event.ticketTypes.reduce(
                            (sum, ticket) => sum + ticket.quantity,
                            0
                          ) -
                            event.ticketTypes.reduce(
                              (sum, ticket) => sum + ticket.sold,
                              0
                            )}
                        </p>
                        <p className="text-xs text-gray-400">Remaining</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : event.statusInfo?.isPending ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <p className="text-yellow-300 font-semibold">
                        Event Pending Approval
                      </p>
                    </div>
                    <p className="text-gray-400 text-sm">
                      This event is currently under review and tickets are not
                      yet available for purchase.
                    </p>
                  </div>
                </div>
              ) : user && user.role === "organizer" ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge className="h-5 w-5 text-orange-400" />
                      <p className="text-orange-300 font-semibold">
                        Organizer Account
                      </p>
                    </div>
                    <p className="text-gray-400 text-sm">
                      You need a user account to purchase tickets. Organizers
                      can only view events.
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-3">
                      Want to attend this event?
                    </p>
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Create User Account
                    </Link>
                  </div>
                </div>
              ) : user ? (
                <button
                  onClick={handleBooking}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Ticket className="h-5 w-5" />
                  Book Tickets
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-gray-300 text-sm mb-2">
                      🎫 Ready to join this amazing event?
                    </p>
                    <p className="text-gray-400 text-xs">
                      Sign in to book your tickets and secure your spot
                    </p>
                  </div>
                  <Link
                    href="/auth/signin"
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 text-center flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Sign In to Book Tickets
                  </Link>
                </div>
              )}
            </div>
            {/* Organizer Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                {isEventOrganizer ? "Your Event" : "Event Organizer"}
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {/* Organizer Profile */}
                <div
                  className={`flex items-center gap-3 sm:gap-4 ${
                    !isEventOrganizer && user
                      ? "cursor-pointer hover:bg-slate-700/30 p-2 sm:p-3 rounded-lg transition-colors"
                      : ""
                  }`}
                  onClick={() =>
                    !isEventOrganizer &&
                    user &&
                    fetchOrganizerProfile(event?.organizer._id || "")
                  }
                >
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 ${
                      isEventOrganizer
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : "bg-gradient-to-r from-purple-500 to-purple-600"
                    } rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-sm sm:text-lg">
                      {event.organizer.firstName[0]}
                      {event.organizer.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-sm sm:text-base lg:text-lg truncate">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </p>
                      {isEventOrganizer && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                          You
                        </span>
                      )}
                      {!isEventOrganizer && user && (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {event.organizer.email}
                    </p>
                    {event.organizer.phone && (
                      <p className="text-gray-400 text-sm">
                        {event.organizer.phone}
                      </p>
                    )}
                    {!isEventOrganizer && user && (
                      <p className="text-purple-400 text-xs mt-1">
                        Click to view full profile
                      </p>
                    )}
                  </div>
                </div>

                {/* Organizer Stats/Info */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-white">1</p>
                      <p className="text-xs text-gray-400">Events Created</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-400">
                        {event.ticketTypes.reduce(
                          (sum, ticket) => sum + ticket.quantity,
                          0
                        )}
                      </p>
                      <p className="text-xs text-gray-400">Total Capacity</p>
                    </div>
                  </div>
                </div>

                {/* Contact/Manage Actions */}
                {isEventOrganizer ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <button className="py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Manage Event</span>
                      <span className="sm:hidden">Manage</span>
                    </button>
                    <button
                      onClick={openAttendeesSidebar}
                      className="py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">View Attendees</span>
                      <span className="sm:hidden">Attendees</span>
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                    onClick={() =>
                      window.open(
                        `mailto:${event.organizer.email}?subject=Inquiry about ${event.title}&body=Hi ${event.organizer.firstName},%0D%0A%0D%0AI have a question regarding your event "${event.title}".%0D%0A%0D%0AThank you!`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    Contact Organizer
                  </button>
                )}
              </div>
            </div>
            {/* Event Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                Share Event
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {/* Copy URL Button */}
                <button
                  onClick={handleCopyEventUrl}
                  className={`w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Event Link
                    </>
                  )}
                </button>

                {/* Event URL for reference */}
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Event URL:</p>
                  <p className="text-gray-300 text-sm break-all">
                    {typeof window !== "undefined" ? window.location.href : ""}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {event.currentAttendees}
                      </p>
                      <p className="text-xs text-gray-400">Going</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-400">
                        {event.ticketTypes.reduce(
                          (sum, ticket) => sum + ticket.sold,
                          0
                        )}
                      </p>
                      <p className="text-xs text-gray-400">Tickets Sold</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedQRCode && (
        <div
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
            showQRModal ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-slate-800 rounded-lg max-w-md w-full p-6 transform transition-all duration-300 ${
              showQRModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Your Ticket QR Code
              </h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* QR Code Content */}
            <div className="text-center space-y-4">
              <div className="bg-white rounded-lg p-6 mx-auto inline-block">
                <img
                  src={selectedQRCode.image}
                  alt="QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {selectedQRCode.eventTitle}
                </h3>
                <p className="text-green-400 font-medium">
                  {selectedQRCode.ticketType} Ticket
                </p>
                <p className="text-gray-400 text-sm">
                  Show this QR code at the event entrance
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.download = `${selectedQRCode.eventTitle}-ticket-qr.png`;
                    link.href = selectedQRCode.image;
                    link.click();
                  }}
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

      {/* Organizer Profile Sidebar */}
      {showOrganizerProfile && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-transparent backdrop-blur-sm z-[80] transition-opacity duration-300 ease-out ${
              showOrganizerProfile ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeOrganizerProfile}
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-800 z-[90] transform transition-all duration-300 ease-out overflow-hidden shadow-2xl ${
              showOrganizerProfile
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">
                Organizer Profile
              </h2>
              <button
                onClick={closeOrganizerProfile}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="h-full overflow-y-auto pb-20 sidebar-scroll">
              {organizerProfileLoading ? (
                /* Skeleton Loading */
                <div className="p-2 space-y-6 animate-pulse">
                  {/* Profile Header Skeleton */}
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-700 rounded w-48 mx-auto"></div>
                      <div className="h-4 bg-slate-700 rounded w-36 mx-auto"></div>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="h-6 bg-slate-700 rounded w-24"></div>
                        <div className="h-6 bg-slate-700 rounded w-20"></div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Grid Skeleton */}
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-slate-700/50 rounded-lg p-3 text-center"
                      >
                        <div className="h-8 bg-slate-600 rounded w-12 mx-auto mb-2"></div>
                        <div className="h-3 bg-slate-600 rounded w-16 mx-auto"></div>
                      </div>
                    ))}
                  </div>

                  {/* Biography Skeleton */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="h-5 bg-slate-600 rounded w-16 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-600 rounded"></div>
                      <div className="h-4 bg-slate-600 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-600 rounded w-4/6"></div>
                    </div>
                  </div>

                  {/* Events Section Skeleton */}
                  <div>
                    <div className="h-5 bg-slate-600 rounded w-32 mb-3"></div>
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="h-4 bg-slate-600 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-slate-600 rounded w-20 mb-2"></div>
                              <div className="h-3 bg-slate-600 rounded w-24"></div>
                            </div>
                            <div className="h-6 bg-slate-600 rounded w-12"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Section Skeleton */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="h-5 bg-slate-600 rounded w-16 mb-3"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-slate-600 rounded"></div>
                        <div className="h-4 bg-slate-600 rounded flex-1"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-slate-600 rounded"></div>
                        <div className="h-3 bg-slate-600 rounded w-32"></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="space-y-3">
                    <div className="h-12 bg-slate-600 rounded-lg"></div>
                    <div className="h-10 bg-slate-600 rounded-lg"></div>
                  </div>
                </div>
              ) : organizerProfile ? (
                /* Actual Content */
                <div className="p-2 sm:p-4 space-y-6">
                  {/* Profile Header */}
                  <div className="text-center space-y-4 animate-fadeIn">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto transform transition-transform duration-300 hover:scale-105">
                      <span className="text-white font-bold text-2xl">
                        {organizerProfile.firstName[0]}
                        {organizerProfile.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {organizerProfile.firstName} {organizerProfile.lastName}
                      </h3>
                      <p className="text-gray-400">{organizerProfile.email}</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30 transition-colors hover:bg-purple-500/30">
                          Event Organizer
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            organizerProfile.statistics?.verificationStatus ===
                            "verified"
                              ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
                          }`}
                        >
                          {organizerProfile.statistics?.verificationStatus ===
                          "verified"
                            ? "Verified"
                            : "Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Grid */}
                  <div
                    className="grid grid-cols-2 gap-3 animate-slideUp"
                    style={{ animationDelay: "100ms" }}
                  >
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center transition-all duration-300 hover:bg-slate-700/70 hover:scale-105">
                      <p className="text-xl font-bold text-white">
                        {organizerProfile.statistics?.totalEvents || 0}
                      </p>
                      <p className="text-xs text-gray-400">Total Events</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center transition-all duration-300 hover:bg-slate-700/70 hover:scale-105">
                      <p className="text-xl font-bold text-green-400">
                        {organizerProfile.statistics?.totalAttendees || 0}
                      </p>
                      <p className="text-xs text-gray-400">Total Attendees</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center transition-all duration-300 hover:bg-slate-700/70 hover:scale-105">
                      <p className="text-xl font-bold text-purple-400">
                        ₦
                        {organizerProfile.statistics?.totalRevenue?.toLocaleString() ||
                          0}
                      </p>
                      <p className="text-xs text-gray-400">Total Revenue</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center transition-all duration-300 hover:bg-slate-700/70 hover:scale-105">
                      <p className="text-xl font-bold text-yellow-400">
                        {organizerProfile.statistics?.avgRating || 0}/5
                      </p>
                      <p className="text-xs text-gray-400">Avg Rating</p>
                    </div>
                  </div>

                  {/* Biography */}
                  {organizerProfile.bio && (
                    <div
                      className="bg-slate-700/30 rounded-lg p-4 animate-slideUp"
                      style={{ animationDelay: "200ms" }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-2">
                        About
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {organizerProfile.bio}
                      </p>
                    </div>
                  )}

                  {/* Upcoming Events */}
                  {organizerProfile.events?.upcoming &&
                    organizerProfile.events.upcoming.length > 0 && (
                      <div
                        className="animate-slideUp"
                        style={{ animationDelay: "300ms" }}
                      >
                        <h4 className="text-lg font-semibold text-white mb-3">
                          Upcoming Events (
                          {organizerProfile.events.upcoming.length})
                        </h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {organizerProfile.events.upcoming
                            .slice(0, 3)
                            .map((event: any, index: number) => (
                              <div
                                key={event._id}
                                className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-all duration-300 hover:transform hover:scale-105"
                                style={{
                                  animationDelay: `${400 + index * 100}ms`,
                                }}
                              >
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h6 className="text-white font-medium text-sm truncate">
                                      {event.title}
                                    </h6>
                                    <p className="text-gray-400 text-xs">
                                      {event.category}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                      <span>
                                        📅{" "}
                                        {new Date(
                                          event.startDate
                                        ).toLocaleDateString()}
                                      </span>
                                      <span>📍 {event.venue?.city}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      closeOrganizerProfile();
                                      router.push(`/events/${event._id}`);
                                    }}
                                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-all duration-300 flex-shrink-0 hover:scale-105"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          {organizerProfile.events.upcoming.length > 3 && (
                            <p className="text-center text-gray-400 text-xs mt-2">
                              +{organizerProfile.events.upcoming.length - 3}{" "}
                              more events
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Past Events */}
                  {organizerProfile.events?.past &&
                    organizerProfile.events.past.length > 0 && (
                      <div
                        className="animate-slideUp"
                        style={{ animationDelay: "400ms" }}
                      >
                        <h4 className="text-lg font-semibold text-white mb-3">
                          Past Events ({organizerProfile.events.past.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {organizerProfile.events.past
                            .slice(0, 2)
                            .map((event: any) => (
                              <div
                                key={event._id}
                                className="bg-slate-700/30 rounded-lg p-3 border border-slate-700 transition-all duration-300 hover:bg-slate-700/50"
                              >
                                <h6 className="text-gray-300 font-medium text-sm">
                                  {event.title}
                                </h6>
                                <p className="text-gray-500 text-xs">
                                  {event.category} •{" "}
                                  {new Date(
                                    event.startDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          {organizerProfile.events.past.length > 2 && (
                            <p className="text-center text-gray-400 text-xs mt-2">
                              +{organizerProfile.events.past.length - 2} more
                              past events
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Contact Info */}
                  <div
                    className="bg-slate-700/30 rounded-lg p-4 animate-slideUp"
                    style={{ animationDelay: "500ms" }}
                  >
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Contact
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">📧</span>
                        <p className="text-gray-300 text-sm truncate">
                          {organizerProfile.email}
                        </p>
                      </div>
                      {organizerProfile.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📞</span>
                          <p className="text-gray-300 text-sm">
                            {organizerProfile.phone}
                          </p>
                        </div>
                      )}
                      {organizerProfile.website && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">🌐</span>
                          <p className="text-gray-300 text-sm truncate">
                            {organizerProfile.website}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">📅</span>
                        <p className="text-gray-400 text-xs">
                          Member since{" "}
                          {new Date(
                            organizerProfile.joinDate ||
                              organizerProfile.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="space-y-3 animate-slideUp"
                    style={{ animationDelay: "600ms" }}
                  >
                    <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg">
                      <ExternalLink className="h-4 w-4" />
                      Contact Organizer
                    </button>
                    <button
                      onClick={closeOrganizerProfile}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              ) : (
                /* Error State */
                <div className="p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <X className="h-12 w-12 mx-auto mb-3" />
                    <p>Failed to load organizer profile</p>
                  </div>
                  <button
                    onClick={closeOrganizerProfile}
                    className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Attendees Sidebar */}
      {showAttendeesSidebar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] transition-opacity duration-300"
            onClick={closeAttendeesSidebar}
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-800 z-[80] transform transition-transform duration-300 ease-in-out flex flex-col ${
              showAttendeesSidebar ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 sm:p-6 bg-slate-900 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Event Attendees
                </h2>
                <button
                  onClick={closeAttendeesSidebar}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={attendeesSearch}
                    onChange={(e) => handleAttendeesSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <Users className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {attendeesTotal}
                  </p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-400">
                    {eventAttendees.filter((a) => a.checkedIn).length}
                  </p>
                  <p className="text-xs text-gray-400">Checked In</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-purple-400">
                    {
                      eventAttendees.filter(
                        (a) => a.paymentStatus === "completed"
                      ).length
                    }
                  </p>
                  <p className="text-xs text-gray-400">Paid</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {attendeesLoading ? (
                /* Loading State */
                <div className="p-4 space-y-4 pb-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-600 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-slate-600 rounded w-24"></div>
                        </div>
                        <div className="h-6 bg-slate-600 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : eventAttendees.length > 0 ? (
                /* Attendees List */
                <div className="p-4 space-y-3 pb-6">
                  {eventAttendees.map((attendee, index) => (
                    <div
                      key={attendee._id || index}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:bg-slate-700/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {attendee.attendeeInfo?.[0]?.name?.[0] ||
                              attendee.user?.firstName?.[0] ||
                              attendee.name?.[0] ||
                              "?"}
                          </span>
                        </div>

                        {/* Attendee Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">
                            {attendee.attendeeInfo?.[0]?.name ||
                              `${attendee.user?.firstName || ""} ${
                                attendee.user?.lastName || ""
                              }`.trim() ||
                              attendee.name ||
                              "Unknown Attendee"}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {attendee.attendeeInfo?.[0]?.email ||
                              attendee.user?.email ||
                              attendee.email ||
                              "No email"}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {attendee.ticketType || "General"}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              attendee.checkedIn
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            }`}
                          >
                            {attendee.checkedIn ? "Checked In" : "Not Checked"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              attendee.paymentStatus === "completed"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : attendee.paymentStatus === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {attendee.paymentStatus || "Unknown"}
                          </span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {attendee.bookingReference && (
                        <div className="mt-2 pt-2 border-t border-slate-600">
                          <p className="text-gray-400 text-xs">
                            Ref: {attendee.bookingReference}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {attendeesTotal > 20 && (
                    <div className="flex justify-center gap-2 mt-6 pb-4">
                      <button
                        onClick={() =>
                          handleAttendeesPageChange(attendeesPage - 1)
                        }
                        disabled={attendeesPage === 1}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors text-sm"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 bg-slate-800 text-gray-300 rounded text-sm">
                        Page {attendeesPage} of {Math.ceil(attendeesTotal / 20)}
                      </span>
                      <button
                        onClick={() =>
                          handleAttendeesPageChange(attendeesPage + 1)
                        }
                        disabled={
                          attendeesPage >= Math.ceil(attendeesTotal / 20)
                        }
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors text-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <Users className="h-12 w-12 mx-auto mb-3" />
                    <p className="text-lg font-medium">No Attendees Yet</p>
                    <p className="text-sm">
                      When people register for your event, they'll appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedQRCode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Ticket QR Code</h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedQRCode(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                <img
                  src={selectedQRCode.image}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-white font-medium mb-1">
                {selectedQRCode.ticketType}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {selectedQRCode.eventTitle}
              </p>
              <p className="text-gray-400 text-xs">
                Show this QR code at the event entrance for check-in
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
