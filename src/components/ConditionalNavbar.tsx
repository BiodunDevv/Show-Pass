"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Shared/NavBar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on auth pages
  const hideNavbar =
    pathname?.startsWith("/auth/signin") ||
    pathname?.startsWith("/auth/signup") ||
    pathname?.startsWith("/auth/forgot-password") ||
    pathname?.startsWith("/auth/reset-password") ||
    pathname?.startsWith("/auth/verify-email") ||
    pathname?.startsWith("/auth/verify");

  if (hideNavbar) {
    return null;
  }

  return <Navbar />;
}
