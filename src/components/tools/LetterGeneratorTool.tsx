"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/Button";

interface FieldDef { key: string; label: string; placeholder?: string; }
interface LetterTemplate {
  id: string;
  category: "School" | "College" | "General" | "Job" | "Government" | "Verification";
  name: string;
  subject: string;
  fields: FieldDef[];
  body: (v: Record<string, string>) => string;
}

const TEMPLATES: LetterTemplate[] = [
  {
    id: "school-leave",
    category: "School",
    name: "Leave Application",
    subject: "Application for Leave",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "className", label: "Class / Section" },
      { key: "fromDate", label: "Leave from" },
      { key: "toDate", label: "Leave to" },
      { key: "reason", label: "Reason", placeholder: "e.g. fever and viral infection" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, a student of class ${v.className || "[Class]"}, would like to request leave from ${v.fromDate || "[From Date]"} to ${v.toDate || "[To Date]"} due to ${v.reason || "[Reason]"}. Kindly grant me leave for the above-mentioned period.\n\nThank you for your consideration.`,
  },
  {
    id: "school-bonafide",
    category: "School",
    name: "Bonafide Certificate Request",
    subject: "Request for Bonafide Certificate",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "className", label: "Class / Section" },
      { key: "purpose", label: "Purpose", placeholder: "e.g. opening a bank account" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, studying in class ${v.className || "[Class]"}, request you to kindly issue a Bonafide Certificate for the purpose of ${v.purpose || "[Purpose]"}. I would be grateful for your assistance.\n\nThank you.`,
  },
  {
    id: "college-scholarship",
    category: "College",
    name: "Scholarship Request",
    subject: "Application for Scholarship",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "course", label: "Course / Year" },
      { key: "reason", label: "Reason for request" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, currently enrolled in ${v.course || "[Course/Year]"}, would like to apply for a scholarship. ${v.reason || "[Reason]"}. I request you to kindly consider my application.\n\nThank you for your time and consideration.`,
  },
  {
    id: "college-correction",
    category: "College",
    name: "Name/Details Correction Request",
    subject: "Request for Correction of Records",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "rollNumber", label: "Roll number" },
      { key: "correction", label: "What needs correcting", placeholder: "e.g. date of birth spelled incorrectly" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, roll number ${v.rollNumber || "[Roll Number]"}, would like to bring to your notice that ${v.correction || "[Correction Needed]"}. I kindly request you to correct this in the official records at the earliest.\n\nThank you.`,
  },
  {
    id: "general-complaint",
    category: "General",
    name: "Complaint Letter",
    subject: "Complaint Regarding [Issue]",
    fields: [
      { key: "issue", label: "Issue", placeholder: "briefly describe the problem" },
      { key: "details", label: "Details" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI am writing to bring to your attention an issue regarding ${v.issue || "[Issue]"}. ${v.details || "[Details]"}\n\nI request you to look into this matter and take the necessary action at the earliest.\n\nThank you.`,
  },
  {
    id: "general-permission",
    category: "General",
    name: "Permission Letter",
    subject: "Request for Permission",
    fields: [
      { key: "purpose", label: "What permission is for" },
      { key: "dates", label: "Relevant date(s)" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI am writing to request permission for ${v.purpose || "[Purpose]"} on ${v.dates || "[Date(s)]"}. I would be grateful if you could grant the necessary permission.\n\nThank you for your consideration.`,
  },
  {
    id: "job-application",
    category: "Job",
    name: "Job Application",
    subject: "Application for the Position of [Role]",
    fields: [
      { key: "role", label: "Role applied for" },
      { key: "experience", label: "Relevant experience/skills", placeholder: "one or two lines" },
    ],
    body: (v) =>
      `Dear Hiring Manager,\n\nI am writing to express my interest in the position of ${v.role || "[Role]"}. ${v.experience || "[Relevant experience]"}. I would welcome the opportunity to discuss how I can contribute to your team.\n\nThank you for considering my application.`,
  },
  {
    id: "job-resignation",
    category: "Job",
    name: "Resignation Letter",
    subject: "Resignation Letter",
    fields: [
      { key: "role", label: "Your role" },
      { key: "lastDate", label: "Last working day" },
    ],
    body: (v) =>
      `Dear [Manager's Name],\n\nI am writing to formally notify you of my resignation from my position as ${v.role || "[Role]"}, effective ${v.lastDate || "[Last Working Day]"}. I appreciate the opportunities I've had during my time here and will ensure a smooth handover before I leave.\n\nThank you for your understanding.`,
  },
  {
    id: "school-fee-concession",
    category: "School",
    name: "Fee Concession Request",
    subject: "Request for Fee Concession",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "className", label: "Class / Section" },
      { key: "reason", label: "Reason for request" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, studying in class ${v.className || "[Class]"}, would like to request a concession in school fees. ${v.reason || "[Reason]"}. I request you to kindly consider my request.\n\nThank you for your understanding.`,
  },
  {
    id: "school-transfer-certificate",
    category: "School",
    name: "Transfer Certificate Request",
    subject: "Request for Transfer Certificate",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "className", label: "Class / Section" },
      { key: "reason", label: "Reason for transfer" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, studying in class ${v.className || "[Class]"}, request you to kindly issue my Transfer Certificate. Reason: ${v.reason || "[Reason]"}. I would be grateful for your prompt assistance.\n\nThank you.`,
  },
  {
    id: "school-character-certificate",
    category: "School",
    name: "Character Certificate Request",
    subject: "Request for Character Certificate",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "className", label: "Class / Section" },
      { key: "purpose", label: "Purpose" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, a student of class ${v.className || "[Class]"}, request you to kindly issue my Character Certificate for the purpose of ${v.purpose || "[Purpose]"}. I would be grateful for your assistance.\n\nThank you.`,
  },
  {
    id: "college-leave",
    category: "College",
    name: "Leave Application",
    subject: "Application for Leave",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "course", label: "Course / Year" },
      { key: "fromDate", label: "Leave from" },
      { key: "toDate", label: "Leave to" },
      { key: "reason", label: "Reason" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, enrolled in ${v.course || "[Course/Year]"}, request leave from ${v.fromDate || "[From Date]"} to ${v.toDate || "[To Date]"} due to ${v.reason || "[Reason]"}. Kindly grant me leave for the above period.\n\nThank you.`,
  },
  {
    id: "college-certificate-request",
    category: "College",
    name: "Certificate Request",
    subject: "Request for Certificate",
    fields: [
      { key: "studentName", label: "Student name" },
      { key: "course", label: "Course / Year" },
      { key: "certificateType", label: "Certificate needed", placeholder: "e.g. Provisional, Bonafide" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.studentName || "[Student Name]"}, currently enrolled in ${v.course || "[Course/Year]"}, request you to kindly issue my ${v.certificateType || "[Certificate Type]"} Certificate at the earliest.\n\nThank you for your consideration.`,
  },
  {
    id: "general-request",
    category: "General",
    name: "Request Letter",
    subject: "Request Regarding [Matter]",
    fields: [
      { key: "matter", label: "What you're requesting" },
      { key: "details", label: "Details" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI am writing to request ${v.matter || "[Matter]"}. ${v.details || "[Details]"}\n\nI would be grateful for your kind consideration of this request.\n\nThank you.`,
  },
  {
    id: "general-declaration",
    category: "General",
    name: "Declaration",
    subject: "Declaration",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "statement", label: "What you are declaring" },
    ],
    body: (v) =>
      `I, ${v.fullName || "[Full Name]"}, do hereby declare that ${v.statement || "[Statement]"}. I confirm that the above information is true to the best of my knowledge and belief.`,
  },
  {
    id: "general-undertaking",
    category: "General",
    name: "Undertaking",
    subject: "Letter of Undertaking",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "commitment", label: "What you are undertaking to do" },
    ],
    body: (v) =>
      `I, ${v.fullName || "[Full Name]"}, hereby give an undertaking that ${v.commitment || "[Commitment]"}. I understand the responsibility this entails and agree to abide by it.`,
  },
  {
    id: "job-cover-letter",
    category: "Job",
    name: "Cover Letter",
    subject: "Cover Letter — [Role]",
    fields: [
      { key: "role", label: "Role applying for" },
      { key: "highlight", label: "Key strength to highlight" },
    ],
    body: (v) =>
      `Dear Hiring Manager,\n\nI am excited to apply for the ${v.role || "[Role]"} position. ${v.highlight || "[Key strength]"}. I would welcome the chance to bring this experience to your team and discuss how I can contribute.\n\nThank you for your time and consideration.`,
  },
  {
    id: "job-joining",
    category: "Job",
    name: "Joining Letter",
    subject: "Confirmation of Joining",
    fields: [
      { key: "role", label: "Role" },
      { key: "joiningDate", label: "Joining date" },
    ],
    body: (v) =>
      `Dear [Manager's Name],\n\nI am writing to confirm that I will be joining as ${v.role || "[Role]"} on ${v.joiningDate || "[Joining Date]"}. I look forward to contributing to the team and getting started.\n\nThank you.`,
  },
  {
    id: "gov-pan-correction",
    category: "Government",
    name: "PAN Card Correction Request",
    subject: "Request for Correction in PAN Card Details",
    fields: [
      { key: "fullName", label: "Full name (as on PAN)" },
      { key: "panNumber", label: "PAN number" },
      { key: "correction", label: "What needs correcting", placeholder: "e.g. date of birth, spelling of name" },
    ],
    body: (v) =>
      `I, ${v.fullName || "[Full Name]"}, holder of PAN ${v.panNumber || "[PAN Number]"}, would like to bring to your notice that ${v.correction || "[Correction Needed]"}. I request you to kindly guide me through the correction process or forward this to the appropriate department.\n\nNote: this letter only requests a correction — it does not issue or modify any PAN record itself; corrections must be filed through the official NSDL/UTIITSL/Income Tax portal.\n\nThank you.`,
  },
  {
    id: "gov-birth-certificate",
    category: "Government",
    name: "Birth Certificate Application",
    subject: "Application for Birth Certificate",
    fields: [
      { key: "childName", label: "Name of person the certificate is for" },
      { key: "dob", label: "Date of birth" },
      { key: "placeOfBirth", label: "Place of birth" },
      { key: "parentNames", label: "Parents' names" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI request you to kindly issue a Birth Certificate for ${v.childName || "[Name]"}, born on ${v.dob || "[Date of Birth]"} at ${v.placeOfBirth || "[Place of Birth]"}, to parents ${v.parentNames || "[Parents' Names]"}. I have attached the necessary supporting documents with this application.\n\nNote: this is only an application — the certificate itself is issued exclusively by your local municipal/panchayat registrar's office.\n\nThank you.`,
  },
  {
    id: "gov-self-declaration",
    category: "Government",
    name: "Self Declaration Form",
    subject: "Self Declaration",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "address", label: "Address" },
      { key: "statement", label: "What you are declaring" },
    ],
    body: (v) =>
      `SELF DECLARATION\n\nI, ${v.fullName || "[Full Name]"}, residing at ${v.address || "[Address]"}, do hereby solemnly declare that ${v.statement || "[Statement]"}. I declare that the information given above is true and correct to the best of my knowledge, and I shall be liable for any false claim.`,
  },
  {
    id: "verify-lost-document",
    category: "Verification",
    name: "Lost Document Declaration",
    subject: "Declaration of Lost Document",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "documentName", label: "Document lost", placeholder: "e.g. Aadhaar card, driving license" },
      { key: "circumstances", label: "How/where it was lost" },
    ],
    body: (v) =>
      `I, ${v.fullName || "[Full Name]"}, hereby declare that my ${v.documentName || "[Document]"} has been lost. ${v.circumstances || "[Circumstances]"}. I request that a copy of this declaration be kept on record and that I be issued a duplicate on completion of the required process.`,
  },
  {
    id: "verify-lost-mobile",
    category: "Verification",
    name: "Lost Mobile Declaration",
    subject: "Declaration of Lost Mobile Phone",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "phoneModel", label: "Phone model" },
      { key: "imei", label: "IMEI number (if known)" },
      { key: "circumstances", label: "How/where it was lost" },
    ],
    body: (v) =>
      `I, ${v.fullName || "[Full Name]"}, hereby declare that my mobile phone (${v.phoneModel || "[Model]"}, IMEI: ${v.imei || "[IMEI]"}) was lost. ${v.circumstances || "[Circumstances]"}. I am filing this declaration for record and insurance/blocking purposes.`,
  },
  {
    id: "verify-lost-certificate",
    category: "Verification",
    name: "Lost Certificate Declaration",
    subject: "Declaration of Lost Certificate",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "certificateName", label: "Certificate lost", placeholder: "e.g. 10th marksheet, degree certificate" },
      { key: "circumstances", label: "How/where it was lost" },
    ],
    body: (v) =>
      `I, ${v.fullName || "[Full Name]"}, hereby declare that my ${v.certificateName || "[Certificate]"} has been lost. ${v.circumstances || "[Circumstances]"}. I request that this declaration be accepted for the purpose of obtaining a duplicate copy from the issuing institution.`,
  },
  {
    id: "verify-police-complaint",
    category: "Verification",
    name: "Police Complaint Application",
    subject: "Complaint Application",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "incident", label: "What happened" },
      { key: "dateLocation", label: "Date and location of incident" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.fullName || "[Full Name]"}, wish to lodge a complaint regarding the following incident: ${v.incident || "[Incident]"}, which occurred on ${v.dateLocation || "[Date/Location]"}. I request you to kindly look into this matter and take appropriate action.\n\nFor formal FIR registration, this application should be submitted at your local police station or through the Digital Police portal for your state.\n\nThank you.`,
  },
  {
    id: "verify-tenant",
    category: "Verification",
    name: "Tenant Verification Request",
    subject: "Request for Tenant Verification",
    fields: [
      { key: "landlordName", label: "Landlord name" },
      { key: "tenantName", label: "Tenant name" },
      { key: "propertyAddress", label: "Property address" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.landlordName || "[Landlord Name]"}, am renting out my property at ${v.propertyAddress || "[Property Address]"} to ${v.tenantName || "[Tenant Name]"}. I request you to kindly carry out the necessary tenant verification as per standard procedure.\n\nThank you.`,
  },
  {
    id: "verify-employee",
    category: "Verification",
    name: "Employee Verification Request",
    subject: "Request for Employee Verification",
    fields: [
      { key: "companyName", label: "Company name" },
      { key: "employeeName", label: "Employee name" },
      { key: "role", label: "Role" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\n${v.companyName || "[Company Name]"} is requesting verification of ${v.employeeName || "[Employee Name]"}, who has been engaged as ${v.role || "[Role]"}. We request you to kindly carry out the necessary background verification as per standard procedure.\n\nThank you.`,
  },
  {
    id: "verify-address",
    category: "Verification",
    name: "Address Verification Request",
    subject: "Request for Address Verification",
    fields: [
      { key: "fullName", label: "Full name" },
      { key: "address", label: "Address to be verified" },
      { key: "purpose", label: "Purpose" },
    ],
    body: (v) =>
      `Respected Sir/Madam,\n\nI, ${v.fullName || "[Full Name]"}, request verification of my residential address at ${v.address || "[Address]"} for the purpose of ${v.purpose || "[Purpose]"}. I request you to kindly carry out the necessary verification at your earliest convenience.\n\nThank you.`,
  },
];

const CATEGORIES = ["School", "College", "General", "Job", "Government", "Verification"] as const;

export function LetterGeneratorTool() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("School");
  const [templateId, setTemplateId] = useState(TEMPLATES.find((t) => t.category === "School")!.id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [senderName, setSenderName] = useState("");
  const [recipient, setRecipient] = useState("The Principal");

  const templatesInCategory = TEMPLATES.filter((t) => t.category === category);
  const template = TEMPLATES.find((t) => t.id === templateId) ?? templatesInCategory[0];

  const bodyText = useMemo(() => template.body(values), [template, values]);

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56;
    const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    let y = 64;

    doc.setFontSize(11);
    doc.text(new Date().toLocaleDateString(), marginX, y);
    y += 28;
    doc.text(recipient, marginX, y);
    y += 30;

    doc.setFont("helvetica", "bold");
    doc.text(`Subject: ${template.subject}`, marginX, y);
    doc.setFont("helvetica", "normal");
    y += 26;

    const lines = doc.splitTextToSize(bodyText, pageWidth);
    doc.text(lines, marginX, y);
    y += lines.length * 15 + 30;

    doc.text("Yours sincerely,", marginX, y);
    y += 30;
    doc.text(senderName || "[Your Name]", marginX, y);

    doc.save(`${template.name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium">Category</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setTemplateId(TEMPLATES.find((t) => t.category === c)!.id);
                  setValues({});
                }}
                className={`rounded-full border border-border px-3 py-1.5 text-sm ${
                  category === c ? "bg-primary text-primary-foreground" : "bg-surface text-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-sm">
          Letter type
          <select
            value={templateId}
            onChange={(e) => { setTemplateId(e.target.value); setValues({}); }}
            className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
          >
            {templatesInCategory.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Addressed to
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>

        {template.fields.map((f) => (
          <label key={f.key} className="block text-sm">
            {f.label}
            <input
              value={values[f.key] ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
            />
          </label>
        ))}

        <label className="block text-sm">
          Your name (for signature)
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>

        <Button onClick={downloadPdf} className="w-full"><Download size={16} /> Download PDF</Button>
      </div>

      <div className="rounded-card border border-border bg-white p-8 text-sm text-black shadow-soft">
        <p>{new Date().toLocaleDateString()}</p>
        <p className="mt-6">{recipient}</p>
        <p className="mt-6 font-semibold">Subject: {template.subject}</p>
        <p className="mt-4 whitespace-pre-line">{bodyText}</p>
        <p className="mt-8">Yours sincerely,</p>
        <p className="mt-6">{senderName || "[Your Name]"}</p>
      </div>
    </div>
  );
}
