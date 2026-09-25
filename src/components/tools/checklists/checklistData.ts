export interface ChecklistItem {
  id: string;
  category: "Banking" | "Aadhaar" | "PAN" | "Police";
  title: string;
  documents: string[];
  notes?: string;
}

export const CHECKLISTS: ChecklistItem[] = [
  // Banking
  { id: "b-savings", category: "Banking", title: "Savings Account Opening", documents: [
    "Filled account opening form", "PAN card (or Form 60 if no PAN)", "Aadhaar card or other address proof",
    "Two recent passport-size photographs", "Initial deposit amount (as per bank's minimum balance rule)",
  ]},
  { id: "b-current", category: "Banking", title: "Current Account Opening (Business)", documents: [
    "Filled account opening form", "PAN card of business/proprietor", "Business registration proof (GST, Shop Act, etc.)",
    "Address proof of business", "Identity & address proof of proprietor/partners", "Passport-size photographs",
  ]},
  { id: "b-kyc", category: "Banking", title: "KYC / Re-KYC Update", documents: [
    "Filled KYC update form", "Updated identity proof (Aadhaar/PAN/Passport/Voter ID)", "Updated address proof",
    "Recent photograph", "Existing account/passbook number",
  ]},
  { id: "b-personal-loan", category: "Banking", title: "Personal Loan Application", documents: [
    "Filled loan application form", "Identity & address proof", "Income proof (salary slips / ITR)",
    "Bank statements (last 3-6 months)", "Passport-size photographs", "PAN card",
  ]},
  { id: "b-home-loan", category: "Banking", title: "Home Loan Application", documents: [
    "Filled loan application form", "Identity & address proof", "Income proof (salary slips / ITR / business proof)",
    "Bank statements (last 6 months)", "Property documents (sale agreement, title deed)", "Passport-size photographs",
  ]},
  { id: "b-chequebook-atm", category: "Banking", title: "Cheque Book / ATM-Debit Card Request", documents: [
    "Filled request form (or net-banking/app request)", "Account passbook or account number", "Identity proof for verification",
  ]},
  { id: "b-nominee", category: "Banking", title: "Nominee Update", documents: [
    "Filled nomination form (Form DA1)", "Account passbook/number", "Nominee's identity proof and details",
    "Nominee's date of birth (if minor, guardian details needed)",
  ]},
  { id: "b-statement", category: "Banking", title: "Bank Statement Request", documents: [
    "Filled statement request form (or net-banking request)", "Account number/passbook", "Date range required", "Identity proof for verification",
  ]},

  // Aadhaar
  { id: "a-name", category: "Aadhaar", title: "Aadhaar Name Correction", documents: [
    "Aadhaar Update/Correction Form", "Proof of Identity showing correct name (PAN, Passport, etc.)",
    "Existing Aadhaar number/copy",
  ], notes: "Submitted at an Aadhaar Enrolment/Update Centre or via the myAadhaar portal for self-service updates." },
  { id: "a-address", category: "Aadhaar", title: "Aadhaar Address Update", documents: [
    "Aadhaar Update Form", "Valid address proof (utility bill, rent agreement, bank statement, etc.)", "Existing Aadhaar number/copy",
  ]},
  { id: "a-dob", category: "Aadhaar", title: "Aadhaar Date of Birth Correction", documents: [
    "Aadhaar Update/Correction Form", "Proof of DOB (birth certificate, 10th marksheet, PAN, Passport)", "Existing Aadhaar number/copy",
  ]},
  { id: "a-mobile", category: "Aadhaar", title: "Aadhaar Mobile Number Update", documents: [
    "Aadhaar Update Form", "Existing Aadhaar number/copy", "New mobile number (OTP verification required)",
  ], notes: "Mobile number updates require biometric verification in person at an enrolment centre — this cannot be done online." },
  { id: "a-pvc", category: "Aadhaar", title: "Aadhaar PVC Card Order", documents: [
    "Aadhaar number or Enrolment ID", "Registered mobile number (for OTP)", "Online payment for the PVC card fee",
  ]},

  // PAN
  { id: "p-new", category: "PAN", title: "New PAN Application", documents: [
    "Filled Form 49A (Indian citizens) or 49AA (foreign citizens)", "Identity proof", "Address proof",
    "Date of birth proof", "Passport-size photograph",
  ]},
  { id: "p-name", category: "PAN", title: "PAN Name Correction", documents: [
    "PAN Correction Form", "Existing PAN card copy", "Proof of correct name (marriage certificate, gazette notification, etc.)",
  ]},
  { id: "p-dob", category: "PAN", title: "PAN Date of Birth Correction", documents: [
    "PAN Correction Form", "Existing PAN card copy", "Proof of correct DOB (birth certificate, 10th marksheet)",
  ]},
  { id: "p-address", category: "PAN", title: "PAN Address Correction", documents: [
    "PAN Correction Form", "Existing PAN card copy", "New address proof",
  ]},
  { id: "p-reprint", category: "PAN", title: "Lost PAN / Reprint Request", documents: [
    "PAN reprint request form", "Existing PAN number", "Identity proof", "Address proof",
  ]},

  // Police / Verification
  { id: "v-tenant", category: "Police", title: "Tenant Verification", documents: [
    "Filled tenant verification form", "Tenant's identity proof (Aadhaar/Passport/Voter ID)", "Tenant's photograph",
    "Signed rent/lease agreement", "Landlord's identity proof",
  ], notes: "Filed through your local police station or state Digital Police portal — process varies by state." },
  { id: "v-employee", category: "Police", title: "Employee Verification", documents: [
    "Filled verification request form", "Employee's identity & address proof", "Employee's photograph",
    "Employer's authorization letter",
  ]},
  { id: "v-passport", category: "Police", title: "Passport Police Verification", documents: [
    "Passport application acknowledgement", "Original + copy of address proof", "Identity proof",
    "Any prior passport (for reissue cases)",
  ], notes: "Conducted by local police as part of the Passport Seva process, not a separate application." },
  { id: "v-character", category: "Police", title: "Character Verification Certificate", documents: [
    "Filled application form", "Identity proof", "Address proof", "Passport-size photograph", "Purpose declaration",
  ]},
  { id: "v-address", category: "Police", title: "Address Verification", documents: [
    "Filled application form", "Identity proof", "Current address proof", "Passport-size photograph",
  ]},
];

export const CATEGORIES: ChecklistItem["category"][] = ["Banking", "Aadhaar", "PAN", "Police"];
