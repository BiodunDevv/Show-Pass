"use client";

import Link from "next/link";
import { Ticket, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-700/50">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ShowPass</span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              ShowPass is a global self-service ticketing platform for live
              experiences that allows anyone to create, share, find and attend
              events that fuel their passions and enrich their lives.
            </p>
            <div className="flex space-x-3">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Events */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Events</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/events"
                  className="hover:text-white transition-colors text-sm"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=concerts"
                  className="hover:text-white transition-colors text-sm"
                >
                  Concerts
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=workshops"
                  className="hover:text-white transition-colors text-sm"
                >
                  Workshops
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=conferences"
                  className="hover:text-white transition-colors text-sm"
                >
                  Conferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/my-tickets"
                  className="hover:text-white transition-colors text-sm"
                >
                  My Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-white transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="hover:text-white transition-colors text-sm"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 ShowPass. All rights reserved.
          </p>
          <div className="flex space-x-6 text-gray-400 text-sm">
            <span>Made with ❤️ for event lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
