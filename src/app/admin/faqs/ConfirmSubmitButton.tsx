"use client";
import { Button } from "@/components/Button";

export function ConfirmSubmitButton({ confirmMessage, children }: { confirmMessage: string; children: React.ReactNode }) {
  return (
    <Button type="submit" variant="danger" size="sm" onClick={(e) => { if (!confirm(confirmMessage)) e.preventDefault(); }}>
      {children}
    </Button>
  );
}
