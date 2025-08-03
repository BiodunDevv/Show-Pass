"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  Bookmark,
  ArrowLeft,
  Star,
  Badge,
  Ticket,
  Navigation,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEventStore } from "@/store/useEventStore";
import { useAuthStore } from "@/store/useAuthStore";

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
    fullName: string;
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
  totalTickets: number;
  ticketsSold: number;
  totalRevenue: number;
  isFree: boolean;
  isUpcoming: boolean;
  isOngoing: boolean;
  isPublic?: boolean;
  featured: boolean;
  status: string;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if current user is the organizer of this event
  const isEventOrganizer = user && event && user._id === event.organizer._id;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://showpass-backend.onrender.com/api/events/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Event not found");
        }

        const data = await response.json();
        if (data.success) {
          setEvent(data.data);
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
    setShowBookingModal(true);
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
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
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </button>

        {/* Hero Section */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8">
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
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {startDate.day}
                </div>
                <div className="text-sm text-gray-600 uppercase font-medium">
                  {startDate.month}
                </div>
              </div>
              {event.featured && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Featured
                </div>
              )}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {event.category}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {event.title}
            </h1>
            <p className="text-gray-200 text-lg">
              by {event.organizer.fullName}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Event Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-pink-400" />
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
                  <Clock className="h-5 w-5 text-pink-400" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="text-white font-medium">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-pink-400" />
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
                  <Users className="h-5 w-5 text-pink-400" />
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
              <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-700/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {event.totalTickets}
                  </p>
                  <p className="text-sm text-gray-400">Total Tickets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {event.ticketsSold}
                  </p>
                  <p className="text-sm text-gray-400">Tickets Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-400">
                    ₦{event.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  About This Event
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-300 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Status Indicators */}
              <div className="mt-6 flex flex-wrap gap-3">
                {event.isUpcoming && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                    🗓️ Upcoming Event
                  </span>
                )}
                {event.isOngoing && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30">
                    🔴 Live Now
                  </span>
                )}
                {event.featured && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                    ⭐ Featured Event
                  </span>
                )}
                {!event.isFree && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                    💳 Paid Event
                  </span>
                )}
                {event.isPublic && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                    🌍 Public Event
                  </span>
                )}
              </div>
            </div>

            {/* Event Images Gallery */}
            {event.images && event.images.length > 1 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Event Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-48 rounded-lg overflow-hidden"
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
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Location</h2>
                <button
                  onClick={openGoogleMaps}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Open in Google Maps
                </button>
              </div>

              <div className="mb-4">
                <p className="text-white font-medium">{event.venue.name}</p>
                <p className="text-gray-300">{event.venue.address}</p>
                <p className="text-gray-300">
                  {event.venue.city}, {event.venue.state}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  📍 Coordinates: {event.venue.coordinates.latitude},{" "}
                  {event.venue.coordinates.longitude}
                </p>
              </div>

              {/* Embedded Google Map - Made bigger */}
              <div className="h-80 rounded-lg overflow-hidden">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Ticket Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                Select Tickets
              </h3>

              <div className="space-y-4 mb-8">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTicket === ticket._id
                        ? "border-pink-500 bg-pink-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setSelectedTicket(ticket._id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">
                        {ticket.name}
                      </h4>
                      <p className="text-lg font-bold text-pink-400">
                        {formatPrice(ticket.price)}
                      </p>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">
                      {ticket.description}
                    </p>

                    {/* Availability */}
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-gray-400 text-sm">
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
                      This is your event. Only users with user accounts can
                      purchase tickets.
                    </p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Event Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-green-400">
                          {event.ticketsSold}
                        </p>
                        <p className="text-xs text-gray-400">Sold</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-400">
                          {event.totalTickets - event.ticketsSold}
                        </p>
                        <p className="text-xs text-gray-400">Remaining</p>
                      </div>
                    </div>
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
                  disabled={!selectedTicket}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <Ticket className="h-5 w-5" />
                  {selectedTicket
                    ? "Book Selected Ticket"
                    : "Select a Ticket to Book"}
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
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 text-center flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Sign In to Book Tickets
                  </Link>
                </div>
              )}
            </div>

            {/* Organizer Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                {isEventOrganizer ? "Your Event" : "Event Organizer"}
              </h3>

              <div className="space-y-4">
                {/* Organizer Profile */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 ${
                      isEventOrganizer
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : "bg-gradient-to-r from-pink-500 to-purple-600"
                    } rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-lg">
                      {event.organizer.firstName[0]}
                      {event.organizer.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-lg">
                        {event.organizer.fullName}
                      </p>
                      {isEventOrganizer && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                          You
                        </span>
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
                        {event.totalTickets}
                      </p>
                      <p className="text-xs text-gray-400">Total Capacity</p>
                    </div>
                  </div>
                </div>

                {/* Contact/Manage Actions */}
                {isEventOrganizer ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4" />
                      Manage Event
                    </button>
                    <button className="py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      View Attendees
                    </button>
                  </div>
                ) : (
                  <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Contact Organizer
                  </button>
                )}
              </div>
            </div>

            {/* Event Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Share Event</h3>

              <div className="space-y-4">
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
                      <p className="text-sm font-semibold text-pink-400">
                        {event.ticketsSold}
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
    </div>
  );
}
