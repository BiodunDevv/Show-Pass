"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  FilePenLine,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEventStore, type Event } from "@/store/useEventStore";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyEventsPage() {
  return (
    <ProtectedRoute allowedRoles={["organizer"]} fallbackPath="/auth/signin">
      <MyEventsContent />
    </ProtectedRoute>
  );
}

function MyEventsContent() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { events, fetchOrganizerEvents, deleteEvent, isLoading, error } =
    useEventStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const eventsPerPage = 6;

  // Fetch organizer events
  useEffect(() => {
    if (user && token && user.role === "organizer") {
      fetchOrganizerEvents({
        page: currentPage,
        limit: eventsPerPage,
        status: selectedStatus === "all" ? undefined : selectedStatus,
      });
    }
  }, [user, token, currentPage, selectedStatus, fetchOrganizerEvents]);

  // Filter events based on search
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

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
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatPrice = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return "Free";

    const minPrice = Math.min(...ticketTypes.map((t) => t.price));
    const maxPrice = Math.max(...ticketTypes.map((t) => t.price));

    if (minPrice === 0 && maxPrice === 0) return "Free";
    if (minPrice === maxPrice) return `₦${minPrice.toLocaleString()}`;
    return `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete._id);
      setShowDeleteModal(false);
      setEventToDelete(null);
      // Refresh the events list
      fetchOrganizerEvents({
        page: currentPage,
        limit: eventsPerPage,
        status: selectedStatus === "all" ? undefined : selectedStatus,
      });
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateStats = () => {
    const totalEvents = events.length;
    const totalRevenue = events.reduce(
      (sum, event) => sum + (event.totalRevenue || 0),
      0
    );
    const totalAttendees = events.reduce(
      (sum, event) => sum + (event.currentAttendees || 0),
      0
    );
    const approvedEvents = events.filter(
      (event) => event.status === "approved"
    ).length;

    return { totalEvents, totalRevenue, totalAttendees, approvedEvents };
  };

  const stats = calculateStats();

  if (!user || user.role !== "organizer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-white">My Events</h1>
              <p className="text-slate-400">
                Manage your events and track performance
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Calendar className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalEvents}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <CheckCircle className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.approvedEvents}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Users className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Attendees</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalAttendees}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <DollarSign className="text-yellow-400" size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ₦{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Create Event Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Link href="/my-events/create">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus size={20} />
                Create New Event
              </button>
            </Link>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8 flex items-center gap-3"
          >
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <h3 className="text-red-300 font-medium">Error loading events</h3>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-slate-800/50 rounded-xl p-6 animate-pulse"
              >
                <div className="h-48 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-slate-700 rounded flex-1"></div>
                  <div className="h-10 bg-slate-700 rounded w-12"></div>
                  <div className="h-10 bg-slate-700 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && currentEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentEvents.map((event) => {
              const startDate = formatDate(event.startDate);

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.images[0] || "/placeholder.jpg"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {startDate.day}
                      </div>
                      <div className="text-xs text-gray-600 uppercase font-medium">
                        {startDate.month}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status.charAt(0).toUpperCase() +
                          event.status.slice(1)}
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {event.featured && (
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-medium">
                          <Star size={12} fill="currentColor" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock size={16} />
                        <span>{startDate.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin size={16} />
                        <span className="line-clamp-1">{event.venue.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Users size={16} />
                        <span>
                          {event.currentAttendees} / {event.maxAttendees}{" "}
                          attendees
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {event.ticketsSold || 0}
                        </div>
                        <div className="text-xs text-slate-400">
                          Tickets Sold
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">
                          ₦{(event.totalRevenue || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">Revenue</div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-xl font-bold text-purple-400 mb-4">
                      {formatPrice(event.ticketTypes)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </Link>

                      <Link
                        href={`/my-events/${event._id}/edit`}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        title="Edit Event"
                      >
                        <FilePenLine size={16} />
                      </Link>

                      {/* Check-in button for approved events */}
                      {event.status === "approved" && (
                        <Link
                          href={`/events/${event._id}/checkin`}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          title="Check-in Attendees"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 9h6v6H9z" />
                            <path d="M9 1v6M15 1v6M9 17v6M15 17v6M1 9h6M1 15h6M17 9h6M17 15h6" />
                          </svg>
                        </Link>
                      )}

                      {/* Only show delete button if no tickets have been sold */}
                      {(!event.ticketsSold || event.ticketsSold === 0) && (
                        <button
                          onClick={() => {
                            setEventToDelete(event);
                            setShowDeleteModal(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Event Reference */}
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-gray-500">ID: {event._id}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && currentEvents.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Calendar className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              {searchQuery || selectedStatus !== "all"
                ? "No events found"
                : "No events yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first event to get started"}
            </p>
            {!searchQuery && selectedStatus === "all" && (
              <Link href="/events/create">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  <Plus size={20} />
                  Create Your First Event
                </button>
              </Link>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 mt-12"
          >
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && eventToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Event</h3>
                  <p className="text-slate-400">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                Are you sure you want to delete "{eventToDelete.title}"? This
                will permanently remove the event and all associated data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
