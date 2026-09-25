"use client";
import { Button } from "@/components/Button";
import { toggleUserBan } from "./actions";

export function BanButton({ userId, banned }: { userId: string; banned: boolean }) {
  return (
    <form action={toggleUserBan.bind(null, userId, !banned)}>
      <Button
        type="submit"
        size="sm"
        variant={banned ? "secondary" : "danger"}
        onClick={(e) => {
          const msg = banned ? "Unban this user?" : "Ban this user? They won't be able to sign in until unbanned.";
          if (!confirm(msg)) e.preventDefault();
        }}
      >
        {banned ? "Unban" : "Ban"}
      </Button>
    </form>
  );
}
