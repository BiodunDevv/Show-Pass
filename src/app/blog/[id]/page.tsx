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
  Send,
  MoreVertical,
  Reply,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_CONFIG, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Comment {
  _id: string;
  user: string;
  userType: string;
  userName?: string; // Made optional since it can be undefined
  content?: string; // Made optional since it can be undefined
  createdAt?: string; // Made optional since it can be undefined
  replies?: Comment[];
  id: string;
}

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
  comments: Comment[];
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
  const { token, user } = useAuthStore();
  const [article, setArticle] = useState<ArticleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<ArticleDetails[]>([]);

  // Comment functionality
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [refreshingComments, setRefreshingComments] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = Boolean(token && user);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(
          `${API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_ID}/${params.id}`
        );

        if (data.success && data.data) {
          setArticle(data.data);
          // Check if current user has liked the article from the API response
          if (user && data.data.likes) {
            const hasUserLiked = data.data.likes.some(
              (like: any) => like.user === user._id
            );
            setIsLiked(hasUserLiked);
          } else {
            setIsLiked(false);
          }

          // Set comments from the article data
          if (data.data.comments) {
            setComments(data.data.comments);
          }
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
  }, [params.id, isClient, user]);

  // Fetch related articles
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!article) return;

      try {
        const data = await apiRequest(
          `${API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_CATEGORY}/${article.category}?limit=3`
        );

        if (data.success && data.data) {
          // Filter out current article
          const related = data.data.filter(
            (a: ArticleDetails) => a._id !== article._id
          );
          setRelatedArticles(related.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch related articles:", err);
      }
    };

    if (article && isClient) {
      fetchRelatedArticles();
    }
  }, [article, isClient]);

  // Auto-refresh comments every 2 minutes when the component is active
  useEffect(() => {
    if (!article || !isClient) return;

    const interval = setInterval(() => {
      refetchComments();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
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

  // Handle like/unlike article
  const handleLikeArticle = async () => {
    if (!article) return;

    // Check if user is authenticated
    if (!token || !user) {
      console.error("User must be logged in to like articles");
      router.push("/auth/signin");
      return;
    }

    try {
      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ARTICLES.LIKE}/${article._id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        // Update the article with the new like data from API response
        if (data.data && data.data.likes !== undefined) {
          const newLikedState = data.data.likes.some(
            (like: any) => like.user === user._id
          );
          setIsLiked(newLikedState);

          // Update article with complete new data from API
          setArticle((prev) =>
            prev
              ? {
                  ...prev,
                  likes: data.data.likes,
                  totalLikes: data.data.totalLikes || data.data.likes.length,
                }
              : null
          );
        } else {
          // Fallback: toggle like state locally if API doesn't return updated data
          const newLikedState = !isLiked;
          setIsLiked(newLikedState);
          setArticle((prev) =>
            prev
              ? {
                  ...prev,
                  totalLikes: newLikedState
                    ? prev.totalLikes + 1
                    : prev.totalLikes - 1,
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Failed to like article:", err);
    }
  };

  // Fetch comments in real-time
  const refetchComments = async () => {
    if (!article) return;

    try {
      setRefreshingComments(true);
      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_ID}/${article._id}`
      );

      if (data.success && data.data && data.data.comments) {
        setComments(data.data.comments);
        // Also update the article total comments count
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                totalComments:
                  data.data.totalComments || data.data.comments.length,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Failed to refetch comments:", err);
    } finally {
      setRefreshingComments(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!article || !commentText.trim()) return;

    // Check if user is authenticated
    if (!token || !user) {
      console.error("User must be logged in to comment");
      router.push("/auth/signin");
      return;
    }

    try {
      setSubmittingComment(true);
      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ARTICLES.ADD_COMMENT}/${article._id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: commentText }),
        }
      );

      if (data.success) {
        setComments((prev) => [data.data, ...(prev || [])]);
        setCommentText("");
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                totalComments: prev.totalComments + 1,
              }
            : null
        );
        // Refetch comments to ensure we have the latest data
        setTimeout(() => refetchComments(), 1000);
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (commentId: string) => {
    if (!article || !replyText.trim()) return;

    // Check if user is authenticated
    if (!token || !user) {
      console.error("User must be logged in to reply");
      router.push("/auth/signin");
      return;
    }

    try {
      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ARTICLES.ADD_REPLY}/${article._id}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: replyText }),
        }
      );

      if (data.success) {
        // Update the comment with the new reply
        setComments((prev) =>
          (prev || []).map((comment) =>
            comment._id === commentId
              ? { ...comment, replies: [...(comment.replies || []), data.data] }
              : comment
          )
        );
        setReplyText("");
        setReplyingTo(null);
        // Refetch comments to ensure we have the latest data
        setTimeout(() => refetchComments(), 1000);
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!article || !user) return;

    // Check if user is authenticated
    if (!token) {
      console.error("User must be logged in to delete comments");
      router.push("/auth/signin");
      return;
    }

    try {
      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_ID}/${article._id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        // Remove the comment from the list
        setComments((prev) =>
          (prev || []).filter((comment) => comment._id !== commentId)
        );
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                totalComments: prev.totalComments - 1,
              }
            : null
        );
        // Refetch comments to ensure consistency
        setTimeout(() => refetchComments(), 1000);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Handle reply deletion
  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!article || !user) return;

    // Check if user is authenticated
    if (!token) {
      console.error("User must be logged in to delete replies");
      router.push("/auth/signin");
      return;
    }

    try {
      const data = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_ID}/${article._id}/comments/${commentId}/reply/${replyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        // Remove the reply from the comment
        setComments((prev) =>
          (prev || []).map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: (comment.replies || []).filter(
                    (reply) => reply._id !== replyId
                  ),
                }
              : comment
          )
        );
        // Refetch comments to ensure consistency
        setTimeout(() => refetchComments(), 1000);
      }
    } catch (err) {
      console.error("Failed to delete reply:", err);
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
        <div className="max-w-9xl mx-auto px-2 sm:px-4 py-8">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
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
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="relative z-10 pt-20 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-9xl mx-auto px-2 sm:px-4 md:px-6">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </motion.button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8"
          >
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Hero Content */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">
                    {publishedDate.day}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 uppercase font-medium">
                    {publishedDate.month}
                  </div>
                </div>

                {article.featured && (
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Featured
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {article.category}
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-200">
                <span>by {article.author}</span>
                <span>•</span>
                <span>{article.readTime}</span>
                <span>•</span>
                <span>{article.views.toLocaleString()} views</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Article Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl"
              >
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-green-400">
                    {article.totalLikes}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-blue-400">
                    {article.totalComments}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-purple-400">
                    {article.views}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">Views</p>
                </div>
              </motion.div>

              {/* Article Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                  Article Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Published
                      </p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {publishedDate.fullDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Read Time
                      </p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {article.readTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Author</p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {article.author}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-300">
                        {article.authorId.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Views</p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {article.views.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                    Article Summary
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                {/* Article Content */}
                <div className="mt-6 sm:mt-8">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                    Full Article
                  </h3>
                  <div
                    className="prose prose-sm sm:prose-lg prose-invert max-w-none text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-purple-300 rounded-full text-xs sm:text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Status Indicators */}
                <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                  {article.featured && (
                    <span className="px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs sm:text-sm border border-yellow-500/30">
                      ⭐ Featured Article
                    </span>
                  )}
                  <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm border border-green-500/30">
                    📝 {article.status}
                  </span>
                  {article.seo && (
                    <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs sm:text-sm border border-blue-500/30">
                      🔍 SEO Optimized
                    </span>
                  )}
                </div>

                {/* Last Modified */}
                {article.lastModified !== article.createdAt && (
                  <div className="mt-6 text-xs sm:text-sm text-gray-400">
                    Last updated: {lastModifiedDate.fullDate}
                  </div>
                )}
              </motion.div>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Comments ({article.totalComments})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refetchComments}
                      disabled={refreshingComments}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {refreshingComments ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                      ) : (
                        "↻"
                      )}
                      Refresh
                    </button>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {showComments ? "Hide" : "Show"} Comments
                    </button>
                  </div>
                </div>

                {/* Authentication notice for unauthenticated users */}
                {!isAuthenticated && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-300 text-sm flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      You can read all comments, but you'll need to{" "}
                      <button
                        onClick={() => router.push("/auth/signin")}
                        className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                      >
                        sign in
                      </button>{" "}
                      to post comments or replies.
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {showComments && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      {/* Comment Form */}
                      {isAuthenticated ? (
                        <div className="space-y-3 sm:space-y-4">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts about this article..."
                            rows={3}
                            className="w-full p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500/50 text-sm sm:text-base"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={handleSubmitComment}
                              disabled={
                                !commentText.trim() || submittingComment
                              }
                              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                            >
                              {submittingComment ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              Post Comment
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <MessageCircle className="h-8 w-8 text-gray-400" />
                            <h4 className="text-white font-medium">
                              Join the Conversation
                            </h4>
                            <p className="text-gray-400 text-sm sm:text-base">
                              Sign in to share your thoughts and engage with
                              other readers.
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => router.push("/auth/signin")}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-sm"
                              >
                                Sign In
                              </button>
                              <button
                                onClick={() => router.push("/auth/signup")}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 text-sm"
                              >
                                Sign Up
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      {comments.length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                          {comments.map((comment) => (
                            <div
                              key={comment._id}
                              className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
                                  {comment.userName?.charAt(0).toUpperCase() ||
                                    (refreshingComments ? "..." : "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-white text-sm sm:text-base">
                                      {comment.userName ||
                                        (refreshingComments
                                          ? "Loading..."
                                          : "Anonymous User")}
                                    </h4>
                                    <span className="text-xs sm:text-sm text-gray-400">
                                      {comment.createdAt
                                        ? new Date(
                                            comment.createdAt
                                          ).toLocaleDateString()
                                        : "Unknown date"}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3">
                                    {comment.content ||
                                      (refreshingComments
                                        ? "Loading content..."
                                        : "No content available")}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    {isAuthenticated ? (
                                      <button
                                        onClick={() =>
                                          setReplyingTo(
                                            replyingTo === comment._id
                                              ? null
                                              : comment._id
                                          )
                                        }
                                        className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                      >
                                        <Reply className="h-3 w-3" />
                                        Reply
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          router.push("/auth/signin")
                                        }
                                        className="text-xs sm:text-sm text-gray-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                        title="Sign in to reply"
                                      >
                                        <Reply className="h-3 w-3" />
                                        Sign in to Reply
                                      </button>
                                    )}

                                    {/* Delete button - only show if user is the comment author */}
                                    {user && comment.user === user._id && (
                                      <button
                                        onClick={() =>
                                          handleDeleteComment(comment._id)
                                        }
                                        className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                      </button>
                                    )}
                                  </div>

                                  {/* Reply Form */}
                                  <AnimatePresence>
                                    {replyingTo === comment._id &&
                                      isAuthenticated && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                          }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="mt-3 space-y-3"
                                        >
                                          <textarea
                                            value={replyText}
                                            onChange={(e) =>
                                              setReplyText(e.target.value)
                                            }
                                            placeholder="Write a reply..."
                                            rows={2}
                                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500/50 text-sm"
                                          />
                                          <div className="flex justify-end gap-2">
                                            <button
                                              onClick={() =>
                                                setReplyingTo(null)
                                              }
                                              className="px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleSubmitReply(comment._id)
                                              }
                                              disabled={!replyText.trim()}
                                              className="px-4 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </motion.div>
                                      )}
                                  </AnimatePresence>

                                  {/* Replies */}
                                  {comment.replies &&
                                    comment.replies.length > 0 && (
                                      <div className="mt-4 space-y-3 ml-4 border-l border-white/10 pl-4">
                                        {comment.replies.map((reply) => (
                                          <div
                                            key={reply._id}
                                            className="bg-white/5 rounded-lg p-3"
                                          >
                                            <div className="flex items-start gap-3">
                                              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                                {reply.userName
                                                  ?.charAt(0)
                                                  .toUpperCase() ||
                                                  (refreshingComments
                                                    ? "..."
                                                    : "?")}
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                  <div className="flex items-center gap-2">
                                                    <h5 className="font-medium text-white text-sm">
                                                      {reply.userName ||
                                                        (refreshingComments
                                                          ? "Loading..."
                                                          : "Anonymous User")}
                                                    </h5>
                                                    <span className="text-xs text-gray-400">
                                                      {reply.createdAt
                                                        ? new Date(
                                                            reply.createdAt
                                                          ).toLocaleDateString()
                                                        : "Unknown date"}
                                                    </span>
                                                  </div>

                                                  {/* Delete button for replies - only show if user is the reply author */}
                                                  {user &&
                                                    reply.user === user._id && (
                                                      <button
                                                        onClick={() =>
                                                          handleDeleteReply(
                                                            comment._id,
                                                            reply._id
                                                          )
                                                        }
                                                        className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                                      >
                                                        <Trash2 className="h-3 w-3" />
                                                      </button>
                                                    )}
                                                </div>
                                                <p className="text-gray-300 text-sm">
                                                  {reply.content ||
                                                    (refreshingComments
                                                      ? "Loading content..."
                                                      : "No content available")}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>
                            No comments yet. Be the first to share your
                            thoughts!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              {/* Article Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                  Article Actions
                </h3>

                {/* Authentication notice for unauthenticated users */}
                {!isAuthenticated && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-300 text-xs sm:text-sm">
                      💡 You can share this article freely, but liking requires{" "}
                      <button
                        onClick={() => router.push("/auth/signin")}
                        className="text-amber-400 hover:text-amber-300 underline font-medium"
                      >
                        signing in
                      </button>
                      .
                    </p>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  {/* Like Button */}
                  <button
                    onClick={
                      isAuthenticated
                        ? handleLikeArticle
                        : () => router.push("/auth/signin")
                    }
                    disabled={!isAuthenticated && !isLiked}
                    className={`w-full py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                      isLiked
                        ? "bg-red-600 text-white"
                        : isAuthenticated
                        ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                        : "bg-gray-600/50 text-gray-300 border border-gray-600/50 cursor-pointer hover:bg-gray-600/70"
                    }`}
                    title={
                      !isAuthenticated ? "Sign in to like this article" : ""
                    }
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                    />
                    {isLiked
                      ? "Liked"
                      : isAuthenticated
                      ? "Like Article"
                      : "Sign in to Like"}
                  </button>

                  {/* Copy URL Button */}
                  <button
                    onClick={handleCopyArticleUrl}
                    className={`w-full py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
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
                </div>
              </motion.div>

              {/* Author Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                  Author
                </h3>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    {article.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm sm:text-base">
                      {article.author}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400 mb-3">
                      Author
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                    Related Articles
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle._id}
                        href={`/blog/${relatedArticle._id}`}
                        className="block p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={relatedArticle.image}
                              alt={relatedArticle.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-sm sm:text-base line-clamp-2 mb-1">
                              {relatedArticle.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-400">
                              {relatedArticle.readTime} •{" "}
                              {relatedArticle.category}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
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
      `}</style>
    </div>
  );
}
