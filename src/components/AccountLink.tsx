"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function AccountLink() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Link
      href={user ? "/account" : "/account/login"}
      className="focus-ring flex items-center gap-1.5 rounded-control border border-border bg-surface-2 px-3 py-1.5 text-xs text-text hover:bg-surface"
    >
      <User size={14} />
      {user ? "My Account" : "Log in"}
    </Link>
  );
}
