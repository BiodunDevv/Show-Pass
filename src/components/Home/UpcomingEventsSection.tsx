"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, Calendar, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEventStore } from "@/store/useEventStore";

export function UpcomingEventsSection() {
  const [weekdays, setWeekdays] = useState("");
  const [eventType, setEventType] = useState("");
  const [category, setCategory] = useState("");
  const [isClient, setIsClient] = useState(false);

  const { events, fetchEvents, isLoading, error } = useEventStore();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch events only on client side
  useEffect(() => {
    if (!isClient) return;

    const loadEvents = async () => {
      try {
        await fetchEvents({
          page: 1,
          limit: 10,
          sortBy: "startDate",
          sortOrder: "asc",
        });
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };

    loadEvents();
  }, [isClient, fetchEvents]);

  // Filter events based on selected filters
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.startDate);
    const dayOfWeek = eventDate.getDay();

    // Weekdays filter
    if (weekdays === "weekdays" && (dayOfWeek === 0 || dayOfWeek === 6))
      return false;
    if (weekdays === "weekends" && dayOfWeek !== 0 && dayOfWeek !== 6)
      return false;

    // Category filter
    if (category && event.category.toLowerCase() !== category.toLowerCase())
      return false;

    return true;
  });

  const formatPrice = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return "Free";

    const minPrice = Math.min(...ticketTypes.map((t) => t.price));
    const maxPrice = Math.max(...ticketTypes.map((t) => t.price));

    if (minPrice === 0 && maxPrice === 0) return "Free";
    if (minPrice === maxPrice) return `₦${minPrice.toLocaleString()}`;
    return `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  };

  const getEventImage = (event: any) => {
    // Use a default image based on category if no image provided
    const categoryImages = {
      Technology:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      Music:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      Business:
        "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=300&fit=crop",
      Food: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      Fashion:
        "https://images.unsplash.com/photo-1469334031218-e38989a2e8c0?w=400&h=300&fit=crop",
      Entertainment:
        "https://images.unsplash.com/photo-1551818255-e382a71b716b?w=400&h=300&fit=crop",
    };

    return (
      event.images?.[0] ||
      categoryImages[event.category as keyof typeof categoryImages] ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
    );
  };

  // Don't render until client-side
  if (!isClient) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-9xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
          <div className="slide-in-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-300">
              Discover amazing events happening across Nigeria
            </p>
          </div>

          <div className="flex flex-wrap gap-4 slide-in-right">
            <select
              value={weekdays}
              onChange={(e) => setWeekdays(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-600 bg-slate-700 text-white hover:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Days</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-600 bg-slate-700 text-white hover:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Music">Music</option>
              <option value="Business">Business</option>
              <option value="Food">Food & Drink</option>
              <option value="Fashion">Fashion</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="h-56 bg-gray-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">
              Error loading events: {error}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event, index) => {
              const dateInfo = formatDate(event.startDate);
              const price = formatPrice(event.ticketTypes);

              return (
                <div
                  key={event._id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-purple-500/30 group slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={getEventImage(event)}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center shadow-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {dateInfo.day}
                      </div>
                      <div className="text-sm text-gray-600 uppercase font-medium">
                        {dateInfo.month}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 border border-purple-500 bg-purple-900/30 text-white px-3 py-1 rounded-full font-semibold shadow-lg">
                      {price}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="h-4 w-4 text-white" />
                        <span className="text-sm">
                          {event.venue.city}, {event.venue.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="h-4 w-4 text-white" />
                        <span className="text-sm">
                          {event.currentAttendees} / {event.maxAttendees}{" "}
                          attendees
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="h-4 w-4 text-white" />
                        <span className="text-sm">{event.category}</span>
                      </div>
                    </div>
                    <Link
                      href={`/events/${event._id}`}
                      className="block w-full mt-4 px-4 py-2 border border-purple-500 bg-purple-900 text-white text-center rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 text-lg">
              No events found matching your filters
            </p>
          </div>
        )}

        <div className="text-center mt-16 slide-in-up">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold border border-purple-500 bg-purple-900 text-white shadow-lg shadow-purple-900/20 rounded-full transition-all duration-300 hover:scale-105"
          >
            Load More Events
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in-left {
          animation: slideInLeft 0.6s ease-out;
        }

        .slide-in-right {
          animation: slideInRight 0.6s ease-out;
        }

        .slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
