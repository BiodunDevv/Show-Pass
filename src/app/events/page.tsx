"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Star,
  X,
  Sparkles,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  LayoutGrid,
  Eye,
  Users,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useEventStore } from "@/store/useEventStore";

// Available categories for filtering
const categories = [
  { id: "all", name: "All", icon: "🎯", count: 0 },
  { id: "featured", name: "Featured", icon: "⭐", count: 0 },
  { id: "Technology", name: "Technology", icon: "💻", count: 0 },
  { id: "Music", name: "Music", icon: "🎵", count: 0 },
  { id: "Business", name: "Business", icon: "💼", count: 0 },
  { id: "Food", name: "Food & Drink", icon: "🍽️", count: 0 },
  { id: "Fashion", name: "Fashion", icon: "👗", count: 0 },
  { id: "Entertainment", name: "Entertainment", icon: "🎭", count: 0 },
  { id: "Sports", name: "Sports", icon: "⚽", count: 0 },
  { id: "Education", name: "Education", icon: "📚", count: 0 },
  { id: "Health", name: "Health & Wellness", icon: "🏥", count: 0 },
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEventHovered, setIsEventHovered] = useState<string | null>(null);

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
          limit: 50,
          sortBy: "startDate",
          sortOrder: "asc",
        });
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };

    loadEvents();
  }, [isClient, fetchEvents]);

  // Get all unique tags/categories across events (if events have tags)
  const allTags = Array.from(
    new Set(events.flatMap((event) => event.tags || []))
  ).sort();

  // Update category counts
  const categoriesWithCounts = categories.map((category) => {
    let count = 0;
    if (category.id === "all") {
      count = events.length;
    } else if (category.id === "featured") {
      count = events.filter((event) => event.featured).length;
    } else {
      count = events.filter((event) => event.category === category.id).length;
    }
    return { ...category, count };
  });

  // Filter events based on active category, search query, and selected tags
  const filteredEvents = events.filter((event) => {
    // Filter by category
    if (
      selectedCategory !== "all" &&
      selectedCategory !== "featured" &&
      event.category !== selectedCategory
    ) {
      return false;
    }

    // Filter for featured events
    if (selectedCategory === "featured" && !event.featured) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        (event.tags &&
          event.tags.some((tag) => tag.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;
    }

    // Filter by selected tags
    if (selectedTags.length > 0 && event.tags) {
      const matchesTags = selectedTags.some((tag) => event.tags.includes(tag));
      if (!matchesTags) return false;
    }

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
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const getEventImage = (event: any) => {
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
      Sports:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      Education:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
      Health:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
    };

    return (
      event.images?.[0] ||
      categoryImages[event.category as keyof typeof categoryImages] ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  // Don't render until client-side
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="relative z-10 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-9xl mx-auto px-2 sm:px-4 md:px-6">
          {/* Header section */}
          <div className="mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/30 text-xs sm:text-sm text-purple-300 backdrop-blur-sm">
                <CalendarIcon
                  size={14}
                  className="mr-1.5 sm:mr-2"
                  fill="currentColor"
                />
                Discover Amazing Events
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-2">
                Find Your Perfect Event
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed px-4">
                From concerts to conferences, discover amazing events happening
                near you. Connect with your community and create lasting
                memories.
              </p>
            </motion.div>

            {/* Search and filters bar */}
            <motion.div
              className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Search input and filter button container */}
              <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center max-w-2xl">
                {/* Search input */}
                <div className="relative w-full sm:flex-1 sm:max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[#2E313C] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-gray-200 bg-[#1E2132]/70 backdrop-blur-sm shadow-lg placeholder-gray-500 transition-all duration-300 text-sm sm:text-base"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors z-10"
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </div>

                {/* Filter button */}
                <div className="relative sm:flex-shrink-0">
                  <motion.button
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 w-full sm:w-auto text-sm sm:text-base ${
                      isFilterMenuOpen || selectedTags.length > 0
                        ? "border-purple-500 bg-purple-900/30 text-purple-300 shadow-lg shadow-purple-900/20"
                        : "border-[#2E313C] bg-[#1E2132]/70 text-gray-300 hover:bg-[#2E313C]/80 hover:border-purple-500/30"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span className="font-medium">Filters</span>
                    {selectedTags.length > 0 && (
                      <span className="bg-purple-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                        {selectedTags.length}
                      </span>
                    )}
                  </motion.button>

                  {/* Filter dropdown menu */}
                  <AnimatePresence>
                    {isFilterMenuOpen && allTags.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 sm:left-0 bg-[#1E2132] rounded-xl shadow-lg border border-[#2E313C] w-64 sm:w-72 z-20 overflow-hidden"
                      >
                        <div className="p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-200 text-sm sm:text-base">
                              Filter by Tags
                            </h3>
                            {selectedTags.length > 0 && (
                              <button
                                onClick={() => setSelectedTags([])}
                                className="text-xs text-purple-400 hover:text-purple-300"
                              >
                                Clear all
                              </button>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                            {allTags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                  selectedTags.includes(tag)
                                    ? "border-purple-500 bg-purple-900/30 text-purple-300 shadow-lg shadow-purple-900/20"
                                    : "bg-[#262A3E] text-gray-300 hover:bg-[#2E313C]"
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-[#2E313C] p-3 bg-[#181B2B] flex justify-end">
                          <button
                            onClick={() => setIsFilterMenuOpen(false)}
                            className="px-3 py-1.5 text-sm font-medium text-purple-400 hover:text-purple-300"
                          >
                            Done
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Minimal Category Pills */}
            <motion.div
              className="mt-4 sm:mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center justify-center">
                {categoriesWithCounts.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? "border border-purple-500 bg-purple-900/30 text-purple-300 shadow-lg shadow-purple-900/20"
                        : "bg-[#2E313C]/50 text-gray-300 hover:bg-[#2E313C]/80 hover:text-white border border-[#3E4154]/50 hover:border-purple-500/30"
                    }`}
                  >
                    <span
                      className="text-xs sm:text-sm"
                      role="img"
                      aria-label={category.name}
                    >
                      {category.icon}
                    </span>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">
                      {category.name.length > 8
                        ? category.name.substring(0, 8) + "..."
                        : category.name}
                    </span>
                    <span
                      className={`text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
                        selectedCategory === category.id
                          ? "bg-white/20 text-white/80"
                          : "bg-gray-600/30 text-gray-400"
                      }`}
                    >
                      {category.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Events grid display */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-12 sm:py-20">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                <div className="absolute inset-0 border-t-2 border-r-2 border-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 border-2 border-[#2E313C] rounded-full"></div>
                <LayoutGrid
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500"
                  size={20}
                />
              </div>
              <p className="text-gray-400 mt-4">Loading events...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#1E2132] rounded-xl border border-[#2E313C] p-6 sm:p-8 py-12 sm:py-20 flex flex-col items-center text-center shadow-md mx-3 sm:mx-0"
            >
              <Search className="w-8 h-8 sm:w-12 sm:h-12 text-red-400 mb-3" />
              <h3 className="text-lg sm:text-xl font-medium text-red-300 mb-2">
                Error loading events
              </h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base max-w-md">
                {error}
              </p>
              <button
                onClick={() =>
                  fetchEvents({
                    page: 1,
                    limit: 50,
                    sortBy: "startDate",
                    sortOrder: "asc",
                  })
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#1E2132] rounded-xl border border-[#2E313C] p-6 sm:p-8 py-12 sm:py-20 flex flex-col items-center text-center shadow-md mx-3 sm:mx-0"
            >
              <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-3" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-200 mb-2">
                No events found
              </h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base max-w-md">
                We couldn&apos;t find any events matching your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTags([]);
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr p-1"
              key="events-grid"
            >
              {filteredEvents.map((event) => {
                const dateInfo = formatDate(event.startDate);
                const price = formatPrice(event.ticketTypes);

                return (
                  <motion.div
                    key={event._id}
                    onMouseEnter={() => setIsEventHovered(event._id)}
                    onMouseLeave={() => setIsEventHovered(null)}
                    className="group relative bg-[#1E2132] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 transform 
                         backdrop-blur-sm"
                  >
                    {/* Event card */}
                    <div className="h-full flex flex-col relative overflow-hidden">
                      {/* Event image */}
                      <div className="relative h-40 sm:h-48 lg:h-50 overflow-hidden cursor-pointer group/image">
                        <Image
                          src={getEventImage(event)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          width={400}
                          height={300}
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {/* Image overlay on hover */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={
                            isEventHovered === event._id
                              ? { opacity: 1 }
                              : { opacity: 0 }
                          }
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                        />

                        {/* Event badges */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-1.5 z-10 max-w-[calc(100%-4rem)]">
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.3,
                              type: "spring",
                              stiffness: 150,
                              damping: 15,
                            }}
                            className="bg-white/90 backdrop-blur-sm text-purple-700 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                          >
                            {event.category}
                          </motion.span>
                          {event.featured && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                delay: 0.4,
                                type: "spring",
                                stiffness: 150,
                                damping: 15,
                              }}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold flex items-center shadow-lg"
                            >
                              <Star
                                className="w-3 h-3 mr-0.5"
                                fill="currentColor"
                              />
                              <span className="hidden sm:inline">Featured</span>
                              <span className="sm:hidden">⭐</span>
                            </motion.span>
                          )}
                        </div>

                        {/* Price badge */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                          {price}
                        </div>

                        {/* Attendance info */}
                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>
                            {event.currentAttendees} / {event.maxAttendees}
                          </span>
                        </div>

                        {/* Quick view icon */}
                        <Link
                          href={`/events/${event._id}`}
                          className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-white/10 backdrop-blur-md border border-white/20 
                               rounded-full p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                      </div>

                      {/* Event info */}
                      <div className="p-2.5 sm:p-3 flex-grow flex flex-col">
                        <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                          <h3 className="font-semibold text-gray-100 text-sm sm:text-base lg:text-lg leading-tight pr-2 line-clamp-2">
                            {event.title}
                          </h3>
                          {event.featured && (
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{
                                rotate: isEventHovered === event._id ? 360 : 0,
                              }}
                              transition={{ duration: 0.5 }}
                              className="text-purple-400 flex-shrink-0"
                            >
                              <Star className="w-4 h-4" fill="currentColor" />
                            </motion.div>
                          )}
                        </div>

                        <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                          {event.description}
                        </p>

                        {/* Event metadata */}
                        <div className="mb-2 sm:mb-4 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3 text-pink-400" />
                            <span>{dateInfo.fullDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 text-pink-400" />
                            <span>
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 text-pink-400" />
                            <span>
                              {event.venue.city}, {event.venue.state}
                            </span>
                          </div>
                        </div>

                        {/* Tags (if events have tags) */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-0">
                            {event.tags
                              .slice(0, 2)
                              .map((tag: string, index: number) => (
                                <motion.span
                                  key={tag}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="bg-gradient-to-r from-[#262A3E] to-[#2A2E42] text-gray-300 
                                     px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs font-medium
                                     border border-gray-600/20 hover:border-purple-500/30
                                     transition-colors duration-200"
                                >
                                  #{tag}
                                </motion.span>
                              ))}

                            {event.tags.length > 2 && (
                              <span className="text-gray-500 text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                                <span>+{event.tags.length - 2}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Event footer */}
                      <div className="p-2.5 sm:p-3 pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white truncate">
                                {event.organizer.fullName}
                              </p>
                              <p className="text-xs text-gray-400">Organizer</p>
                            </div>
                          </div>
                          <Link
                            href={`/events/${event._id}`}
                            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-md sm:rounded-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm font-medium"
                          >
                            <span className="hidden sm:inline">View</span>
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Load More Button */}
          {!isLoading && !error && filteredEvents.length > 0 && (
            <div className="text-center mt-8 sm:mt-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-semibold rounded-lg transition-all duration-300"
              >
                Load More Events
              </motion.button>
            </div>
          )}
        </div>

        {/* Quick tip toast - for featured events */}
        <AnimatePresence>
          {selectedCategory === "featured" && filteredEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-[#1E2132]/90 backdrop-blur-md border border-[#2E313C] rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 max-w-xs sm:max-w-sm flex items-start z-30"
            >
              <Sparkles
                className="text-purple-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0"
                size={16}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-200 font-medium text-xs sm:text-sm">
                  Featured events
                </h4>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                  These are our hand-picked events with amazing experiences.
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory("all")}
                className="ml-2 text-gray-500 hover:text-gray-300 flex-shrink-0 p-1 hover:bg-gray-600/20 rounded-md transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
