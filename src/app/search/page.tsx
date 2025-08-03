"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Calendar, MapPin, Clock } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock search results
      const mockResults = [
        {
          id: 1,
          title: "Summer Music Festival 2025",
          description: "The biggest music festival featuring top artists",
          date: "July 15, 2025",
          location: "Central Park, New York",
          time: "6:00 PM",
          image:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
          price: "$89",
        },
        {
          id: 2,
          title: "Tech Conference 2025",
          description: "Latest trends in technology and innovation",
          date: "August 22, 2025",
          location: "Convention Center, San Francisco",
          time: "9:00 AM",
          image:
            "https://images.unsplash.com/photo-1698581075105-924b6c70b5d6?w=300&h=200&fit=crop",
          price: "$299",
        },
        {
          id: 3,
          title: "Food & Wine Expo",
          description: "Taste the finest cuisines from around the world",
          date: "September 10, 2025",
          location: "Downtown Convention Hall",
          time: "11:00 AM",
          image:
            "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=300&h=200&fit=crop",
          price: "$45",
        },
      ];

      const filtered = mockResults.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setResults(filtered);
      setIsLoading(false);
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(
        {},
        "",
        `/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      performSearch(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Search Events</h1>
          <p className="text-gray-400 text-lg">
            Find amazing events happening near you
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20 p-2">
              <Search className="h-6 w-6 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="Search for events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {query && (
          <div className="mb-6">
            <p className="text-gray-400">
              {isLoading
                ? "Searching..."
                : `Found ${results.length} results for "${query}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Searching for events...</p>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((event) => (
              <div
                key={event.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 hover:border-pink-500/30"
              >
                <div className="relative h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-pink-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                    {event.price}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-pink-400" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2 text-pink-400" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-pink-400" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className="block w-full text-center py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-400 mb-6">
              Try searching with different keywords or browse all events
            </p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Browse All Events
            </Link>
          </div>
        )}

        {/* Default State */}
        {!query && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Search for Events
            </h3>
            <p className="text-gray-400 mb-6">
              Enter keywords to find events that match your interests
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Music", "Technology", "Food", "Sports", "Art", "Business"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      performSearch(tag);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-full border border-slate-600 hover:border-pink-500/50 transition-all duration-300"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
