"use client";

import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";

export default function ConditionalNav() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (isAuthPage) {
    return null;
  }

  return <MobileNav />;
}
