import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  message = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-purple-600`}
      />
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse bg-gray-300 rounded ${className}`} />;
}

interface BookingPageLoadingProps {
  className?: string;
}

export function BookingPageLoading({
  className = "",
}: BookingPageLoadingProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event summary skeleton */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-700 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket selection skeleton */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border-2 border-slate-600 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-700 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                      <div className="space-y-1">
                        <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-6 bg-slate-700 rounded w-16"></div>
                      <div className="h-4 bg-slate-700 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity selection skeleton */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 bg-slate-700 rounded w-32"></div>
                <div className="h-4 bg-slate-700 rounded w-40"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
                <div className="w-12 h-8 bg-slate-700 rounded"></div>
                <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Attendee info skeleton */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-slate-700 rounded w-1/3"></div>
              <div className="h-4 bg-slate-700 rounded w-48"></div>
            </div>
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="h-5 bg-slate-600 rounded w-24 mb-4"></div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-600 rounded w-16"></div>
                      <div className="h-10 bg-slate-600 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-600 rounded w-20"></div>
                      <div className="h-10 bg-slate-600 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-600 rounded w-24"></div>
                      <div className="h-10 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Price summary skeleton */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="h-6 bg-slate-700 rounded w-1/2 mb-6"></div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-700 rounded w-24"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
              </div>
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-700 rounded w-16"></div>
                  <div className="h-4 bg-slate-700 rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                  <div className="h-4 bg-slate-700 rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-700 rounded w-16"></div>
                  <div className="h-4 bg-slate-700 rounded w-12"></div>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between">
                  <div className="h-6 bg-slate-700 rounded w-12"></div>
                  <div className="h-6 bg-slate-700 rounded w-16"></div>
                </div>
              </div>
            </div>
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="mt-4 h-16 bg-slate-700/30 rounded-lg"></div>
          </div>

          {/* Organizer info skeleton */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-700 rounded w-24"></div>
                <div className="h-3 bg-slate-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
