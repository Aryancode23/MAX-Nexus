export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-text">Contact</h1>

      <div className="mt-6 space-y-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text">General Contact</p>
          <p className="text-muted">+91 7979758649</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text">Developer Support</p>
          <p className="text-muted">+91 7052164122</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text">Instagram</p>
          <a
            href="https://www.instagram.com/shabashji/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @shabashji
          </a>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        A contact form will be added here once server-side email handling and spam protection are configured.
      </p>
    </div>
  );
}
