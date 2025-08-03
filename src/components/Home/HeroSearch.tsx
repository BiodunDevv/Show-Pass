"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, TrendingUp, MapPin, Calendar } from "lucide-react";
import { useEventStore } from "@/store/useEventStore";
import Image from "next/image";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "trending" | "category" | "location";
  timestamp?: Date;
}

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { searchEvents, categories, fetchEventCategories } = useEventStore();

  // Load data from localStorage and fetch trending
  useEffect(() => {
    loadRecentSearches();
    loadTrendingSearches();
    fetchEventCategories();
  }, [fetchEventCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update suggestions based on query
  useEffect(() => {
    if (query.trim()) {
      const filteredCategories = categories
        .filter((cat) => cat.toLowerCase().includes(query.toLowerCase()))
        .map((cat) => ({
          id: `category-${cat}`,
          text: cat,
          type: "category" as const,
        }));

      const filteredRecent = recentSearches
        .filter((search) =>
          search.text.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3);

      setSuggestions([...filteredCategories.slice(0, 3), ...filteredRecent]);
    } else {
      setSuggestions([]);
    }
  }, [query, categories, recentSearches]);

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setRecentSearches(parsed.slice(0, 5)); // Keep only last 5
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

  const loadTrendingSearches = () => {
    // Mock trending searches - in real app, this would come from API
    const trending = [
      { id: "trending-1", text: "Tech Conference", type: "trending" as const },
      { id: "trending-2", text: "Music Festival", type: "trending" as const },
      { id: "trending-3", text: "Food Events", type: "trending" as const },
      { id: "trending-4", text: "Networking", type: "trending" as const },
    ];
    setTrendingSearches(trending);
  };

  const saveSearchToHistory = (searchText: string) => {
    try {
      const newSearch: SearchSuggestion = {
        id: `recent-${Date.now()}`,
        text: searchText,
        type: "recent",
        timestamp: new Date(),
      };

      const updated = [
        newSearch,
        ...recentSearches.filter((s) => s.text !== searchText),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) return;

    setIsLoading(true);
    saveSearchToHistory(searchText.trim());

    try {
      await searchEvents(searchText.trim());
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "recent":
        return <Clock className="h-4 w-4" />;
      case "trending":
        return <TrendingUp className="h-4 w-4" />;
      case "category":
        return <Calendar className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop"
          alt="Events Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-purple-900/80" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Discover{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto animate-fade-in-up-delay">
            Find concerts, conferences, workshops, and more. Your next great
            experience is just a search away.
          </p>

          {/* Search Bar */}
          <div
            ref={searchRef}
            className="relative max-w-2xl mx-auto animate-fade-in-up-delay-2"
          >
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Search for events, categories, or locations..."
                  className="w-full pl-4 pr-6 py-6 text-lg rounded-2xl border-2 border-gray-600 bg-transparent backdrop-blur-xs text-white placeholder:text-gray-300 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300"
                />
                {isLoading && (
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                  </div>
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  {/* Current Query Suggestions */}
                  {query.trim() && suggestions.length > 0 && (
                    <div className="p-4 border-b border-slate-700">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">
                        Suggestions
                      </h3>
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          <div className="text-gray-400">
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                          <span className="text-white flex-1">
                            {suggestion.text}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {suggestion.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {!query.trim() && recentSearches.length > 0 && (
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-400">
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((search) => (
                        <button
                          key={search.id}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-white flex-1">
                            {search.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trending Searches */}
                  {!query.trim() && trendingSearches.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">
                        Trending
                      </h3>
                      {trendingSearches.map((search) => (
                        <button
                          key={search.id}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          <TrendingUp className="h-4 w-4 text-pink-400" />
                          <span className="text-white flex-1">
                            {search.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No suggestions */}
                  {query.trim() && suggestions.length === 0 && (
                    <div className="p-6 text-center text-gray-400">
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p>No suggestions found</p>
                      <p className="text-sm mt-1">
                        Press Enter to search anyway
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {["Music", "Technology", "Food & Drink", "Sports"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => handleSearch(category)}
                    className="px-6 py-3 bg-transparent backdrop-blur-xs border border-white/20 rounded-full text-white hover:border-pink-500/50 transition-all duration-300 hover:scale-105"
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.8s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}
