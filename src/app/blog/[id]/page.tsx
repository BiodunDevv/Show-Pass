"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Tag,
  Eye,
  MessageCircle,
  ThumbsUp,
  Star,
  Badge,
  ExternalLink,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ArticleDetails {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  readTime: string;
  category: string;
  tags: string[];
  status: string;
  featured: boolean;
  views: number;
  likes: string[];
  comments: string[];
  totalLikes: number;
  totalComments: number;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<ArticleDetails[]>([]);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://showpass-backend.onrender.com/api/articles/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Article not found");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setArticle(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch article");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch article"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id && isClient) {
      fetchArticleDetails();
    }
  }, [params.id, isClient]);

  // Fetch related articles
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!article) return;

      try {
        const response = await fetch(
          `https://showpass-backend.onrender.com/api/articles?category=${article.category}&limit=3`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Filter out current article
            const related = data.data.filter(
              (a: ArticleDetails) => a._id !== article._id
            );
            setRelatedArticles(related.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Failed to fetch related articles:", err);
      }
    };

    if (article && isClient) {
      fetchRelatedArticles();
    }
  }, [article, isClient]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      year: date.getFullYear(),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const handleCopyArticleUrl = async () => {
    try {
      const articleUrl =
        typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value =
        typeof window !== "undefined" ? window.location.href : "";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleSocialShare = (platform: string) => {
    if (!article) return;

    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = article.title;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
    }
  };

  // Don't render until client-side
  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-9xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-slate-800 rounded-lg mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-32 bg-slate-800 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20">
        <div className="max-w-9xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-white mb-4">
              Article Not Found
            </h1>
            <p className="text-gray-400 mb-8">
              {error || "The article you are looking for does not exist."}
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const publishedDate = formatDate(article.createdAt);
  const lastModifiedDate = formatDate(article.lastModified);

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-9xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </button>

        {/* Hero Section */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {publishedDate.day}
                </div>
                <div className="text-sm text-gray-600 uppercase font-medium">
                  {publishedDate.month}
                </div>
              </div>
              {article.featured && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Featured
                </div>
              )}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {article.title}
            </h1>
            <p className="text-gray-200 text-lg">by {article.author}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Article Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Article Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-pink-400" />
                  <div>
                    <p className="text-sm text-gray-400">Published</p>
                    <p className="text-white font-medium">
                      {publishedDate.fullDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-pink-400" />
                  <div>
                    <p className="text-sm text-gray-400">Read Time</p>
                    <p className="text-white font-medium">{article.readTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-pink-400" />
                  <div>
                    <p className="text-sm text-gray-400">Author</p>
                    <p className="text-white font-medium">{article.author}</p>
                    <p className="text-gray-300 text-sm">
                      {article.authorId.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-pink-400" />
                  <div>
                    <p className="text-sm text-gray-400">Views</p>
                    <p className="text-white font-medium">
                      {article.views.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Article Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-700/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {article.totalLikes}
                  </p>
                  <p className="text-sm text-gray-400">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {article.totalComments}
                  </p>
                  <p className="text-sm text-gray-400">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-400">
                    {article.views}
                  </p>
                  <p className="text-sm text-gray-400">Views</p>
                </div>
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Article Summary
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              {/* Article Content */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Full Article
                </h3>
                <div
                  className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-300 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Status Indicators */}
              <div className="mt-6 flex flex-wrap gap-3">
                {article.featured && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                    ⭐ Featured Article
                  </span>
                )}
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                  📝 {article.status}
                </span>
                {article.seo && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                    🔍 SEO Optimized
                  </span>
                )}
              </div>

              {/* Last Modified */}
              {article.lastModified !== article.createdAt && (
                <div className="mt-6 text-sm text-gray-400">
                  Last updated: {lastModifiedDate.fullDate}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Article Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                Article Actions
              </h3>

              <div className="space-y-4">
                {/* Like Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isLiked
                      ? "bg-red-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  {isLiked ? "Liked" : "Like Article"}
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isBookmarked
                      ? "bg-yellow-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </button>

                {/* Copy URL Button */}
                <button
                  onClick={handleCopyArticleUrl}
                  className={`w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Article Link
                    </>
                  )}
                </button>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSocialShare("twitter")}
                    className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Twitter className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSocialShare("facebook")}
                    className="py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Facebook className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSocialShare("linkedin")}
                    className="py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Linkedin className="h-4 w-4" />
                  </button>
                </div>

                {/* Article URL for reference */}
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Article URL:</p>
                  <p className="text-gray-300 text-sm break-all">
                    {typeof window !== "undefined" ? window.location.href : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Author</h3>

              <div className="space-y-4">
                {/* Author Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {article.author[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-lg">
                      {article.author}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {article.authorId.fullName}
                    </p>
                  </div>
                </div>

                {/* Author Stats */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">1</p>
                    <p className="text-xs text-gray-400">Articles Published</p>
                  </div>
                </div>

                {/* Contact Author */}
                <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Author Profile
                </button>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Related Articles
                </h3>

                <div className="space-y-4">
                  {relatedArticles.map((relatedArticle) => (
                    <Link
                      key={relatedArticle._id}
                      href={`/blog/${relatedArticle._id}`}
                      className="block p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={relatedArticle.image}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                            {relatedArticle.title}
                          </h4>
                          <p className="text-gray-400 text-xs">
                            {relatedArticle.readTime}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .prose {
          max-width: none;
        }

        .prose h2 {
          color: #fff;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          border-bottom: 2px solid #e91e63;
          padding-bottom: 0.5rem;
        }

        .prose h3 {
          color: #e2e8f0;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
        }

        .prose p {
          color: #cbd5e1;
          margin: 1rem 0;
          line-height: 1.7;
          font-size: 1rem;
        }

        .prose ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
          color: #cbd5e1;
        }

        .prose li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .prose strong {
          color: #fff;
          font-weight: 600;
        }

        .prose ul li::marker {
          color: #e91e63;
        }

        .prose blockquote {
          border-left: 4px solid #e91e63;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #94a3b8;
        }

        .prose a {
          color: #e91e63;
          text-decoration: underline;
        }

        .prose a:hover {
          color: #f472b6;
        }

        .prose code {
          background-color: #1e293b;
          color: #e91e63;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .prose pre {
          background-color: #1e293b;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .prose img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }

        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }

        .prose th,
        .prose td {
          border: 1px solid #475569;
          padding: 0.75rem;
          text-align: left;
        }

        .prose th {
          background-color: #1e293b;
          font-weight: 600;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
