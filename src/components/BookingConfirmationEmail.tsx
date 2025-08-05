import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  QrCode,
  CheckCircle,
  Download,
} from "lucide-react";

interface BookingConfirmationEmailProps {
  booking: {
    _id: string;
    paymentReference: string;
    ticketType: string;
    quantity: number;
    finalAmount: number;
    attendeeInfo: Array<{
      name: string;
      email: string;
      phone: string;
    }>;
    qrCodeImage?: string;
    createdAt: string;
  };
  event: {
    title: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    venue: {
      name: string;
      address: string;
      city: string;
      state: string;
    };
    organizer: {
      firstName: string;
      lastName: string;
      email: string;
    };
    images: string[];
  };
}

export default function BookingConfirmationEmail({
  booking,
  event,
}: BookingConfirmationEmailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white text-gray-800 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-purple-100">
          Your tickets for {event.title} have been successfully booked
        </p>
      </div>

      {/* Booking Details */}
      <div className="p-8">
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Booking Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-mono text-lg font-semibold text-purple-600">
                    {booking.paymentReference}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Type</p>
                  <p className="font-semibold">{booking.ticketType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">{booking.quantity} ticket(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    ₦{booking.finalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Event Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(event.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Venue</p>
                    <p className="font-medium">{event.venue.name}</p>
                    <p className="text-sm text-gray-500">
                      {event.venue.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.venue.city}, {event.venue.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendee Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Attendee Information
          </h3>
          <div className="space-y-4">
            {booking.attendeeInfo.map((attendee, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-gray-800">
                    Attendee {index + 1}
                  </h4>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{attendee.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{attendee.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{attendee.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code Section */}
        {booking.qrCodeImage && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-800">
                Your Ticket QR Code
              </h3>
            </div>
            <div className="bg-white rounded-lg p-6 inline-block mb-4">
              <img
                src={booking.qrCodeImage}
                alt="Ticket QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-gray-600 mb-4">
              Show this QR code at the event entrance for quick check-in
            </p>
            <p className="text-sm text-gray-500">
              You can also download this QR code from your ShowPass dashboard
            </p>
          </div>
        )}

        {/* Important Information */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">
            Important Information
          </h3>
          <ul className="space-y-2 text-yellow-700">
            <li>• Please arrive at least 30 minutes before the event starts</li>
            <li>• Bring a valid ID for verification if required</li>
            <li>
              • This ticket is non-transferable and non-refundable after 24
              hours
            </li>
            <li>• Save this email and QR code for easy access at the venue</li>
            <li>
              • Contact the organizer if you have any questions about the event
            </li>
          </ul>
        </div>

        {/* Organizer Contact */}
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-800 mb-3">
            Event Organizer
          </h3>
          <p className="text-purple-700 mb-2">
            <strong>
              {event.organizer.firstName} {event.organizer.lastName}
            </strong>
          </p>
          <p className="text-purple-600">{event.organizer.email}</p>
          <p className="text-sm text-purple-600 mt-2">
            For event-related inquiries, please contact the organizer directly.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-6 text-center text-gray-600">
        <p className="mb-2">Thank you for choosing ShowPass!</p>
        <p className="text-sm">
          This is an automated email. Please do not reply to this message.
        </p>
        <p className="text-sm mt-2">© 2025 ShowPass. All rights reserved.</p>
      </div>
    </div>
  );
}
