"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/Button";
import { signOutAction } from "./login/actions";

export function AdminLogoutButton() {
  return (
    <form action={signOutAction}>
      <Button variant="secondary" size="sm" type="submit">
        <LogOut size={14} /> Sign out
      </Button>
    </form>
  );
}
