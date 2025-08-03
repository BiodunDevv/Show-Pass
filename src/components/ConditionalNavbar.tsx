"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Shared/NavBar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on auth pages
  const hideNavbar =
    pathname?.startsWith("/auth/signin") ||
    pathname?.startsWith("/auth/signup");

  if (hideNavbar) {
    return null;
  }

  return <Navbar />;
}
