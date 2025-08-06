"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Star,
  Award,
  TrendingUp,
  Users,
  Ticket,
  DollarSign,
  Clock,
  Camera,
  Edit,
  Verified,
  Shield,
  Activity,
  BarChart3,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  return <ProfileContent />;
}

function ProfileContent() {
  const { user, userProfile, fetchUserProfile, isLoading, error, token } =
    useAuthStore();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    if (!userProfile) {
      fetchUserProfile();
    }
  }, [token, userProfile, fetchUserProfile, router]);

  if (!token) {
    return null;
  }

  if (isLoading && !userProfile) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!userProfile) {
    return <ErrorState error="Profile not found" />;
  }

  const isOrganizer = user?.role === "organizer";
  const isUser = user?.role === "user";

  const profileCompleteness = userProfile.profileCompleteness || 0;
  const getProfileCompletenessColor = () => {
    if (profileCompleteness >= 80) return "text-green-400";
    if (profileCompleteness >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    ...(isOrganizer
      ? [{ id: "business", label: "Business", icon: Award }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  {user?.isVerified && (
                    <Verified className="text-blue-400" size={24} />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span className="text-sm">{user?.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="text-sm">
                      Joined {formatDate(user?.createdAt || "")}
                    </span>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isOrganizer
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {isOrganizer ? "Event Organizer" : "Event Attendee"}
                  </span>

                  {isOrganizer && userProfile.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={16} />
                      <span className="text-white font-medium">
                        {userProfile.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Completeness */}
                <div className="w-full max-w-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">
                      Profile Completeness
                    </span>
                    <span
                      className={`text-sm font-medium ${getProfileCompletenessColor()}`}
                    >
                      {profileCompleteness}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        profileCompleteness >= 80
                          ? "bg-green-400"
                          : profileCompleteness >= 60
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${profileCompleteness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {isOrganizer ? (
            <>
              <StatCard
                icon={<Calendar className="text-purple-400" />}
                title="Events Created"
                value={
                  userProfile.statistics?.organizerMetrics
                    ?.totalEventsCreated ||
                  userProfile.statistics?.eventsCreated ||
                  0
                }
                subtitle="Total events"
              />
              <StatCard
                icon={<DollarSign className="text-green-400" />}
                title="Total Revenue"
                value={formatCurrency(
                  userProfile.statistics?.organizerMetrics?.totalRevenue || 0
                )}
                subtitle="All time"
              />
              <StatCard
                icon={<Users className="text-blue-400" />}
                title="Average Attendance"
                value={
                  userProfile.statistics?.organizerMetrics
                    ?.averageEventAttendance || 0
                }
                subtitle="Per event"
              />
              <StatCard
                icon={<TrendingUp className="text-yellow-400" />}
                title="Approved Events"
                value={
                  userProfile.statistics?.organizerMetrics?.approvedEvents || 0
                }
                subtitle="Published"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={<Ticket className="text-purple-400" />}
                title="Events Attended"
                value={
                  userProfile.statistics?.userMetrics?.totalEventsAttended ||
                  userProfile.statistics?.eventsAttended ||
                  0
                }
                subtitle="All time"
              />
              <StatCard
                icon={<DollarSign className="text-green-400" />}
                title="Total Spent"
                value={formatCurrency(userProfile.totalSpent || 0)}
                subtitle="On tickets"
              />
              <StatCard
                icon={<Heart className="text-red-400" />}
                title="Favorite Category"
                value={
                  userProfile.statistics?.userMetrics?.favoriteCategory ||
                  userProfile.financialSummary?.favoriteCategory ||
                  "None"
                }
                subtitle="Most attended"
              />
              <StatCard
                icon={<Calendar className="text-blue-400" />}
                title="Upcoming Events"
                value={userProfile.statistics?.userMetrics?.upcomingEvents || 0}
                subtitle="Registered"
              />
            </>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <OverviewTab userProfile={userProfile} />
            )}
            {activeTab === "activity" && (
              <ActivityTab userProfile={userProfile} />
            )}
            {activeTab === "statistics" && (
              <StatisticsTab userProfile={userProfile} />
            )}
            {activeTab === "business" && isOrganizer && (
              <BusinessTab userProfile={userProfile} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Component definitions for tabs and other elements
function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-slate-300 text-sm font-medium">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-xs">{subtitle}</div>
    </div>
  );
}

function OverviewTab({ userProfile }: { userProfile: any }) {
  const { user } = useAuthStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Account Summary */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <User className="text-purple-400" size={20} />
          Account Summary
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Account Age</span>
            <span className="text-white font-medium">
              Joined {formatDate(user?.createdAt || "")}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Last Activity</span>
            <span className="text-white font-medium">
              {formatDate(userProfile.statistics?.lastActivity || "")}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Verification Status</span>
            <span
              className={`flex items-center gap-2 ${
                userProfile.statistics?.verificationStatus ||
                userProfile.isVerified
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              <Verified size={16} />
              {userProfile.statistics?.verificationStatus ||
              userProfile.isVerified
                ? "Verified"
                : "Unverified"}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-300">Account Status</span>
            <span className="text-green-400 capitalize">
              {userProfile.statistics?.accountStatus || "active"}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <DollarSign className="text-green-400" size={20} />
          Financial Summary
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Total Spent</span>
            <span className="text-white font-medium">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(
                userProfile.financialSummary?.totalSpent ||
                  userProfile.totalSpent ||
                  0
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Average Per Event</span>
            <span className="text-white font-medium">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(
                userProfile.financialSummary?.averageSpentPerEvent || 0
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Last Purchase</span>
            <span className="text-white font-medium">
              {userProfile.financialSummary?.lastPurchase?.date
                ? new Date(
                    userProfile.financialSummary.lastPurchase.date
                  ).toLocaleDateString()
                : userProfile.activitySummary?.lastBooking
                ? new Date(
                    userProfile.activitySummary.lastBooking
                  ).toLocaleDateString()
                : "None"}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-300">Favorite Category</span>
            <span className="text-purple-400 font-medium">
              {userProfile.financialSummary?.favoriteCategory ||
                userProfile.statistics?.userMetrics?.favoriteCategory ||
                "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ userProfile }: { userProfile: any }) {
  const isOrganizer = userProfile.role === "organizer";

  return (
    <div className="space-y-8">
      {/* Recent Events/Bookings */}
      {isOrganizer ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Recent Events
          </h3>
          <div className="space-y-4">
            {userProfile.statistics?.organizerMetrics?.recentEvents?.length >
            0 ? (
              userProfile.statistics.organizerMetrics.recentEvents.map(
                (event: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                  >
                    <div>
                      <h4 className="text-white font-medium">{event.title}</h4>
                      <p className="text-slate-400 text-sm">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        event.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                )
              )
            ) : (
              <p className="text-slate-400 text-center py-8">
                No recent events
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Recent Bookings
          </h3>
          <div className="space-y-4">
            {userProfile.statistics?.userMetrics?.recentBookings?.length > 0 ? (
              userProfile.statistics.userMetrics.recentBookings.map(
                (booking: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                  >
                    <div>
                      <h4 className="text-white font-medium">
                        {booking.event?.title}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {new Date(
                          booking.event?.startDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-purple-400 text-sm font-medium">
                        {booking.ticketType} - {booking.quantity} ticket(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          booking.status === "confirmed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                      <p className="text-white font-medium mt-1">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        }).format(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-slate-400 text-center py-8">
                No recent bookings
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatisticsTab({ userProfile }: { userProfile: any }) {
  const isOrganizer = userProfile.role === "organizer";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Core Statistics */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="text-purple-400" size={20} />
          Core Statistics
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Events Created</span>
            <span className="text-white font-medium">
              {userProfile.statistics?.eventsCreated ||
                userProfile.statistics?.organizerMetrics?.totalEventsCreated ||
                0}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Events Attended</span>
            <span className="text-white font-medium">
              {userProfile.statistics?.eventsAttended ||
                userProfile.statistics?.userMetrics?.totalEventsAttended ||
                0}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-300">Account Age</span>
            <span className="text-white font-medium">
              {userProfile.statistics?.accountAge || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Role-specific Metrics */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-green-400" size={20} />
          {isOrganizer ? "Organizer Metrics" : "User Metrics"}
        </h3>

        {isOrganizer ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-300">Total Revenue</span>
              <span className="text-white font-medium">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(
                  userProfile.statistics?.organizerMetrics?.totalRevenue || 0
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-300">Pending Events</span>
              <span className="text-white font-medium">
                {userProfile.statistics?.organizerMetrics?.pendingEvents || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-300">Approved Events</span>
              <span className="text-white font-medium">
                {userProfile.statistics?.organizerMetrics?.approvedEvents || 0}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-300">Total Events Attended</span>
              <span className="text-white font-medium">
                {userProfile.statistics?.userMetrics?.totalEventsAttended || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-300">Upcoming Events</span>
              <span className="text-white font-medium">
                {userProfile.statistics?.userMetrics?.upcomingEvents || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-300">Favorite Category</span>
              <span className="text-purple-400 font-medium">
                {userProfile.statistics?.userMetrics?.favoriteCategory}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BusinessTab({ userProfile }: { userProfile: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Business Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Award className="text-purple-400" size={20} />
          Business Information
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Business Type</span>
            <span className="text-white font-medium capitalize">
              {userProfile.businessType || "Individual"}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Verification Status</span>
            <span
              className={`flex items-center gap-2 ${
                userProfile.verified ? "text-green-400" : "text-yellow-400"
              }`}
            >
              <Verified size={16} />
              {userProfile.verified ? "Verified" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-green-400" size={20} />
          Performance Metrics
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <span className="text-slate-300">Total Events Created</span>
            <span className="text-white font-medium">
              {userProfile.totalEventsCreated ||
                userProfile.statistics?.organizerMetrics?.totalEventsCreated ||
                userProfile.statistics?.eventsCreated ||
                0}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-slate-300">Average Attendance</span>
            <span className="text-white font-medium">
              {userProfile.statistics?.organizerMetrics
                ?.averageEventAttendance || 0}{" "}
              people
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-slate-700 rounded-full" />
            <div className="flex-1">
              <div className="h-8 bg-slate-700 rounded w-64 mb-4" />
              <div className="h-4 bg-slate-700 rounded w-48 mb-2" />
              <div className="h-4 bg-slate-700 rounded w-32" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-700 rounded w-24 mb-4" />
              <div className="h-8 bg-slate-700 rounded w-16 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-slate-900 pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
