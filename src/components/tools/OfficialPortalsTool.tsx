import { ExternalLink, Info } from "lucide-react";

interface PortalLink {
  name: string;
  description: string;
  url: string;
}
interface PortalGroup {
  group: string;
  links: PortalLink[];
}

const GROUPS: PortalGroup[] = [
  {
    group: "Aadhaar (UIDAI)",
    links: [
      { name: "UIDAI Official Website", description: "General Aadhaar information and services", url: "https://uidai.gov.in/" },
      { name: "myAadhaar Self-Service Portal", description: "Update address, download Aadhaar, order PVC card", url: "https://myaadhaar.uidai.gov.in/" },
    ],
  },
  {
    group: "PAN",
    links: [
      { name: "Protean (formerly NSDL) PAN Services", description: "Apply for new PAN, corrections, reprint", url: "https://tinpan.proteantech.in/services/pan/pan-index" },
      { name: "UTIITSL PAN Services", description: "Alternative official PAN service provider", url: "https://www.pan.utiitsl.com/" },
      { name: "Income Tax e-Filing Portal", description: "Free instant e-PAN, PAN-Aadhaar linking, other tax services", url: "https://www.incometax.gov.in/iec/foportal/" },
    ],
  },
  {
    group: "Police & Cyber Crime",
    links: [
      { name: "National Cyber Crime Reporting Portal", description: "Report online fraud, cyber crime complaints", url: "https://cybercrime.gov.in/" },
      { name: "Digital Police Portal", description: "Tenant/employee verification, e-FIR (availability varies by state)", url: "https://digitalpolice.gov.in/" },
      { name: "Passport Seva", description: "Passport application and status (police verification handled through this process)", url: "https://www.passportindia.gov.in/" },
    ],
  },
  {
    group: "Banking",
    links: [
      { name: "Reserve Bank of India (RBI)", description: "Banking regulations, complaints, official notices", url: "https://www.rbi.org.in/" },
    ],
  },
];

export function OfficialPortalsTool() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-control border border-primary/30 bg-primary/5 p-3 text-sm text-text">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <p>
          These are direct links to official government/regulator websites. MAX Nexus doesn't submit applications,
          complaints, or forms on your behalf — clicking a link takes you to the real portal to complete the
          process yourself.
        </p>
      </div>

      {GROUPS.map((g) => (
        <div key={g.group}>
          <p className="text-sm font-semibold text-text">{g.group}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {g.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-elevated"
              >
                <div>
                  <p className="text-sm font-medium text-text">{link.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{link.description}</p>
                </div>
                <ExternalLink size={16} className="mt-0.5 shrink-0 text-muted" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
