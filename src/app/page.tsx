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

      {/* Features Section */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose ShowPass?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                We make it easy to discover and attend the events you love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: <Calendar className="h-8 w-8" aria-hidden="true" />,
                  title: "Easy Booking",
                  description:
                    "Book tickets in just a few clicks with our streamlined process",
                },
                {
                  icon: <Users className="h-8 w-8" aria-hidden="true" />,
                  title: "Community",
                  description:
                    "Connect with like-minded people and discover new interests",
                },
                {
                  icon: <Star className="h-8 w-8" aria-hidden="true" />,
                  title: "Quality Events",
                  description:
                    "Curated selection of high-quality events and experiences",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-b from-slate-800/60 to-slate-800/30 ring-1 ring-white/10 hover:ring-purple-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4 text-purple-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-center">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-14">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-purple-500 bg-purple-900 text-white font-semibold shadow-lg shadow-purple-900/20 transition-all duration-300 hover:scale-105"
              >
                Explore Events
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
