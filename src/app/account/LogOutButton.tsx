"use client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/Button";
import { logOutAction } from "./actions";

export function LogOutButton() {
  return (
    <form action={logOutAction}>
      <Button type="submit" variant="secondary" size="sm"><LogOut size={14} /> Log out</Button>
    </form>
  );
}
