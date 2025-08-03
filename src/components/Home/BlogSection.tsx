"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useArticleStore } from "@/store/useArticleStore";

export function BlogSection() {

  const { articles, fetchArticles, isLoading, error } = useArticleStore();

  // Fetch articles when component mounts
  useEffect(() => {
    const loadArticles = async () => {
      try {
        await fetchArticles({
          page: 1,
          limit: 3,
          sortBy: "publishedAt",
          sortOrder: "desc",
        });
      } catch (error) {
        console.error("Failed to load articles:", error);
      }
    };

    loadArticles();
  }, [fetchArticles]);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-9xl mx-auto px-4">
        <div className="text-center mb-16 slide-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Latest Insights
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest trends, tips, and insights from the
            event industry
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
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
              Error loading articles: {error}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <div
                key={article._id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-pink-500/30 group h-full slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {article.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-300 line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {article.author}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${article._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No articles found</p>
          </div>
        )}

        <div className="text-center mt-16 slide-in-up">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            View All Articles
            <ArrowRight className="h-5 w-5" />
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
