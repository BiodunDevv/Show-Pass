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
  Download,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Ticket,
  AlertCircle,
  Search,
  Filter,
  Eye,
  X,
} from "lucide-react";
import { useBookingStore, type Booking } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const {
    userBookings,
    isLoading,
    error,
    meta,
    fetchUserBookings,
    clearError,
  } = useBookingStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [selectedBookingQRs, setSelectedBookingQRs] = useState<any[]>([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedBookingForDownload, setSelectedBookingForDownload] =
    useState<Booking | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !token) {
      router.push("/auth/signin");
      return;
    }
  }, [user, token, router]);

  // Fetch user bookings
  useEffect(() => {
    if (user && token) {
      fetchUserBookings(currentPage, 6);
    }
  }, [user, token, currentPage, fetchUserBookings]);

  // Filter bookings based on search and status
  const filteredBookings = userBookings.filter((booking) => {
    const matchesSearch =
      searchQuery === "" ||
      booking.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.ticketType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      booking.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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

  const formatPrice = (amount: number) => {
    if (amount === 0) return "Free";
    return `₦${amount.toLocaleString()}`;
  };

  const handleDownloadTicket = (booking: Booking) => {
    setSelectedBookingForDownload(booking);
    setShowDownloadModal(true);
  };

  const downloadQRCode = async (
    qrImageUrl: string,
    attendeeName: string,
    eventTitle: string
  ) => {
    try {
      // Create a canvas to generate a nice QR code with details
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = 600;
      canvas.height = 700;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw QR code
      const qrImage = new window.Image();
      qrImage.crossOrigin = "anonymous";

      qrImage.onload = () => {
        // Header background
        ctx.fillStyle = "#7c3aed";
        ctx.fillRect(0, 0, canvas.width, 100);

        // ShowPass title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🎟️ ShowPass", canvas.width / 2, 40);
        ctx.font = "16px Arial";
        ctx.fillText("Digital Ticket", canvas.width / 2, 70);

        // Event title
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        const maxWidth = canvas.width - 40;
        const words = eventTitle.split(" ");
        let line = "";
        let y = 140;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[n] + " ";
            y += 30;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);

        // Attendee name
        ctx.fillStyle = "#6b7280";
        ctx.font = "16px Arial";
        ctx.fillText(`Attendee: ${attendeeName}`, canvas.width / 2, y + 40);

        // QR Code
        const qrSize = 280;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = y + 70;

        // QR background
        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

        // Draw QR code
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        // Instructions
        ctx.fillStyle = "#6b7280";
        ctx.font = "14px Arial";
        ctx.fillText(
          "Present this QR code at the venue entrance",
          canvas.width / 2,
          qrY + qrSize + 60
        );

        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `showpass-ticket-${attendeeName.replace(
              /\s+/g,
              "-"
            )}-${eventTitle.replace(/\s+/g, "-")}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      };

      qrImage.src = qrImageUrl;
    } catch (error) {
      console.error("Failed to download QR code:", error);
      // Fallback: direct download
      const link = document.createElement("a");
      link.download = `showpass-ticket-${attendeeName.replace(
        /\s+/g,
        "-"
      )}.png`;
      link.href = qrImageUrl;
      link.click();
    }
  };

  const showQRCode = (booking: Booking) => {
    if (booking.individualQRs && booking.individualQRs.length > 0) {
      setSelectedBookingQRs(booking.individualQRs);
      setSelectedQR(booking.individualQRs[0].qrCodeImage);
      setSelectedAttendee(booking.individualQRs[0].attendee.name);
    } else {
      setSelectedBookingQRs([]);
      setSelectedQR(booking.qrCodeImage);
      setSelectedAttendee("Main Ticket");
    }
    setShowQRModal(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/30 text-sm text-purple-300 backdrop-blur-sm">
              <Ticket className="mr-2" size={16} />
              Your Tickets
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              My Tickets
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              View and manage all your event tickets in one place
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search tickets..."
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
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
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
              <h3 className="text-red-300 font-medium">
                Error loading tickets
              </h3>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => {
                clearError();
                fetchUserBookings(currentPage, 6);
              }}
              className="ml-auto px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
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

        {/* Tickets Grid */}
        {!isLoading && filteredBookings.length > 0 && (
          <motion.div
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredBookings.map((booking) => {
              const startDate = formatDate(booking.event.startDate);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={booking.event.images[0] || "/placeholder.jpg"}
                      alt={booking.event.title}
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : booking.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {booking.statusDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {booking.event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock size={16} />
                        <span>{startDate.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin size={16} />
                        <span className="line-clamp-1">
                          {booking.event.venue.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Ticket size={16} />
                        <span>
                          {booking.ticketType} x {booking.quantity}
                        </span>
                      </div>
                      {booking.individualQRs &&
                        booking.individualQRs.length > 0 && (
                          <div className="text-xs text-purple-300 bg-purple-500/10 rounded-lg p-2 mt-2">
                            <div className="font-medium mb-1">Attendees:</div>
                            <div className="space-y-1">
                              {booking.individualQRs
                                .slice(0, 2)
                                .map((qr, index) => (
                                  <div
                                    key={`${qr.attendeeId}-${index}`}
                                    className="text-gray-400"
                                  >
                                    • {qr.attendee.name}
                                  </div>
                                ))}
                              {booking.individualQRs.length > 2 && (
                                <div className="text-gray-400">
                                  • +{booking.individualQRs.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="text-2xl font-bold text-purple-400 mb-4">
                      {formatPrice(booking.finalAmount)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/my-tickets/${booking.id}`}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </Link>

                      <button
                        onClick={() => showQRCode(booking)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                        title="Show QR Code"
                      >
                        <QrCode size={16} />
                      </button>

                      <button
                        onClick={() => handleDownloadTicket(booking)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                        title="Download Ticket"
                      >
                        <Download size={16} />
                      </button>
                    </div>

                    {/* Booking Reference */}
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-gray-500">
                        Ref: {booking.paymentReference}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBookings.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Ticket className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              {searchQuery || selectedStatus !== "all"
                ? "No tickets found"
                : "No tickets yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by booking your first event ticket"}
            </p>
            {!searchQuery && selectedStatus === "all" && (
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Calendar size={20} />
                Browse Events
              </Link>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && meta && meta.pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
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
              {[...Array(meta.pagination.pages)].map((_, i) => {
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
              disabled={currentPage === meta.pagination.pages}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {selectedBookingQRs.length > 0
                  ? "Attendee QR Codes"
                  : "QR Code"}
              </h3>

              {/* Attendee Selection for Multiple QRs */}
              {selectedBookingQRs.length > 0 && (
                <div className="mb-4 text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Attendee:
                  </label>
                  <select
                    value={selectedQR}
                    onChange={(e) => {
                      const selectedQRData = selectedBookingQRs.find(
                        (qr) => qr.qrCodeImage === e.target.value
                      );
                      setSelectedQR(e.target.value);
                      setSelectedAttendee(selectedQRData?.attendee.name || "");
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  >
                    {selectedBookingQRs.map((qr, index) => (
                      <option
                        key={`${qr.attendeeId}-option-${index}`}
                        value={qr.qrCodeImage}
                      >
                        {qr.attendee.name} ({qr.attendee.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <Image
                  src={selectedQR}
                  alt={`QR Code for ${selectedAttendee}`}
                  width={300}
                  height={300}
                  className="mx-auto"
                />
              </div>

              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">
                  QR Code for:{" "}
                  <span className="font-medium">{selectedAttendee}</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Present this QR code at the venue entrance
                </p>
              </div>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {showDownloadModal && selectedBookingForDownload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDownloadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Download Ticket
                </h3>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedBookingForDownload.event.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  Select which attendee's ticket to download:
                </p>
              </div>

              <div className="space-y-3">
                {selectedBookingForDownload.individualQRs &&
                selectedBookingForDownload.individualQRs.length > 0 ? (
                  selectedBookingForDownload.individualQRs.map((qr, index) => (
                    <button
                      key={`${qr.attendeeId}-download-${index}`}
                      onClick={() => {
                        downloadQRCode(
                          qr.qrCodeImage,
                          qr.attendee.name,
                          selectedBookingForDownload.event.title
                        );
                        setShowDownloadModal(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <QrCode className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {qr.attendee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {qr.attendee.email}
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-gray-400 ml-auto" />
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => {
                      downloadQRCode(
                        selectedBookingForDownload.qrCodeImage,
                        "Main Ticket",
                        selectedBookingForDownload.event.title
                      );
                      setShowDownloadModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <QrCode className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Main Ticket
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedBookingForDownload.ticketType}
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-gray-400 ml-auto" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
