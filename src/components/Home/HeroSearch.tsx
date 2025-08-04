"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, TrendingUp, MapPin, Calendar, X } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { searchEvents, categories, fetchEventCategories } = useEventStore();

  // All available categories
  const allCategories = [
    { name: "Music", icon: "🎵" },
    { name: "Technology", icon: "💻" },
    { name: "Food & Drink", icon: "🍽️" },
    { name: "Sports", icon: "⚽" },
    { name: "Business", icon: "💼" },
    { name: "Entertainment", icon: "🎭" },
    { name: "Education", icon: "📚" },
    { name: "Health", icon: "🏥" },
    { name: "Art & Culture", icon: "🎨" },
    { name: "Travel", icon: "✈️" },
    { name: "Fashion", icon: "👗" },
    { name: "Gaming", icon: "🎮" },
  ];

  // Randomly select 4 categories each time
  const randomCategories = useMemo(() => {
    const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  // Load data from localStorage
  useEffect(() => {
    loadRecentSearches();
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
      // Redirect to events page with search query
      router.push(`/events?search=${encodeURIComponent(searchText.trim())}`);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    // Redirect to events page with category filter
    router.push(`/events?category=${encodeURIComponent(categoryName)}`);
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
            <span className="bg-gradient-to-r from-purple-600 to-purple-200 bg-clip-text text-transparent">
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
            className="relative max-w-2xl mx-auto animate-fade-in-up-delay-2 px-4 sm:px-0"
          >
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <div className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Search for events, categories, or locations..."
                  className="w-full pl-12 sm:pl-16 pr-12 sm:pr-16 py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 border-gray-600 bg-transparent backdrop-blur-xs text-white placeholder:text-gray-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 shadow-xl"
                />
                {isLoading && (
                  <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-purple-500"></div>
                  </div>
                )}
                {!isLoading && query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-16 sm:right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {/* Mobile Enter Button */}
                {!isLoading && query && (
                  <button
                    type="submit"
                    className="absolute right-2 sm:hidden top-1/2 transform -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-3 py-1 text-xs font-medium transition-colors shadow-lg"
                  >
                    Go
                  </button>
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 mx-2 sm:mx-0 bg-transparent backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl z-50 max-h-80 sm:max-h-96 overflow-hidden">
                  {/* Current Query Suggestions */}
                  {query.trim() && suggestions.length > 0 && (
                    <div className="p-4 sm:p-6 border-b border-white/10">
                      <h3 className="text-sm font-semibold text-white/70 mb-3 sm:mb-4">
                        Suggestions
                      </h3>
                      <div className="space-y-1 sm:space-y-2">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-white/20"
                          >
                            <div className="text-white/50 flex-shrink-0">
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <span className="text-white flex-1 text-sm sm:text-base font-medium truncate">
                              {suggestion.text}
                            </span>
                            <span className="text-xs text-white/40 capitalize hidden sm:inline bg-white/10 px-2 py-1 rounded-full">
                              {suggestion.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {!query.trim() && recentSearches.length > 0 && (
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-sm font-semibold text-white/70">
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-purple-400/30"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        {recentSearches.map((search) => (
                          <button
                            key={search.id}
                            onClick={() => handleSuggestionClick(search)}
                            className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-white/20 group"
                          >
                            <div className="bg-white/10 rounded-lg p-2 group-hover:bg-white/20 transition-colors">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white/60 group-hover:text-white/80" />
                            </div>
                            <span className="text-white flex-1 text-sm sm:text-base font-medium truncate group-hover:text-white">
                              {search.text}
                            </span>
                            <div className="text-xs text-white/30 hidden sm:block">
                              {search.timestamp &&
                                new Date(search.timestamp).toLocaleDateString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No suggestions */}
                  {query.trim() && suggestions.length === 0 && (
                    <div className="p-6 sm:p-8 text-center text-white/60">
                      <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Search className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
                      </div>
                      <p className="text-sm sm:text-base font-medium mb-2">
                        No suggestions found
                      </p>
                      <p className="text-xs sm:text-sm text-white/40">
                        Press Enter to search anyway
                      </p>
                    </div>
                  )}

                  {/* Empty state when no recent searches */}
                  {!query.trim() && recentSearches.length === 0 && (
                    <div className="p-6 sm:p-8 text-center text-white/60">
                      <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
                      </div>
                      <p className="text-sm sm:text-base font-medium mb-2">
                        No recent searches
                      </p>
                      <p className="text-xs sm:text-sm text-white/40">
                        Start typing to search for events
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Quick Action Categories */}
            <div className="mt-8 sm:mt-12">
              <p className="text-center text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
                Or browse popular categories
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                {randomCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className="group relative px-4 py-3 sm:px-6 sm:py-4 bg-transparent backdrop-blur-xs border border-white/20 rounded-xl text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center gap-2 text-sm sm:text-base min-h-[60px] sm:min-h-[100px]"
                  >
                    <span className="hidden sm:block text-2xl sm:text-3xl filter grayscale opacity-70 group-hover:filter-none group-hover:opacity-100 transition-all duration-300">
                      {category.icon}
                    </span>
                    <span className="text-center font-medium leading-tight">
                      {category.name}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
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
