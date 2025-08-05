"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  QrCode,
  ArrowLeft,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Share2,
  Copy,
  Check,
  X,
  Navigation,
  Users,
  Ticket,
  Star,
} from "lucide-react";
import { useBookingStore, type Booking } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { currentBooking, isLoading, error, fetchBookingById, clearError } =
    useBookingStore();

  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedQR, setSelectedQR] = useState<string>("");
  const [selectedAttendee, setSelectedAttendee] = useState<string>("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !token) {
      router.push("/auth/signin");
      return;
    }
  }, [user, token, router]);

  // Fetch booking details
  useEffect(() => {
    if (params.id && typeof params.id === "string" && user && token) {
      fetchBookingById(params.id);
    }
  }, [params.id, user, token, fetchBookingById]);

  // Update local state when booking is fetched
  useEffect(() => {
    if (currentBooking) {
      setBooking(currentBooking);
    }
  }, [currentBooking]);

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

  const getStatusIcon = (status: string, paymentStatus: string) => {
    if (status === "confirmed" && paymentStatus === "paid") {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else if (status === "pending" || paymentStatus === "pending") {
      return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: string, paymentStatus: string) => {
    if (status === "confirmed" && paymentStatus === "paid") {
      return "bg-green-500/20 text-green-300 border-green-500/30";
    } else if (status === "pending" || paymentStatus === "pending") {
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    } else {
      return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  const handleDownloadTicket = () => {
    if (!booking) return;

    const ticketContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>ShowPass Ticket - ${booking.event.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            .ticket {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              position: relative;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .ticket-title { font-size: 18px; opacity: 0.9; }
            .content {
              display: grid;
              grid-template-columns: 1fr 300px;
              min-height: 400px;
            }
            .left-section {
              padding: 40px;
              display: flex;
              flex-direction: column;
            }
            .event-title {
              font-size: 28px;
              font-weight: bold;
              color: #333;
              margin-bottom: 20px;
              line-height: 1.3;
            }
            .event-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .detail-item {
              display: flex;
              align-items: flex-start;
              gap: 12px;
            }
            .detail-content h4 {
              font-size: 14px;
              color: #666;
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .detail-content p {
              font-size: 16px;
              color: #333;
              font-weight: 600;
            }
            .right-section {
              background: #f8f9ff;
              padding: 40px 30px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              border-left: 2px dashed #ddd;
            }
            .qr-code {
              width: 200px;
              height: 200px;
              border: 4px solid white;
              border-radius: 15px;
              margin-bottom: 20px;
              box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            .booking-ref {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
            }
            .ref-number {
              font-size: 16px;
              font-weight: bold;
              color: #333;
              margin-bottom: 20px;
              letter-spacing: 1px;
            }
            .status-badge {
              background: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 40px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="logo">🎟️ ShowPass</div>
              <div class="ticket-title">Your Digital Ticket</div>
            </div>
            
            <div class="content">
              <div class="left-section">
                <h1 class="event-title">${booking.event.title}</h1>
                
                <div class="event-details">
                  <div class="detail-item">
                    <div class="detail-content">
                      <h4>Date</h4>
                      <p>${formatDate(booking.event.startDate).fullDate}</p>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-content">
                      <h4>Time</h4>
                      <p>${formatDate(booking.event.startDate).time}</p>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-content">
                      <h4>Venue</h4>
                      <p>${booking.event.venue.name}</p>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-content">
                      <h4>Ticket Type</h4>
                      <p>${booking.ticketType}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="right-section">
                <img src="${
                  booking.qrCodeImage
                }" alt="QR Code" class="qr-code" />
                <div class="booking-ref">Booking Reference</div>
                <div class="ref-number">${booking.paymentReference}</div>
                <div class="status-badge">${booking.statusDisplay}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Present this ticket at the venue entrance. Keep your booking reference safe.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([ticketContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `showpass-ticket-${booking.paymentReference}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyReference = async () => {
    if (!booking) return;

    try {
      await navigator.clipboard.writeText(booking.paymentReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openGoogleMaps = () => {
    if (!booking) return;
    const { latitude, longitude } = booking.event.venue.coordinates;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-slate-800 rounded-lg mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-32 bg-slate-800 rounded"></div>
                <div className="h-48 bg-slate-800 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-slate-800 rounded"></div>
                <div className="h-48 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Ticket Not Found
            </h1>
            <p className="text-gray-400 mb-8">
              {error || "The ticket you are looking for does not exist."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/my-tickets"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Tickets
              </Link>
              {error && (
                <button
                  onClick={() => {
                    clearError();
                    if (params.id && typeof params.id === "string") {
                      fetchBookingById(params.id);
                    }
                  }}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const startDate = formatDate(booking.event.startDate);
  const endDate = formatDate(booking.event.endDate);

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </motion.button>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8"
        >
          <div className="relative h-64 sm:h-80">
            <Image
              src={booking.event.images[0] || "/placeholder.jpg"}
              alt={booking.event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Event Info Overlay */}
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
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {booking.event.title}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-200">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {startDate.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {booking.event.venue.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                {getStatusIcon(booking.status, booking.paymentStatus)}
                <span className="text-white font-medium">
                  {booking.statusDisplay}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-400" />
                Ticket Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">Ticket Type</span>
                  <span className="text-white font-medium">
                    {booking.ticketType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white font-medium">
                    {booking.quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">Ticket Price</span>
                  <span className="text-white font-medium">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-white font-medium">
                    {formatPrice(booking.platformFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">VAT</span>
                  <span className="text-white font-medium">
                    {formatPrice(booking.vat)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 pt-4">
                  <span className="text-lg font-semibold text-white">
                    Total Paid
                  </span>
                  <span className="text-xl font-bold text-purple-400">
                    {formatPrice(booking.finalAmount)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Payment Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      booking.status,
                      booking.paymentStatus
                    )}`}
                  >
                    {booking.paymentStatus.charAt(0).toUpperCase() +
                      booking.paymentStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">Payment Reference</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm">
                      {booking.paymentReference}
                    </span>
                    <button
                      onClick={handleCopyReference}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Copy Reference"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                  <span className="text-gray-400">Purchase Date</span>
                  <span className="text-white">
                    {formatDate(booking.createdAt).fullDate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Check-in Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      booking.isCheckedIn
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }`}
                  >
                    {booking.isCheckedIn ? "Checked In" : "Not Checked In"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Attendee Information */}
            {booking.attendeeInfo && booking.attendeeInfo.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Attendee Information & QR Codes
                </h2>

                {booking.individualQRs && booking.individualQRs.length > 0 ? (
                  // Display attendees with individual QR codes
                  <div className="space-y-4">
                    {booking.individualQRs.map((qrData, index) => (
                      <div
                        key={qrData.attendeeId}
                        className="bg-slate-700/30 rounded-lg p-4"
                      >
                        {index > 0 && (
                          <div className="border-t border-slate-700/50 -mt-4 mb-4" />
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-purple-400" />
                              <span className="text-white font-medium">
                                {qrData.attendee.name}
                              </span>
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                Attendee {index + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Mail className="h-4 w-4" />
                              <span>{qrData.attendee.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Phone className="h-4 w-4" />
                              <span>{qrData.attendee.phone}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedQR(qrData.qrCodeImage);
                              setSelectedAttendee(qrData.attendee.name);
                              setShowQRModal(true);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                          >
                            <QrCode className="h-4 w-4" />
                            QR Code
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Display single attendee info (fallback)
                  booking.attendeeInfo.map((attendee, index) => (
                    <div key={attendee._id} className="space-y-4">
                      {index > 0 && (
                        <div className="border-t border-slate-700/50 pt-4" />
                      )}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-white font-medium">
                            {attendee.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {attendee.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {attendee.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* QR Code Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5 text-purple-400" />
                {booking.individualQRs && booking.individualQRs.length > 1
                  ? "Entry QR Codes"
                  : "Entry QR Code"}
              </h2>

              {booking.individualQRs && booking.individualQRs.length > 0 ? (
                // Multiple QR codes
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">
                    {booking.individualQRs.length} individual QR codes for each
                    attendee
                  </p>
                  <div className="grid gap-3">
                    {booking.individualQRs.slice(0, 2).map((qrData, index) => (
                      <button
                        key={qrData.attendeeId}
                        onClick={() => {
                          setSelectedQR(qrData.qrCodeImage);
                          setSelectedAttendee(qrData.attendee.name);
                          setShowQRModal(true);
                        }}
                        className="flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                      >
                        <div className="bg-white rounded p-2">
                          <QrCode className="h-6 w-6 text-gray-800" />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {qrData.attendee.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            Click to view QR code
                          </div>
                        </div>
                      </button>
                    ))}
                    {booking.individualQRs.length > 2 && (
                      <div className="text-gray-400 text-sm">
                        +{booking.individualQRs.length - 2} more QR codes
                        available in attendee section
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Single QR code (fallback)
                <div>
                  <div className="bg-white rounded-xl p-4 mb-6 inline-block">
                    <Image
                      src={booking.qrCodeImage}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>

                  <p className="text-gray-400 text-sm mb-6">
                    Present this QR code at the venue entrance for check-in
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedQR(booking.qrCodeImage);
                        setSelectedAttendee("Main Ticket");
                        setShowQRModal(true);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      View Full Size
                    </button>
                    <button
                      onClick={handleDownloadTicket}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Ticket
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Event Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Date & Time</p>
                    <p className="text-white font-medium">
                      {startDate.fullDate}
                    </p>
                    <p className="text-gray-300 text-sm">{startDate.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Venue</p>
                    <p className="text-white font-medium">
                      {booking.event.venue.name}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {booking.event.venue.address}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {booking.event.venue.city}, {booking.event.venue.state}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={openGoogleMaps}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Google Maps
                  </button>
                </div>

                {/* Map Preview */}
                <div className="pt-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Location Preview
                  </h4>
                  <div className="relative w-full h-64 bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/50">
                    <iframe
                      src={`https://maps.google.com/maps?q=${booking.event.venue.coordinates.latitude},${booking.event.venue.coordinates.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={openGoogleMaps}
                        className="bg-white/90 backdrop-blur-sm shadow-lg px-3 py-1.5 rounded text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        View Full Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Link
                  href={`/events/${booking.event.id}`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  View Event Details
                </Link>

                <button
                  onClick={handleCopyReference}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  {copied ? "Reference Copied!" : "Share Ticket"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
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
                Entry QR Code
              </h3>
              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <Image
                  src={selectedQR || booking.qrCodeImage}
                  alt={`QR Code for ${selectedAttendee || "ticket"}`}
                  width={300}
                  height={300}
                  className="mx-auto"
                />
              </div>
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">
                  QR Code for:{" "}
                  <span className="font-medium">
                    {selectedAttendee || "Main Ticket"}
                  </span>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {booking.event.title} - {booking.ticketType}
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
    </div>
  );
}
