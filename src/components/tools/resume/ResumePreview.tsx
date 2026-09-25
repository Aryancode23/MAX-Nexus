import { forwardRef } from "react";
import type { ResumeData, TemplateDef } from "./resumeTypes";

interface Props {
  data: ResumeData;
  template: TemplateDef;
}

export const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data, template }, ref) => {
  const { name, role, contact, summary, skills, experience, education, projects, certifications, photoDataUrl } = data;
  const exp = experience.filter((e) => e.title);
  const edu = education.filter((e) => e.title);
  const proj = projects.filter((e) => e.title);
  const certs = certifications.filter((e) => e.title);
  const accent = template.accent;

  const Photo = ({ size = 88 }: { size?: number }) =>
    photoDataUrl ? (
      <img src={photoDataUrl} alt="" style={{ width: size, height: size }} className="rounded-full object-cover" />
    ) : (
      <div
        style={{ width: size, height: size, backgroundColor: `${accent}22` }}
        className="flex items-center justify-center rounded-full text-xs text-gray-400"
      >
        Photo
      </div>
    );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: accent }}>{children}</p>
  );

  const ExperienceBlock = () => (
    <>
      {exp.length > 0 && (
        <div className="mb-3">
          <SectionTitle>Experience</SectionTitle>
          {exp.map((e) => (
            <div key={e.id} className="mt-1.5 text-[11px]">
              <div className="flex justify-between font-semibold text-gray-800"><span>{e.title}</span><span>{e.period}</span></div>
              {e.subtitle && <p className="text-gray-500">{e.subtitle}</p>}
              {e.description && <p className="text-gray-700">{e.description}</p>}
            </div>
          ))}
        </div>
      )}
      {edu.length > 0 && (
        <div className="mb-3">
          <SectionTitle>Education</SectionTitle>
          {edu.map((e) => (
            <div key={e.id} className="mt-1.5 text-[11px]">
              <div className="flex justify-between font-semibold text-gray-800"><span>{e.title}</span><span>{e.period}</span></div>
              {e.subtitle && <p className="text-gray-500">{e.subtitle}</p>}
            </div>
          ))}
        </div>
      )}
      {proj.length > 0 && (
        <div className="mb-3">
          <SectionTitle>Projects</SectionTitle>
          {proj.map((e) => (
            <div key={e.id} className="mt-1.5 text-[11px]">
              <div className="flex justify-between font-semibold text-gray-800"><span>{e.title}</span><span>{e.period}</span></div>
              {e.subtitle && <p className="text-gray-500">{e.subtitle}</p>}
              {e.description && <p className="text-gray-700">{e.description}</p>}
            </div>
          ))}
        </div>
      )}
      {certs.length > 0 && (
        <div className="mb-3">
          <SectionTitle>Certifications</SectionTitle>
          {certs.map((e) => (
            <div key={e.id} className="mt-1.5 text-[11px]">
              <div className="flex justify-between font-semibold text-gray-800"><span>{e.title}</span><span>{e.period}</span></div>
              {e.subtitle && <p className="text-gray-500">{e.subtitle}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ---- Classic: plain single column, no photo, ATS-safe ----
  if (template.id === "classic") {
    return (
      <div ref={ref} className="bg-white p-8 text-black" style={{ width: 595, minHeight: 842 }}>
        <h2 className="text-xl font-bold">{name || "Your Name"}</h2>
        {role && <p className="text-sm text-gray-600">{role}</p>}
        {contact && <p className="text-xs text-gray-500">{contact}</p>}
        <hr className="my-3" />
        {summary && <p className="mb-3 text-xs text-gray-800">{summary}</p>}
        <ExperienceBlock />
        {skills && (
          <div>
            <SectionTitle>Skills</SectionTitle>
            <p className="mt-1 text-xs text-gray-800">{skills}</p>
          </div>
        )}
      </div>
    );
  }

  // ---- Minimal: airy, thin accent rule ----
  if (template.id === "minimal") {
    return (
      <div ref={ref} className="bg-white p-10 text-black" style={{ width: 595, minHeight: 842 }}>
        <h2 className="text-2xl font-light tracking-wide">{name || "Your Name"}</h2>
        {role && <p className="mt-1 text-sm" style={{ color: accent }}>{role}</p>}
        {contact && <p className="mt-1 text-xs text-gray-400">{contact}</p>}
        <div className="my-5 h-px w-full" style={{ backgroundColor: accent }} />
        {summary && <p className="mb-5 text-xs leading-relaxed text-gray-700">{summary}</p>}
        <ExperienceBlock />
        {skills && (
          <div>
            <SectionTitle>Skills</SectionTitle>
            <p className="mt-1 text-xs text-gray-800">{skills}</p>
          </div>
        )}
      </div>
    );
  }

  // ---- Compact: dense, small type ----
  if (template.id === "compact") {
    return (
      <div ref={ref} className="bg-white p-6 text-black" style={{ width: 595, minHeight: 842, fontSize: 10 }}>
        <div className="flex items-baseline justify-between border-b pb-1" style={{ borderColor: accent }}>
          <h2 className="text-base font-bold">{name || "Your Name"}</h2>
          <span className="text-[10px] text-gray-500">{contact}</span>
        </div>
        {role && <p className="mt-0.5 text-xs font-medium" style={{ color: accent }}>{role}</p>}
        {summary && <p className="mt-2 text-[10px] text-gray-700">{summary}</p>}
        <div className="mt-2"><ExperienceBlock /></div>
        {skills && (
          <div>
            <SectionTitle>Skills</SectionTitle>
            <p className="mt-0.5 text-[10px] text-gray-800">{skills}</p>
          </div>
        )}
      </div>
    );
  }

  // ---- Modern: colored sidebar with photo ----
  if (template.id === "modern") {
    return (
      <div ref={ref} className="flex bg-white text-black" style={{ width: 595, minHeight: 842 }}>
        <div className="w-[32%] p-5 text-white" style={{ backgroundColor: accent }}>
          <div className="flex justify-center"><Photo size={80} /></div>
          <h2 className="mt-3 text-center text-sm font-bold">{name || "Your Name"}</h2>
          {role && <p className="text-center text-[10px] opacity-90">{role}</p>}
          {contact && <p className="mt-3 text-[9px] opacity-80">{contact}</p>}
          {skills && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase">Skills</p>
              <p className="mt-1 text-[9px] opacity-90">{skills}</p>
            </div>
          )}
        </div>
        <div className="flex-1 p-5">
          {summary && <p className="mb-3 text-[11px] text-gray-700">{summary}</p>}
          <ExperienceBlock />
        </div>
      </div>
    );
  }

  // ---- Creative: bold header band with photo ----
  if (template.id === "creative") {
    return (
      <div ref={ref} className="bg-white text-black" style={{ width: 595, minHeight: 842 }}>
        <div className="flex items-center gap-4 p-6 text-white" style={{ backgroundColor: accent }}>
          <Photo size={72} />
          <div>
            <h2 className="text-lg font-bold">{name || "Your Name"}</h2>
            {role && <p className="text-xs opacity-90">{role}</p>}
            {contact && <p className="text-[10px] opacity-80">{contact}</p>}
          </div>
        </div>
        <div className="p-6">
          {summary && <p className="mb-3 text-xs text-gray-700">{summary}</p>}
          <ExperienceBlock />
          {skills && (
            <div>
              <SectionTitle>Skills</SectionTitle>
              <p className="mt-1 text-xs text-gray-800">{skills}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Two-column: narrow rail + wide content ----
  return (
    <div ref={ref} className="flex bg-white text-black" style={{ width: 595, minHeight: 842 }}>
      <div className="w-[30%] border-r p-4" style={{ borderColor: accent }}>
        <div className="flex justify-center"><Photo size={76} /></div>
        <h2 className="mt-2 text-center text-sm font-bold">{name || "Your Name"}</h2>
        {role && <p className="text-center text-[10px] text-gray-500">{role}</p>}
        {contact && <p className="mt-2 text-[9px] text-gray-500">{contact}</p>}
        {skills && (
          <div className="mt-3">
            <SectionTitle>Skills</SectionTitle>
            <p className="mt-1 text-[9px] text-gray-700">{skills}</p>
          </div>
        )}
      </div>
      <div className="flex-1 p-5">
        {summary && <p className="mb-3 text-[11px] text-gray-700">{summary}</p>}
        <ExperienceBlock />
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";
