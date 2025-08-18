"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Search,
  Users,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Hash,
  Clock,
} from "lucide-react";
import { useEventStore } from "@/store/useEventStore";
import type { EventAttendee } from "@/store/useEventStore";
import { API_CONFIG } from "@/lib/api";

interface VerificationResult {
  success: boolean;
  message: string;
  data?: {
    booking?: any;
    event?: any;
    attendee?: any;
    isValid?: boolean;
    imageUrl?: string;
    error?: string;
    user?: any;
    verification?: any;
  } | null;
}

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  // Helper function to format verification code as 3-4-3 pattern
  const format343 = (code: string) => {
    if (code.length <= 3) return code;
    if (code.length <= 7) return `${code.slice(0, 3)}-${code.slice(3)}`;
    return `${code.slice(0, 3)}-${code.slice(3, 7)}-${code.slice(7)}`;
  };

  const {
    currentEvent,
    eventAttendees,
    fetchEventById,
    fetchEventAttendees,
    checkInAttendee,
    verifyEventCode,
    isLoading,
  } = useEventStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "checked-in" | "pending"
  >("all");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsPayload, setDetailsPayload] = useState<any>(null);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [allAttendees, setAllAttendees] = useState<EventAttendee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [codeInput, setCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(
    null
  );
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchAllEventAttendees();
    }
  }, [eventId]);

  // Fetch all event attendees once (no server-side filtering)
  const fetchAllEventAttendees = async () => {
    if (!eventId) return;

    setAttendeesLoading(true);
    try {
      const result = await fetchEventAttendees(eventId);

      console.log("Fetched attendees response:", result);

      if (result?.success && result?.data) {
        // Handle the new API response structure where attendees are nested under data.attendees
        const responseData = result.data as any;
        const attendees = Array.isArray(responseData)
          ? responseData
          : responseData.attendees || [];
        console.log("Processing attendees:", attendees);
        setAllAttendees(attendees);
      }
    } catch (error) {
      console.error("Failed to fetch attendees:", error);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!codeInput.trim() || !eventId) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyEventCode(eventId, codeInput.trim());
      setVerifyResult({
        success: res.success,
        message: res.message,
        data: res.data,
      });
      // Refresh list to reflect status
      await fetchAllEventAttendees();
      setCodeInput("");
      if (res?.success && res?.data) {
        setDetailsPayload(res.data);
        setIsVerifyModalOpen(false);
        setIsDetailsModalOpen(true);
      }
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err?.message || "Verification failed",
        data: null,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching

    // Add loading state with delay to mimic database fetching
    if (value.trim()) {
      setSearchLoading(true);
      // Simulate database search delay
      setTimeout(() => {
        setSearchLoading(false);
      }, 1500); // 1.5 second delay
    } else {
      setSearchLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value as any);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const exportAttendeesCSV = async () => {
    if (!eventId) return;
    setExportingCSV(true);
    const header = [
      "#",
      "Name",
      "Email",
      "Phone",
      "Ticket Type",
      "Status",
      "Checked In At",
      "Verification Code",
      "Ticket Number",
    ];
    const rows: string[] = [];
    rows.push(header.join(","));

    try {
      // Use filtered attendees for export
      filteredAttendees.forEach((attendee: EventAttendee, idx: number) => {
        const cells = [
          idx + 1,
          attendee.name,
          attendee.email,
          attendee.phone,
          attendee.ticketType,
          attendee.isCheckedIn ? "Checked In" : "Pending",
          attendee.checkInTime
            ? new Date(attendee.checkInTime).toISOString()
            : "",
          attendee.verificationCode,
          attendee.ticketNumber,
        ]
          .map((v) => String(v).replace(/"/g, '""'))
          .map((v) => (v.includes(",") ? `"${v}` + `"` : v));
        rows.push(cells.join(","));
      });

      const blob = new Blob([rows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExportingCSV(false);
    }
  };

  const exportAttendeesPDF = async () => {
    if (!eventId) return;
    setExportingPDF(true);
    // dynamic imports to avoid SSR/type issues
    const jsPDFModule: any = await import("jspdf");
    const JsPDFCtor = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;
    const autoTable: any = (await import("jspdf-autotable")).default;

    const doc = new JsPDFCtor({ orientation: "landscape", unit: "pt" });

    const title = currentEvent?.title || "Event Attendees";
    doc.setFontSize(18);
    doc.text(title, 40, 40);
    doc.setFontSize(11);
    const metaLeft = [`Generated: ${new Date().toLocaleString()}`];
    const metaRight = [
      `Filter: ${filterStatus}`,
      `Search: ${searchQuery.trim() || "-"}`,
      `Total: ${stats.total} | Checked: ${stats.checkedIn} | Pending: ${stats.pending}`,
    ];
    doc.text(metaLeft.join("  "), 40, 60);
    doc.text(
      metaRight.join("    "),
      doc.internal.pageSize.getWidth() - 40,
      60,
      { align: "right" }
    );

    const head = [
      [
        "#",
        "Name",
        "Email",
        "Phone",
        "Ticket Type",
        "Status",
        "Checked In At",
        "Verification Code",
        "Ticket Number",
      ],
    ];
    const body: any[] = [];

    try {
      // Use filtered attendees for export
      filteredAttendees.forEach((attendee: EventAttendee, idx: number) => {
        body.push([
          idx + 1,
          attendee.name,
          attendee.email,
          attendee.phone,
          attendee.ticketType,
          attendee.isCheckedIn ? "Checked In" : "Pending",
          attendee.checkInTime
            ? new Date(attendee.checkInTime).toLocaleString()
            : "",
          attendee.verificationCode,
          attendee.ticketNumber,
        ]);
      });

      autoTable(doc, {
        head,
        body,
        startY: 80,
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [51, 65, 85] },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 5) {
            const val = String(data.cell.raw || "").toLowerCase();
            if (val.includes("checked")) {
              data.cell.styles.textColor = [34, 197, 94]; // green
            } else if (val.includes("pending")) {
              data.cell.styles.textColor = [250, 204, 21]; // yellow
            }
          }
        },
      });

      const safe = (currentEvent?.title || "attendees").replace(
        /[^a-z0-9-_]+/gi,
        "-"
      );
      doc.save(`${safe}-attendees.pdf`);
    } finally {
      setExportingPDF(false);
    }
  };

  // Filter attendees based on search and status (local filtering)
  const filteredAttendees = allAttendees.filter((attendee: EventAttendee) => {
    const matchesSearch =
      !searchQuery.trim() ||
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "checked-in" && attendee.isCheckedIn) ||
      (filterStatus === "pending" && !attendee.isCheckedIn);

    return matchesSearch && matchesStatus;
  });
  // Calculate stats from filtered data
  const stats = {
    total: allAttendees.length,
    checkedIn: allAttendees.filter((a: EventAttendee) => a.isCheckedIn).length,
    pending: allAttendees.filter((a: EventAttendee) => !a.isCheckedIn).length,
    confirmed: allAttendees.filter(
      (a: EventAttendee) => a.bookingStatus === "confirmed"
    ).length,
    used: allAttendees.filter((a: EventAttendee) => a.bookingStatus === "used")
      .length,
    bookingPending: allAttendees.filter(
      (a: EventAttendee) => a.bookingStatus === "pending"
    ).length,
    other: allAttendees.filter(
      (a: EventAttendee) =>
        !["confirmed", "used", "pending"].includes(a.bookingStatus)
    ).length,
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttendees = filteredAttendees.slice(startIndex, endIndex);

  // Process attendees for display with proper numbering for pagination
  const processedAttendees = paginatedAttendees.map(
    (attendee: EventAttendee, index: number) => ({
      ...attendee,
      displayNumber: startIndex + index + 1, // Proper numbering across pages
    })
  );

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
            <div>
              <button
                onClick={() => setIsVerifyModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Verify by Code
              </button>
            </div>
          </div>
        </div>

        {/* Verify Modal */}
        {isVerifyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-purple-400" /> Verify by
                  Code
                </h3>
                <button
                  onClick={() => {
                    setIsVerifyModalOpen(false);
                    setCodeInput("");
                    setVerifyResult(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Enter Verification Code
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="e.g. 8988522467"
                    value={codeInput}
                    onChange={(e) =>
                      setCodeInput(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {codeInput && (
                  <p className="mt-2 text-xs text-gray-400">
                    Preview:{" "}
                    <span className="font-mono text-gray-200">
                      {format343(codeInput)}
                    </span>
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleVerifyCode}
                    disabled={verifying || !codeInput || !eventId}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-gray-400 text-xs">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-gray-400 text-xs">Checked In</p>
                <p className="text-xl font-bold text-white">
                  {stats.checkedIn}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="text-gray-400 text-xs">Check-in Pending</p>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-gray-400 text-xs">Confirmed</p>
                <p className="text-xl font-bold text-white">
                  {stats.confirmed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-gray-400 text-xs">Used</p>
                <p className="text-xl font-bold text-white">{stats.used}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        {(stats.bookingPending > 0 || stats.other > 0) && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-orange-400 font-medium mb-1">
                  Booking Status Notice
                </h3>
                <p className="text-orange-300 text-sm">
                  {stats.bookingPending > 0 && (
                    <>
                      {stats.bookingPending} attendee
                      {stats.bookingPending > 1 ? "s have" : " has"} pending
                      booking status.{" "}
                    </>
                  )}
                  {stats.other > 0 && (
                    <>
                      {stats.other} attendee
                      {stats.other > 1 ? "s have" : " has"} other booking
                      statuses.{" "}
                    </>
                  )}
                  Attendees with "Confirmed" and "Used" booking statuses can
                  check in using QR codes or verification codes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                </div>
              )}
              <input
                type="text"
                placeholder="Search by attendee name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Attendees</option>
                <option value="checked-in">Checked In</option>
                <option value="pending">Pending</option>
              </select>

              <button
                onClick={exportAttendeesCSV}
                disabled={exportingCSV || exportingPDF}
                className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <Download
                  className={`h-4 w-4 ${exportingCSV ? "animate-bounce" : ""}`}
                />
                {exportingCSV ? "Exporting CSV..." : "Export CSV"}
              </button>
              <button
                onClick={exportAttendeesPDF}
                disabled={exportingPDF || exportingCSV}
                className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <Download
                  className={`h-4 w-4 ${exportingPDF ? "animate-bounce" : ""}`}
                />
                {exportingPDF ? "Exporting PDF..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              Attendees (
              {attendeesLoading
                ? "..."
                : `${filteredAttendees.length} of ${allAttendees.length}`}
              )
            </h3>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-gray-300 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {attendeesLoading || searchLoading ? (
            <div className="py-4">
              <div className="animate-pulse">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="px-4 py-4 border-b border-slate-700 flex items-center gap-4"
                  >
                    <div className="h-4 w-10 bg-slate-700 rounded" />
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div className="h-4 bg-slate-700 rounded w-2/3" />
                      <div className="h-4 bg-slate-700 rounded w-1/2" />
                      <div className="h-4 bg-slate-700 rounded w-1/3" />
                    </div>
                    <div className="h-6 w-20 bg-slate-700 rounded-full" />
                  </div>
                ))}
              </div>
              {searchLoading && (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">
                    Searching attendees...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Attendee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ticket Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Booking Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Check-in Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {processedAttendees.map(
                      (attendee: EventAttendee & { displayNumber: number }) => (
                        <tr
                          key={`${attendee.bookingId}-${attendee.ticketNumber}`}
                          className="hover:bg-slate-700/50"
                        >
                          <td className="px-4 py-4">
                            <span className="text-gray-400 font-mono text-sm">
                              {attendee.displayNumber
                                .toString()
                                .padStart(3, "0")}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-white font-medium">
                                {attendee.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {attendee.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-gray-300">
                              {attendee.ticketType}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-purple-300 font-mono text-sm">
                              {attendee.phone || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-left">
                              <span className="text-green-400 font-semibold">
                                ₦{attendee.totalAmount.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                attendee.bookingStatus === "confirmed"
                                  ? "bg-green-500/20 text-green-400"
                                  : attendee.bookingStatus === "used"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : attendee.bookingStatus === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {attendee.bookingStatus === "confirmed" ? (
                                <>
                                  <ShieldCheck className="h-3 w-3" />
                                  Confirmed
                                </>
                              ) : attendee.bookingStatus === "used" ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Used
                                </>
                              ) : attendee.bookingStatus === "pending" ? (
                                <>
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  {attendee.bookingStatus}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                attendee.isCheckedIn
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {attendee.isCheckedIn ? (
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
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

                {processedAttendees.length === 0 && !attendeesLoading && (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {filteredAttendees.length === 0 && allAttendees.length > 0
                        ? "No attendees match your search/filter criteria"
                        : "No attendees found"}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && !attendeesLoading && (
                <div className="p-4 border-t border-slate-700 flex justify-between items-center">
                  <div className="text-gray-400 text-sm">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredAttendees.length)} of{" "}
                    {filteredAttendees.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-gray-300 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Success Details Modal */}
      {isDetailsModalOpen && detailsPayload && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative p-6 border-b border-slate-800">
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 to-blue-600/10 blur-xl" />
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">
                      Verification Successful
                    </h3>
                    <p className="text-sm text-gray-400">
                      {detailsPayload?.event?.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setDetailsPayload(null);
                  }}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendee */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
                <p className="text-gray-400 text-xs mb-1">Attendee</p>
                <p className="text-white font-medium">
                  {detailsPayload?.attendee?.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {detailsPayload?.attendee?.email}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Phone</p>
                    <p className="text-gray-200">
                      {detailsPayload?.attendee?.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Ticket No.</p>
                    <p className="text-gray-200">
                      #{detailsPayload?.attendee?.ticketNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
                <p className="text-gray-400 text-xs mb-1">Event</p>
                <p
                  className="text-white font-medium line-clamp-2"
                  title={detailsPayload?.event?.title}
                >
                  {detailsPayload?.event?.title}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Start</p>
                    <p className="text-gray-200">
                      {detailsPayload?.event?.startDate
                        ? new Date(
                            detailsPayload.event.startDate
                          ).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Venue</p>
                    <p className="text-gray-200">
                      {detailsPayload?.event?.venue?.name || "-"}
                    </p>
                  </div>
                </div>
                {detailsPayload?.event?.venue?.address && (
                  <p className="mt-2 text-gray-400 text-xs">
                    {detailsPayload.event.venue.address}
                  </p>
                )}
              </div>

              {/* Booking */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
                <p className="text-gray-400 text-xs mb-1">Booking</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Reference</p>
                    <p className="text-purple-300 font-mono break-all">
                      {detailsPayload?.booking?.paymentReference || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Status</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        detailsPayload?.booking?.status === "used"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {detailsPayload?.booking?.status || "-"}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Ticket</p>
                    <p className="text-gray-200">
                      {detailsPayload?.booking?.ticketType} ×{" "}
                      {detailsPayload?.booking?.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Check-In Time</p>
                    <p className="text-gray-200">
                      {detailsPayload?.booking?.checkInTime
                        ? new Date(
                            detailsPayload.booking.checkInTime
                          ).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">All Codes Used</p>
                    <p className="text-gray-200">
                      {detailsPayload?.booking?.allCodesUsed ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
                <p className="text-gray-400 text-xs mb-1">Verification</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Code</p>
                    <p className="text-white font-mono text-lg">
                      {format343(detailsPayload?.verification?.code || "")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Used At</p>
                    <p className="text-gray-200">
                      {detailsPayload?.verification?.usedAt
                        ? new Date(
                            detailsPayload.verification.usedAt
                          ).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Verified By</p>
                    <p className="text-gray-200">
                      {detailsPayload?.verification?.verifiedBy || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setDetailsPayload(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white rounded-lg border border-slate-600 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function format343(code: string) {
  const digits = code.replace(/\D/g, "");
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 7);
  const c = digits.slice(7, 10);
  return [a, b, c].filter(Boolean).join(" ");
}
