"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Menu, X, User, Settings, LogOut, Ticket } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, role, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (dropdownOpen && !target.closest("[data-dropdown]")) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      }`}
      style={{
        transform: "translateY(0)",
        animation: "slideDown 0.6s ease-out",
      }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .scale-in {
          animation: scaleIn 0.2s ease-out;
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }

        .hover-translate:hover {
          transform: translateX(4px);
        }
      `}</style>

      <div className="max-w-9xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover-scale bg-gradient-to-r from-purple-500 to-purple-600`}
            >
              <Ticket
                className={`h-5 w-5 ${scrolled ? "text-white" : "text-white"}`}
              />
            </div>
            <span
              className={`text-xl font-bold transition-colors duration-300 ${
                scrolled ? "text-white" : "text-white"
              }`}
            >
              ShowPass
            </span>
          </Link>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            {[
              { href: "/", label: "Home" },
              { href: "/events", label: "Browse Events" },
              { href: "/blog", label: "Blog" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-all duration-300 hover-scale ${
                  scrolled
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {user && role === "organizer" && (
              <>
                <Link
                  href="/organizer/events"
                  className={`font-medium transition-all duration-300 hover-scale ${
                    scrolled
                      ? "text-gray-300 hover:text-purple-400"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  My Events
                </Link>
                <Link
                  href="/organizer/analytics"
                  className={`font-medium transition-all duration-300 hover-scale ${
                    scrolled
                      ? "text-gray-300 hover:text-purple-400"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}

            {user && role === "user" && (
              <>
                <Link
                  href="/my-tickets"
                  className={`font-medium transition-all duration-300 hover-scale ${
                    scrolled
                      ? "text-gray-300 hover:text-purple-400"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  My Tickets
                </Link>
                <Link
                  href="/favorites"
                  className={`font-medium transition-all duration-300 hover-scale ${
                    scrolled
                      ? "text-gray-300 hover:text-purple-400"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Favorites
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" data-dropdown>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`relative h-10 w-10 rounded-full transition-all duration-300 hover-scale`}
                >
                  <div className="h-8 w-8 mx-auto mt-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName?.charAt(0) || user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 scale-in">
                    <div className="flex items-center justify-start gap-2 p-4 border-b border-gray-100">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate w-40">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover-translate transition-all duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover-translate transition-all duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover-translate transition-all duration-200"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 border border-white text-white hover:bg-white hover:text-slate-900 bg-transparent backdrop-blur-sm hover-scale`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 border border-white text-white hover:bg-white hover:text-slate-900 bg-transparent backdrop-blur-sm hover-scale`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                setScrolled(true);
              }}
              className={`p-2 rounded-full transition-colors duration-300 ${
                scrolled
                  ? "text-white hover:bg-slate-800"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {isOpen ? (
                <X
                  className="h-6 w-6"
                  style={{ animation: "fadeIn 0.2s ease-out" }}
                />
              ) : (
                <Menu
                  className="h-6 w-6"
                  style={{ animation: "fadeIn 0.2s ease-out" }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            className={`md:hidden py-4 border-t fade-in ${
              scrolled ? "border-slate-700" : "border-white/20"
            }`}
          >
            <div className="flex flex-col space-y-4">
              {[
                { href: "/", label: "Home" },
                { href: "/events", label: "Browse Events" },
                { href: "/blog", label: "Blog" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-colors duration-300 hover-translate ${
                    scrolled
                      ? "text-gray-300 hover:text-purple-400"
                      : "text-white/90 hover:text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user && role === "organizer" && (
                <>
                  <Link
                    href="/organizer/events"
                    className={`font-medium transition-colors duration-300 hover-translate ${
                      scrolled
                        ? "text-gray-300 hover:text-purple-400"
                        : "text-white/90 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    My Events
                  </Link>
                  <Link
                    href="/organizer/analytics"
                    className={`font-medium transition-colors duration-300 hover-translate ${
                      scrolled
                        ? "text-gray-300 hover:text-purple-400"
                        : "text-white/90 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Analytics
                  </Link>
                </>
              )}

              {user && role === "user" && (
                <>
                  <Link
                    href="/my-tickets"
                    className={`font-medium transition-colors duration-300 hover-translate ${
                      scrolled
                        ? "text-gray-300 hover:text-purple-400"
                        : "text-white/90 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    My Tickets
                  </Link>
                  <Link
                    href="/favorites"
                    className={`font-medium transition-colors duration-300 hover-translate ${
                      scrolled
                        ? "text-gray-300 hover:text-purple-400"
                        : "text-white/90 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Favorites
                  </Link>
                </>
              )}

              {user ? (
                <div
                  className={`flex flex-col space-y-2 pt-4 border-t ${
                    scrolled ? "border-slate-700" : "border-white/20"
                  }`}
                >
                  <Link
                    href="/profile"
                    className={`font-medium transition-colors duration-300 hover-translate ${
                      scrolled
                        ? "text-gray-300 hover:text-purple-400"
                        : "text-white/90 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`text-left font-medium transition-colors duration-300 hover-translate ${
                      scrolled
                        ? "text-gray-300 hover:text-purple-400"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div
                  className={`pt-4 border-t ${
                    scrolled ? "border-slate-700" : "border-white/20"
                  }`}
                >
                  <Link
                    href="/auth/signin"
                    className={`block w-full text-center py-3 rounded-full font-semibold transition-all duration-300 border border-white text-white hover:bg-white hover:text-slate-900 bg-transparent hover-scale`}
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={`block w-full text-center py-3 mt-2 rounded-full font-semibold transition-all duration-300 border border-white text-white hover:bg-white hover:text-slate-900 bg-transparent hover-scale`}
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
