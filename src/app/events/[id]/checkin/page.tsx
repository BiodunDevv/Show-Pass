"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Camera,
  Edit3,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useEventStore } from "@/store/useEventStore";
import { QRScanner, ManualQREntry } from "@/components/QRScanner";

export default function EventCheckInPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const {
    currentEvent,
    eventAttendees,
    fetchEventById,
    fetchEventAttendees,
    verifyQRCode,
    checkInAttendee,
    isLoading,
    error,
  } = useEventStore();

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "checked-in" | "pending"
  >("all");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchEventAttendees(eventId);
    }
  }, [eventId, fetchEventById, fetchEventAttendees]);

  const handleQRScan = async (qrData: string) => {
    try {
      setShowQRScanner(false);
      setShowManualEntry(false);

      const result = await verifyQRCode(qrData);
      setVerificationResult(result);

      if (result.success && result.data?.isValid) {
        // Automatically check in if QR is valid
        await checkInAttendee(result.data.booking._id);
        // Refresh attendees list
        fetchEventAttendees(eventId);
      }
    } catch (error) {
      console.error("QR verification failed:", error);
    }
  };

  const handleManualCheckIn = async (bookingId: string) => {
    try {
      await checkInAttendee(bookingId);
      fetchEventAttendees(eventId);
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  const filteredAttendees = eventAttendees.filter((attendee) => {
    const matchesSearch =
      attendee.user.firstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      attendee.user.lastName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      attendee.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.bookingReference
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "checked-in" && attendee.checkedIn) ||
      (filterStatus === "pending" && !attendee.checkedIn);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: eventAttendees.length,
    checkedIn: eventAttendees.filter((a) => a.checkedIn).length,
    pending: eventAttendees.filter((a) => !a.checkedIn).length,
  };

  if (isLoading && !currentEvent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-gray-400">
            The event you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Event Check-In
              </h1>
              <h2 className="text-xl text-gray-300">{currentEvent.title}</h2>
              <p className="text-gray-400">
                {new Date(currentEvent.startDate).toLocaleDateString()} •{" "}
                {currentEvent.venue.name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQRScanner(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Camera className="h-4 w-4" />
                Scan QR
              </button>

              <button
                onClick={() => setShowManualEntry(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Manual Entry
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Attendees</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Checked In</p>
                <p className="text-2xl font-bold text-white">
                  {stats.checkedIn}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, or booking reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Attendees</option>
                <option value="checked-in">Checked In</option>
                <option value="pending">Pending</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-gray-300 hover:bg-slate-700 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              verificationResult.success && verificationResult.data?.isValid
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationResult.success &&
              verificationResult.data?.isValid ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    verificationResult.success &&
                    verificationResult.data?.isValid
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {verificationResult.message}
                </p>
                {verificationResult.data?.attendee && (
                  <p className="text-gray-300 text-sm">
                    {verificationResult.data.attendee.firstName}{" "}
                    {verificationResult.data.attendee.lastName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setVerificationResult(null)}
              className="mt-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Attendees List */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">
              Attendees ({filteredAttendees.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ticket Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee._id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {attendee.user.firstName} {attendee.user.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {attendee.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-300">
                        {attendee.ticketType.name}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-purple-400 text-sm">
                        {attendee.bookingReference}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          attendee.checkedIn
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {attendee.checkedIn ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Checked In
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {!attendee.checkedIn && (
                        <button
                          onClick={() => handleManualCheckIn(attendee._id)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      {attendee.checkedIn && attendee.checkedInAt && (
                        <span className="text-gray-400 text-sm">
                          {new Date(attendee.checkedInAt).toLocaleString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAttendees.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendees found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />

      {/* Manual QR Entry Modal */}
      <ManualQREntry
        isOpen={showManualEntry}
        onSubmit={handleQRScan}
        onClose={() => setShowManualEntry(false)}
      />
    </div>
  );
}
