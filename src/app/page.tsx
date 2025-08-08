"use client";

import Link from "next/link";
import {
  Calendar,
  Users,
  Star,
  ArrowRight,
  Ticket,
  Music,
  Code,
  Coffee,
} from "lucide-react";
import { HeroSearch } from "@/components/Home/HeroSearch";
import { UpcomingEventsSection } from "@/components/Home/UpcomingEventsSection";
import { BlogSection } from "@/components/Home/BlogSection";
import { Footer } from "@/components/Shared/Footer";

export default function Home() {
  return (
    <>
      {/* Hero Search Section */}
      <HeroSearch />

      {/* Upcoming Events Section */}
      <UpcomingEventsSection />

      {/* Blog Section */}
      <BlogSection />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-9xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose ShowPass?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                We make it easy to discover and attend the events you love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar className="h-8 w-8" />,
                  title: "Easy Booking",
                  description:
                    "Book tickets in just a few clicks with our streamlined process",
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Community",
                  description:
                    "Connect with like-minded people and discover new interests",
                },
                {
                  icon: <Star className="h-8 w-8" />,
                  title: "Quality Events",
                  description:
                    "Curated selection of high-quality events and experiences",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-8 text-center hover:scale-105 transition-all duration-300 hover:border-purple-500/30"
                >
                  <div className="flex justify-center mb-4 text-purple-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
