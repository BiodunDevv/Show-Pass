"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useArticleStore } from "@/store/useArticleStore";

export function BlogSection() {
  const [isClient, setIsClient] = useState(false);

  const { articles, fetchArticles, isLoading, error } = useArticleStore();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch all articles when component mounts
  useEffect(() => {
    if (!isClient) return;

    const loadArticles = async () => {
      try {
        // Fetch all articles without pagination to get the full list
        await fetchArticles({
          page: 1,
          limit: 100, // Get a large number to ensure we get all articles
          sortBy: "publishedAt",
          sortOrder: "desc",
        });
      } catch (error) {
        console.error("Failed to load articles:", error);
      }
    };

    loadArticles();
  }, [isClient, fetchArticles]);

  // Deterministic selection of the latest 3 articles
  const topArticles = articles.slice(0, 3);

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 slide-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Latest Insights
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Stay updated with the latest trends, tips, and insights from the
            event industry
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="h-40 sm:h-48 lg:h-56 bg-gray-700"></div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-red-400 text-sm sm:text-base lg:text-lg px-4">
              Error loading articles: {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {topArticles.map((article, index) => (
              <div
                key={article._id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-purple-500/30 group h-full slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 bg-white/90 backdrop-blur-sm text-purple-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {article.category}
                  </div>
                  {article.featured && (
                    <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                      <span className="mr-1">⭐</span>
                      <span className="hidden sm:inline">Featured</span>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 lg:p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3 text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-300 line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Article metadata */}
                  <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">
                        {new Date(article.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="text-xs sm:text-sm">
                        {article.readTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {article.authorId?.fullName ||
                            article.author ||
                            "Unknown Author"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span className="truncate">Author</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${article._id}`}
                      className="inline-flex items-center gap-1 sm:gap-1.5 lg:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-md lg:rounded-lg transition-all duration-300 hover:scale-105 flex-shrink-0 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Read</span>
                      <span className="sm:hidden">📖</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && topArticles.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg px-4">
              No articles found
            </p>
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12 lg:mt-16 slide-in-up">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold border border-purple-500 bg-purple-900 text-white shadow-lg shadow-purple-900/20 rounded-full transition-all duration-300 hover:scale-105"
          >
            View All Articles
            <ArrowRight className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          </Link>
        </div>
      </div>

      <style jsx>{`
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

        .slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }

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
    </section>
  );
}
