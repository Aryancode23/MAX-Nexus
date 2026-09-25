export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-text">Privacy Center</h1>

      <div className="mt-6 space-y-6 text-muted">
        <section>
          <h2 className="font-semibold text-text">Tools processed in your browser</h2>
          <p className="mt-1">
            Image Resizer, Signature Resizer, Passport Photo Maker, Image to PDF, QR Code Generator and Word Counter
            run entirely on your device. Your files are never uploaded to a server for these tools.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-text">Tools processed on our server</h2>
          <p className="mt-1">
            Tools marked "Server processed" will state this clearly on their page before you upload anything, once
            they are implemented.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-text">Local storage</h2>
          <p className="mt-1">
            Your theme preference is saved in your browser's local storage. Favorites and recently-used tools will
            use the same mechanism once implemented, and never leave your device unless you create an account.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-text">Accounts</h2>
          <p className="mt-1">
            Admin accounts are authenticated through Supabase and protected by hashed passwords — this site never
            stores or has access to your plaintext password.
          </p>
        </section>
      </div>
    </div>
  );
}
