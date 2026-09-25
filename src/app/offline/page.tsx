import { WifiOff } from "lucide-react";

export const metadata = { title: "You're offline" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <WifiOff size={32} className="text-muted" />
      <h1 className="mt-4 text-xl font-bold text-text">You're offline</h1>
      <p className="mt-2 text-sm text-muted">
        This page needs an internet connection to load. Tools you've already opened may still work if their
        assets were cached — try going back, or reconnect and reload.
      </p>
    </div>
  );
}
