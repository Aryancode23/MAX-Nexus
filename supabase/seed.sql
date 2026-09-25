-- MAX NEXUS — Seed data
-- Run this AFTER schema.sql, once, to populate categories and today's tools
-- so the admin dashboard has real data and the public site keeps working
-- exactly as it does now — from the database instead of from code.

insert into public.categories (name, slug, description, icon, sort_order) values
  ('Photo & Image', 'photo', 'Resize, crop and prepare photos', 'ImageIcon', 1),
  ('Signature Tools', 'signature', 'Get your signature print/upload ready', 'PenLine', 2),
  ('PDF Toolkit', 'pdf', 'Convert, merge and compress documents', 'FileText', 3),
  ('Utilities', 'utility', 'Everyday quick tools', 'Wrench', 4)
on conflict (slug) do nothing;

insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Image Resizer', 'image-resizer', 'Resize any photo to exact pixel dimensions.',
   (select id from public.categories where slug = 'photo'), 'Crop',
   array['resize','image','photo','dimensions','pixels'], 'active', true, true, false,
   'Free Image Resizer Online — Resize Photos to Exact Pixels',
   'Resize any image to exact width and height in your browser, free, no upload to a server.', 1),

  ('Signature Resizer', 'signature-resizer', 'Resize your signature to an exact file size, like 20 KB.',
   (select id from public.categories where slug = 'signature'), 'PenLine',
   array['signature','resize','20kb','kb','compress'], 'active', true, true, false,
   'Signature Resizer — Resize Signature to 20KB / 10KB Free',
   'Crop and compress a signature image to a target file size and exact dimensions, entirely in your browser.', 2),

  ('Passport Photo Maker', 'passport-photo-maker', 'Crop and export a passport-style photo in common sizes.',
   (select id from public.categories where slug = 'photo'), 'IdCard',
   array['passport','photo','id photo','crop'], 'active', true, true, false,
   'Passport Photo Maker Online — Free & Instant',
   'Crop and export a passport-style photo in standard sizes, processed locally in your browser.', 3),

  ('Image to PDF', 'image-to-pdf', 'Combine one or more images into a single PDF.',
   (select id from public.categories where slug = 'pdf'), 'FileImage',
   array['image to pdf','jpg to pdf','png to pdf','convert'], 'active', true, true, false,
   'Image to PDF Converter — Free, Instant, No Upload',
   'Combine JPG or PNG images into a single downloadable PDF file, processed in your browser.', 4),

  ('QR Code Generator', 'qr-generator', 'Create a QR code for a link, text, or Wi-Fi network.',
   (select id from public.categories where slug = 'utility'), 'QrCode',
   array['qr','qr code','generator'], 'active', false, true, false,
   'Free QR Code Generator — Text, URL, Wi-Fi',
   'Generate and download a QR code for any link or text, free and instant.', 5),

  ('Word Counter', 'word-counter', 'Count words, characters, and reading time instantly.',
   (select id from public.categories where slug = 'utility'), 'Type',
   array['word counter','character counter','text'], 'active', false, true, false,
   'Word Counter — Free Online Character & Word Count Tool',
   'Count words, characters and estimated reading time as you type.', 6),

  ('PDF Compressor', 'pdf-compressor', 'Reduce PDF file size for easier sharing.',
   (select id from public.categories where slug = 'pdf'), 'FileDown',
   array['pdf compressor','reduce pdf size'], 'active', false, true, false,
   'PDF Compressor — Free, Instant, In Your Browser',
   'Reduce PDF file size for easier sharing and uploads, processed locally in your browser.', 7),

  ('PDF Merger', 'pdf-merger', 'Combine multiple PDF files into one.',
   (select id from public.categories where slug = 'pdf'), 'FileStack',
   array['pdf merger','combine pdf','join pdf'], 'active', false, true, false,
   'PDF Merger — Combine PDFs Online for Free',
   'Merge multiple PDF files into a single document, processed locally in your browser.', 8),

  ('Image Compressor', 'image-compressor', 'Shrink an image to a target file size.',
   (select id from public.categories where slug = 'photo'), 'Minimize2',
   array['image compressor','reduce image size','kb'], 'active', false, true, false,
   'Image Compressor — Reduce Photo File Size Free',
   'Compress an image to a target file size while keeping good quality, in your browser.', 9),

  ('Background Color Remover', 'background-remover', 'Remove a plain solid background and export a transparent PNG.',
   (select id from public.categories where slug = 'photo'), 'Eraser',
   array['background remover','remove background','transparent png'], 'active', false, true, false,
   'Background Color Remover — Free Transparent PNG Tool',
   'Click to remove a plain solid-color background from a photo and export a transparent PNG.', 10),

  ('Resume Builder', 'resume-builder', 'Build a clean resume and export it as a PDF.',
   (select id from public.categories where slug = 'utility'), 'FileUser',
   array['resume','cv','resume builder','resume maker'], 'active', true, true, false,
   'Free Resume Builder — Create and Download a PDF Resume',
   'Build a clean, professional resume with a live preview and download it as a PDF.', 11),

  ('Application & Letter Generator', 'letter-generator', 'Generate school, college, general or job letters from a template.',
   (select id from public.categories where slug = 'utility'), 'Mail',
   array['application','letter','leave application','job application','cover letter'], 'active', false, true, false,
   'Application & Letter Generator — Free Templates',
   'Generate a ready-to-download application or letter from School, College, General and Job templates.', 12)
on conflict (slug) do nothing;

-- Phase 3 additions
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Text Case Converter', 'text-case-converter', 'Switch text between UPPERCASE, lowercase, Title Case and Sentence case.',
   (select id from public.categories where slug = 'utility'), 'CaseSensitive',
   array['case converter','uppercase','lowercase','title case'], 'active', false, true, false,
   'Text Case Converter — Free Online Tool', 'Convert text between uppercase, lowercase, title case and sentence case instantly.', 13),

  ('Percentage Calculator', 'percentage-calculator', 'Calculate percentages, percentage of a number, and percentage change.',
   (select id from public.categories where slug = 'utility'), 'Percent',
   array['percentage calculator','percent'], 'active', false, true, false,
   'Percentage Calculator — Free Online Tool', 'Calculate percentages, what percent one number is of another, and percentage change.', 14),

  ('Age Calculator', 'age-calculator', 'Calculate exact age in years, months and days from a date of birth.',
   (select id from public.categories where slug = 'utility'), 'Cake',
   array['age calculator'], 'active', false, true, false,
   'Age Calculator — Free Online Tool', 'Calculate exact age in years, months and days from any date of birth.', 15),

  ('Date Calculator', 'date-calculator', 'Find the number of days, weeks and years between two dates.',
   (select id from public.categories where slug = 'utility'), 'CalendarDays',
   array['date calculator','days between dates'], 'active', false, true, false,
   'Date Calculator — Days Between Two Dates', 'Calculate the number of days, weeks and years between any two dates.', 16),

  ('Password Generator', 'password-generator', 'Generate a strong random password with custom length and character types.',
   (select id from public.categories where slug = 'utility'), 'KeyRound',
   array['password generator','random password'], 'active', false, true, false,
   'Password Generator — Free Strong Password Tool', 'Generate a strong, random password with custom length and character sets.', 17),

  ('UUID Generator', 'uuid-generator', 'Generate random UUID v4 identifiers.',
   (select id from public.categories where slug = 'utility'), 'Fingerprint',
   array['uuid generator','guid'], 'active', false, true, false,
   'UUID Generator — Free Online Tool', 'Generate random UUID v4 identifiers instantly.', 18),

  ('Unit Converter', 'unit-converter', 'Convert between length, weight and temperature units.',
   (select id from public.categories where slug = 'utility'), 'ArrowLeftRight',
   array['unit converter','length','weight','temperature'], 'active', false, true, false,
   'Unit Converter — Free Online Tool', 'Convert between length, weight and temperature units instantly.', 19),

  ('Remove Extra Spaces', 'remove-extra-spaces', 'Clean up extra spaces, tabs and blank lines from text.',
   (select id from public.categories where slug = 'utility'), 'Eraser',
   array['remove extra spaces','whitespace cleaner'], 'active', false, true, false,
   'Remove Extra Spaces — Free Text Cleaner', 'Clean up extra spaces, tabs and blank lines from any text.', 20),

  ('Duplicate Line Remover', 'duplicate-line-remover', 'Remove duplicate lines from a list while keeping the order.',
   (select id from public.categories where slug = 'utility'), 'ListX',
   array['duplicate line remover','remove duplicates'], 'active', false, true, false,
   'Duplicate Line Remover — Free Online Tool', 'Remove duplicate lines from any list of text while preserving order.', 21),

  ('PDF Page Extractor', 'pdf-page-extractor', 'Pull specific pages out of a PDF into a new file.',
   (select id from public.categories where slug = 'pdf'), 'FileOutput',
   array['pdf page extractor','extract pages'], 'active', false, true, false,
   'PDF Page Extractor — Free Online Tool', 'Extract specific pages from a PDF into a new downloadable file.', 22),

  ('PDF Watermark', 'pdf-watermark', 'Stamp a text watermark across every page of a PDF.',
   (select id from public.categories where slug = 'pdf'), 'Stamp',
   array['pdf watermark','stamp pdf'], 'active', false, true, false,
   'PDF Watermark Tool — Free Online', 'Add a text watermark across every page of a PDF, free and instant.', 23),

  ('PDF Splitter', 'pdf-splitter', 'Split a PDF into individual pages, downloaded as a ZIP.',
   (select id from public.categories where slug = 'pdf'), 'FileStack',
   array['pdf splitter','split pdf'], 'active', false, true, false,
   'PDF Splitter — Free Online Tool', 'Split a PDF into individual page files, downloaded as a ZIP.', 24),

  ('Photo Cropper', 'photo-cropper', 'Freeform photo cropping with 1:1, 4:3 and 16:9 presets.',
   (select id from public.categories where slug = 'photo'), 'Crop',
   array['photo cropper','crop image'], 'active', false, true, false,
   'Photo Cropper — Free Online Tool', 'Crop any photo freely or to a 1:1, 4:3 or 16:9 preset.', 25),

  ('Image Format Converter', 'image-format-converter', 'Convert an image between JPG, PNG and WebP.',
   (select id from public.categories where slug = 'photo'), 'RefreshCcw',
   array['image converter','jpg to png','png to webp'], 'active', false, true, false,
   'Image Format Converter — JPG, PNG, WebP', 'Convert any image between JPG, PNG and WebP formats, free and instant.', 26),

  ('PIN Code Lookup', 'pincode-lookup', 'Look up post office details for any Indian PIN code.',
   (select id from public.categories where slug = 'utility'), 'MapPin',
   array['pin code lookup','postal code india'], 'active', false, false, false,
   'PIN Code Lookup — India Post Office Finder', 'Look up post office, district and state details for any Indian PIN code.', 27),

  ('IFSC Lookup', 'ifsc-lookup', 'Look up bank branch details for any Indian IFSC code.',
   (select id from public.categories where slug = 'utility'), 'Landmark',
   array['ifsc lookup','bank branch finder'], 'active', false, false, false,
   'IFSC Code Lookup — Bank Branch Finder', 'Look up bank, branch and address details for any Indian IFSC code.', 28),

  ('Aadhaar / ID Print Formatter', 'aadhaar-print-formatter', 'Format an ID document you already have into a print-ready card layout.',
   (select id from public.categories where slug = 'pdf'), 'CreditCard',
   array['aadhaar print','id card print','e-aadhaar'], 'active', false, true, false,
   'ID Card Print Formatter — Free Online Tool', 'Format an ID document you already have (like e-Aadhaar) into a print-ready card layout.', 29)
on conflict (slug) do nothing;

-- Phase 4 additions
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('EMI Calculator', 'emi-calculator', 'Calculate monthly EMI, total interest and total payment for any loan.',
   (select id from public.categories where slug = 'utility'), 'Calculator',
   array['emi calculator','loan emi','home loan emi'], 'active', true, true, false,
   'EMI Calculator — Free Loan EMI Calculator', 'Calculate monthly EMI, total interest and total payment for any loan amount, rate and tenure.', 30),

  ('Simple Interest Calculator', 'simple-interest-calculator', 'Calculate simple interest and total amount.',
   (select id from public.categories where slug = 'utility'), 'Percent',
   array['simple interest calculator'], 'active', false, true, false,
   'Simple Interest Calculator — Free Online Tool', 'Calculate simple interest and total amount for any principal, rate and time.', 31),

  ('Compound Interest Calculator', 'compound-interest-calculator', 'Calculate compound interest with selectable compounding frequency.',
   (select id from public.categories where slug = 'utility'), 'TrendingUp',
   array['compound interest calculator'], 'active', false, true, false,
   'Compound Interest Calculator — Free Online Tool', 'Calculate compound interest and maturity amount with annual, half-yearly, quarterly or monthly compounding.', 32),

  ('RD Calculator', 'rd-calculator', 'Estimate recurring deposit maturity value and interest earned.',
   (select id from public.categories where slug = 'utility'), 'PiggyBank',
   array['rd calculator','recurring deposit'], 'active', false, true, false,
   'RD Calculator — Recurring Deposit Maturity Calculator', 'Estimate the maturity value and interest earned on a recurring deposit.', 33),

  ('FD Calculator', 'fd-calculator', 'Calculate fixed deposit maturity value and interest earned.',
   (select id from public.categories where slug = 'utility'), 'Landmark',
   array['fd calculator','fixed deposit'], 'active', false, true, false,
   'FD Calculator — Fixed Deposit Maturity Calculator', 'Calculate the maturity value and interest earned on a fixed deposit.', 34),

  ('Loan Tenure Calculator', 'loan-tenure-calculator', 'Find out how long a loan will take to repay for a given EMI.',
   (select id from public.categories where slug = 'utility'), 'CalendarClock',
   array['loan tenure calculator'], 'active', false, true, false,
   'Loan Tenure Calculator — Free Online Tool', 'Calculate how many months it will take to repay a loan for a given EMI amount.', 35),

  ('Document Checklist Library', 'document-checklist', 'Document checklists for Banking, Aadhaar, PAN and Police verification processes.',
   (select id from public.categories where slug = 'utility'), 'ClipboardCheck',
   array['document checklist','kyc checklist','aadhaar documents','pan documents','police verification documents'], 'active', true, true, false,
   'Document Checklist Library — Banking, Aadhaar, PAN, Police', 'Printable document checklists for common Banking, Aadhaar, PAN and Police verification processes.', 36),

  ('Official Portals Directory', 'official-portals', 'Direct links to official Aadhaar, PAN, police and banking portals.',
   (select id from public.categories where slug = 'utility'), 'ExternalLink',
   array['official portals','uidai','pan portal','cybercrime portal','digital police'], 'active', false, true, false,
   'Official Government Portals Directory — India', 'Direct links to official UIDAI, PAN, cybercrime and banking portals — MAX Nexus does not submit anything on your behalf.', 37)
on conflict (slug) do nothing;

-- Phase 5 additions
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Signature Maker', 'signature-maker', 'Draw a signature and download it as a transparent PNG.',
   (select id from public.categories where slug = 'signature'), 'PenTool',
   array['signature maker','draw signature','create signature'], 'active', true, true, false,
   'Signature Maker — Draw & Download Free', 'Draw your signature with mouse, finger or stylus and download it as a transparent PNG.', 38),

  ('JSON Formatter & Validator', 'json-formatter', 'Prettify, minify and validate JSON.',
   (select id from public.categories where slug = 'utility'), 'Braces',
   array['json formatter','json validator','json beautifier'], 'active', false, true, false,
   'JSON Formatter & Validator — Free Online Tool', 'Prettify, minify and validate JSON instantly in your browser.', 39),

  ('Text Diff Checker', 'text-diff-checker', 'Compare two blocks of text and see what changed.',
   (select id from public.categories where slug = 'utility'), 'GitCompare',
   array['text diff','compare text','diff checker'], 'active', false, true, false,
   'Text Diff Checker — Free Online Tool', 'Compare two blocks of text line by line and see additions and removals highlighted.', 40),

  ('World Clock', 'world-clock', 'See the current time in multiple timezones at once.',
   (select id from public.categories where slug = 'utility'), 'Globe',
   array['world clock','timezone converter'], 'active', false, true, false,
   'World Clock — Free Timezone Tool', 'See the current time across multiple cities and timezones at once.', 41),

  ('Color Picker & Palette', 'color-picker', 'Pick colors from an image and convert between HEX, RGB and HSL.',
   (select id from public.categories where slug = 'photo'), 'Pipette',
   array['color picker','palette generator','hex to rgb'], 'active', false, true, false,
   'Color Picker & Palette Generator — Free Online Tool', 'Pick colors from an uploaded image and convert between HEX, RGB and HSL formats.', 42),

  ('Barcode Generator', 'barcode-generator', 'Generate CODE128, EAN13, UPC and CODE39 barcodes.',
   (select id from public.categories where slug = 'utility'), 'Barcode',
   array['barcode generator'], 'active', false, true, false,
   'Barcode Generator — Free Online Tool', 'Generate CODE128, EAN13, UPC or CODE39 barcodes and download as PNG.', 43),

  ('Text to Speech', 'text-to-speech', 'Convert text to spoken audio using your browser''s built-in voices.',
   (select id from public.categories where slug = 'utility'), 'Volume2',
   array['text to speech','tts'], 'active', false, true, false,
   'Text to Speech — Free Online Tool', 'Convert any text to spoken audio using your browser''s built-in speech voices.', 44),

  ('PDF to JPG', 'pdf-to-jpg', 'Convert PDF pages into JPG images.',
   (select id from public.categories where slug = 'pdf'), 'FileImage',
   array['pdf to jpg','pdf to image'], 'active', false, true, false,
   'PDF to JPG Converter — Free Online Tool', 'Convert PDF pages into downloadable JPG images, processed in your browser.', 45),

  ('Image Watermark', 'image-watermark', 'Stamp a text watermark onto a photo.',
   (select id from public.categories where slug = 'photo'), 'Stamp',
   array['image watermark','photo watermark'], 'active', false, true, false,
   'Image Watermark Tool — Free Online', 'Add a text watermark to any photo with adjustable position, size and opacity.', 46),

  ('Currency Converter', 'currency-converter', 'Convert between currencies using live public exchange rates.',
   (select id from public.categories where slug = 'utility'), 'DollarSign',
   array['currency converter','exchange rate'], 'active', false, false, false,
   'Currency Converter — Free Online Tool', 'Convert between major currencies using free, publicly available exchange rates.', 47)
on conflict (slug) do nothing;

-- Phase 6 additions
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Invoice Generator', 'invoice-generator', 'Create a professional invoice with line items, tax and totals, exported as PDF.',
   (select id from public.categories where slug = 'utility'), 'Receipt',
   array['invoice generator','bill maker','receipt generator'], 'active', true, true, false,
   'Free Invoice Generator — Create & Download PDF Invoices', 'Create a professional invoice with line items, tax and totals, and download it as a PDF.', 48),

  ('Bulk Image Processor', 'bulk-image-processor', 'Resize and compress many images at once, downloaded as a ZIP.',
   (select id from public.categories where slug = 'photo'), 'Layers',
   array['bulk image resize','bulk compress','batch image processing'], 'active', false, true, false,
   'Bulk Image Resizer & Compressor — Free Online Tool', 'Resize and compress multiple images at once and download them all as a single ZIP file.', 49),

  ('CSV Viewer & PDF Export', 'csv-viewer', 'View a CSV file as a table and export it as a PDF.',
   (select id from public.categories where slug = 'utility'), 'Table',
   array['csv viewer','csv to pdf'], 'active', false, true, false,
   'CSV Viewer & CSV to PDF — Free Online Tool', 'View any CSV file as a readable table and export it as a PDF document.', 50)
on conflict (slug) do nothing;

-- Phase 7 additions
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('OCR Studio', 'ocr-studio', 'Extract editable text from a photo or scanned image.',
   (select id from public.categories where slug = 'utility'), 'ScanText',
   array['ocr','image to text','extract text from image'], 'active', true, true, false,
   'OCR Studio — Extract Text From Images Free', 'Extract editable, copyable text from a photo or scanned document, processed locally in your browser.', 51)
on conflict (slug) do nothing;

-- Phase 9 additions
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Question Paper Maker', 'question-paper-maker', 'Build a sectioned exam paper with questions and marks, exported as PDF.',
   (select id from public.categories where slug = 'utility'), 'FileQuestion',
   array['question paper maker','exam paper generator'], 'active', true, true, false,
   'Question Paper Maker — Free Online Tool for Teachers', 'Build a sectioned exam question paper with instructions and marks, exported as a print-ready PDF.', 52),

  ('MCQ Generator', 'mcq-generator', 'Create a multiple-choice quiz sheet with a separate answer key, exported as PDF.',
   (select id from public.categories where slug = 'utility'), 'ListChecks',
   array['mcq generator','quiz maker','multiple choice'], 'active', false, true, false,
   'MCQ Generator — Free Quiz Sheet Maker', 'Create a multiple-choice quiz sheet with a separate answer key page, exported as a PDF.', 53),

  ('Attendance Sheet Generator', 'attendance-sheet', 'Generate a printable student attendance grid for the month.',
   (select id from public.categories where slug = 'utility'), 'ClipboardList',
   array['attendance sheet','attendance register'], 'active', false, true, false,
   'Attendance Sheet Generator — Free Online Tool', 'Generate a printable attendance grid for your class, students and number of days.', 54),

  ('Class Timetable Maker', 'timetable-maker', 'Build a period-by-day class timetable and export it as PDF.',
   (select id from public.categories where slug = 'utility'), 'CalendarRange',
   array['timetable maker','class schedule'], 'active', false, true, false,
   'Class Timetable Maker — Free Online Tool', 'Build a period-by-day class timetable and export it as a printable PDF.', 55),

  ('Student/Employee ID Card Maker', 'id-card-maker', 'Design a printable ID card with photo, name and ID number.',
   (select id from public.categories where slug = 'photo'), 'IdCard',
   array['id card maker','student id card','employee id card'], 'active', true, true, false,
   'ID Card Maker — Free Student & Employee ID Cards', 'Design a printable student or employee ID card with a photo, name, role and ID number.', 56)
on conflict (slug) do nothing;

-- Phase 10 additions (Fix My File tool + starter presets)
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Fix My File', 'fix-my-file', 'Tell it what your file needs to be — it figures out and applies the right fixes.',
   (select id from public.categories where slug = 'utility'), 'Wand2',
   array['fix my file','resize to requirement','reduce pdf below','make photo correct size'], 'active', true, true, false,
   'Fix My File — Make Any Photo or PDF Meet Requirements', 'Upload a photo or PDF and the size/format you need — it automatically resizes, converts, compresses, or trims pages to match, all in your browser.', 57)
on conflict (slug) do nothing;

insert into public.fix_my_file_presets (name, slug, file_type, width_px, height_px, formats, max_size_kb, notes, sort_order) values
  ('Passport Photo', 'passport-photo', 'photo', 413, 531, array['jpeg','jpg'], 50, 'Common 35mm x 45mm passport photo size at 300 DPI.', 1),
  ('Job Application Photo', 'job-application-photo', 'photo', 300, 300, array['jpeg','jpg'], 100, 'Square photo commonly requested on job portals.', 2),
  ('Signature Upload', 'signature-upload', 'photo', 300, 100, array['jpeg','jpg'], 20, 'Common signature size for online forms.', 3),
  ('WhatsApp Sharing', 'whatsapp-sharing', 'photo', 1080, 1080, array['jpeg','jpg'], 500, 'Keeps quality high while staying well under typical mobile data limits.', 4)
on conflict (slug) do nothing;

insert into public.fix_my_file_presets (name, slug, file_type, max_size_kb, max_pages, page_size, notes, sort_order) values
  ('Email Attachment', 'email-attachment', 'pdf', 5000, null, null, 'Most email providers cap attachments around 25 MB — 5 MB keeps well clear of that on slower connections.', 5),
  ('Small PDF for Web Upload', 'small-pdf-upload', 'pdf', 1000, null, null, 'Common upload limit on government and job portals.', 6),
  ('Government Form Upload', 'government-form-upload', 'pdf', 2000, 10, 'A4', 'Commonly requested format — verify the exact limit with the specific portal.', 7)
on conflict (slug) do nothing;

-- Phase 10 additions (Document Pack Builder tool + 12 templates)
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Document Pack Builder', 'document-pack-builder', 'Prepare a complete set of documents for a purpose — upload, process, and download one organized pack.',
   (select id from public.categories where slug = 'pdf'), 'FolderKanban',
   array['document pack','prepare documents','job application documents','admission documents'], 'active', true, true, false,
   'Document Pack Builder — Prepare & Merge Application Documents', 'Prepare a complete document pack for job applications, admissions, loans and more — upload, process, and download one organized set.', 58)
on conflict (slug) do nothing;

insert into public.document_pack_templates
  (name, slug, description, required_documents, optional_documents, recommended_formats, recommended_max_size, processing_notes, related_tool_slugs, status, sort_order)
values
  ('Job Application', 'job-application',
   'Commonly requested documents when applying for a job.',
   array['Resume', 'Passport Photo', 'Signature', 'ID Proof (Aadhaar/PAN/Passport)'],
   array['Educational Certificate', 'Experience Letter', 'Cover Letter'],
   'PDF for documents, JPG for photo/signature', 'under 2 MB per file',
   'Resume and cover letter are typically combined into the final PDF; photo and signature stay separate for portal uploads that ask for them individually.',
   array['resume-builder', 'passport-photo-maker', 'signature-resizer', 'letter-generator'], 'published', 1),

  ('College Admission', 'college-admission',
   'Commonly requested documents for college/university admission.',
   array['10th Marksheet', '12th Marksheet', 'Passport Photo', 'ID Proof', 'Transfer Certificate'],
   array['Migration Certificate', 'Category Certificate', 'Income Certificate'],
   'PDF for certificates, JPG for photo', 'under 2 MB per file',
   'Marksheets and certificates are usually merged into one PDF in the order the admission portal lists them.',
   array['passport-photo-maker', 'pdf-merger', 'pdf-compressor'], 'published', 2),

  ('School Admission', 'school-admission',
   'Commonly requested documents for school admission.',
   array['Birth Certificate', 'Passport Photo', 'Address Proof', 'Previous School Transfer Certificate'],
   array['Aadhaar Card', 'Category Certificate', 'Medical Certificate'],
   'PDF for certificates, JPG for photo', 'under 1 MB per file',
   null,
   array['passport-photo-maker', 'pdf-merger', 'document-checklist'], 'published', 3),

  ('Scholarship Application', 'scholarship-application',
   'Commonly requested documents for scholarship applications.',
   array['Marksheet', 'Income Certificate', 'Bank Passbook', 'Passport Photo', 'ID Proof'],
   array['Caste Certificate', 'Domicile Certificate'],
   'PDF', 'under 2 MB per file',
   null,
   array['passport-photo-maker', 'pdf-merger', 'document-checklist'], 'published', 4),

  ('Passport Preparation', 'passport-preparation',
   'Commonly requested documents when applying for or renewing a passport.',
   array['Passport Photo', 'Address Proof', 'ID Proof', 'Birth Certificate'],
   array['Aadhaar Card', 'Old Passport (for renewal)'],
   'JPG for photo, PDF for documents', 'as per Passport Seva portal limits',
   'Passport photo specifications are strict — use Fix My File with the Passport Photo preset before adding it to this pack.',
   array['passport-photo-maker', 'fix-my-file', 'pdf-merger'], 'published', 5),

  ('Government Application', 'government-application',
   'Commonly requested documents for general government scheme or service applications.',
   array['ID Proof', 'Address Proof', 'Passport Photo', 'Application Form'],
   array['Income Certificate', 'Caste Certificate'],
   'PDF', 'as per the specific portal''s limit',
   null,
   array['document-checklist', 'official-portals', 'pdf-merger'], 'published', 6),

  ('Bank Documentation', 'bank-documentation',
   'Commonly requested documents for opening or updating a bank account.',
   array['ID Proof', 'Address Proof', 'Passport Photo', 'PAN Card'],
   array['Income Proof', 'Bank Statement'],
   'PDF for documents, JPG for photo', 'under 2 MB per file',
   null,
   array['document-checklist', 'passport-photo-maker'], 'published', 7),

  ('Loan Documentation', 'loan-documentation',
   'Commonly requested documents for a loan application.',
   array['ID Proof', 'Address Proof', 'Income Proof', 'Bank Statements', 'Passport Photo'],
   array['Property Documents', 'Guarantor ID Proof'],
   'PDF', 'under 5 MB total',
   'Bank statements are often multiple files — use PDF Merger to combine them into one before adding to this pack.',
   array['pdf-merger', 'pdf-compressor', 'emi-calculator', 'document-checklist'], 'published', 8),

  ('Insurance Claim', 'insurance-claim',
   'Commonly requested documents when filing an insurance claim.',
   array['Policy Document', 'ID Proof', 'Claim Form', 'Supporting Bills/Receipts'],
   array['Medical Reports', 'Police Report (for theft/accident)'],
   'PDF', 'as per insurer''s portal limit',
   null,
   array['pdf-merger', 'image-to-pdf'], 'published', 9),

  ('Rental / Tenant Documentation', 'rental-tenant-documentation',
   'Commonly requested documents for renting a property.',
   array['ID Proof', 'Passport Photo', 'Address Proof', 'Rent Agreement'],
   array['Employment Proof', 'Previous Landlord Reference'],
   'PDF for documents, JPG for photo', 'under 2 MB per file',
   null,
   array['document-checklist', 'letter-generator'], 'published', 10),

  ('Business Registration', 'business-registration',
   'Commonly requested documents for registering a small business.',
   array['ID Proof', 'Address Proof', 'Passport Photo', 'PAN Card'],
   array['Partnership Deed', 'NOC from Property Owner'],
   'PDF', 'under 2 MB per file',
   null,
   array['invoice-generator', 'document-checklist'], 'published', 11),

  ('General Document Submission', 'general-document-submission',
   'A flexible pack for any purpose not covered by a specific template.',
   array['ID Proof'],
   array['Address Proof', 'Passport Photo', 'Supporting Document'],
   'PDF preferred', 'under 2 MB per file',
   null,
   array['pdf-merger', 'image-to-pdf', 'pdf-compressor'], 'published', 12)
on conflict (slug) do nothing;

-- Phase 12 addition (Employee ID Card Studio)
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Employee ID Card Studio', 'employee-id-card-studio', 'Design a portrait employee/office ID card with fully positionable photo, signature, logo and seal, from 17 ready-made templates.',
   (select id from public.categories where slug = 'photo'), 'IdCard',
   array['employee id card', 'office id card', 'id card designer', 'staff card maker'], 'active', true, true, false,
   'Employee ID Card Studio — Free Office ID Card Designer', 'Design a portrait employee ID card: drag your photo, signature, logo and institution seal anywhere on 17 textured and gradient templates, then export a print-ready PDF.', 59)
on conflict (slug) do nothing;

-- Phase 12 addition (PDF Fill & Sign)
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('PDF Fill & Sign', 'pdf-fill-sign', 'Fill in a PDF form and add your signature anywhere, entirely in your browser.',
   (select id from public.categories where slug = 'pdf'), 'PenTool',
   array['pdf fill and sign', 'sign pdf', 'fill pdf form', 'add signature to pdf'], 'active', true, true, false,
   'PDF Fill & Sign — Free Online, No Upload to a Server', 'Fill in a PDF form''s real fields or add text and your signature anywhere on any PDF, entirely in your browser.', 60)
on conflict (slug) do nothing;

-- Phase 14 addition (ID Card Designer Pro)
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('ID Card Designer Pro', 'id-card-designer-pro', 'A real visual ID card editor — 8 templates, drag/resize/color every element, layers, undo/redo, front & back, high-res export.',
   (select id from public.categories where slug = 'photo'), 'LayoutTemplate',
   array['id card designer', 'employee id card', 'id card editor', 'custom id card'], 'active', true, true, false,
   'ID Card Designer Pro — Free Visual ID Card Editor', 'Design a fully custom employee or student ID card: 8 templates, drag/resize/recolor every element, layers, undo/redo, front and back sides, high-resolution PDF/PNG export.', 61)
on conflict (slug) do nothing;

-- Phase 16 addition (Live Capture Rehearsal)
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Live Capture Rehearsal', 'live-capture-rehearsal', 'Practice a live-capture exam photo — checks lighting, background and sharpness on your own webcam, entirely on your device.',
   (select id from public.categories where slug = 'photo'), 'Camera',
   array['live photo', 'ssc live capture', 'webcam check', 'exam photo rehearsal', 'live photo upload'], 'active', false, true, false,
   'Live Capture Rehearsal — Practice Your Exam Live Photo', 'Rehearse a live-capture exam photo (like SSC''s) before the real thing: checks lighting, background and sharpness on your own webcam, entirely in your browser — nothing is recorded or uploaded.', 62)
on conflict (slug) do nothing;

-- Phase 16 addition (Hindi PDF to Word)
insert into public.tools
  (name, slug, description, category_id, icon, keywords, status, is_popular, is_offline, is_paid, seo_title, seo_description, sort_order)
values
  ('Hindi PDF to Word', 'hindi-pdf-to-word', 'Convert a Krutidev, Unicode, or scanned Hindi PDF into an editable Word document.',
   (select id from public.categories where slug = 'pdf'), 'FileText',
   array['krutidev pdf to word', 'hindi pdf to word', 'krutidev to unicode', 'hindi ocr pdf'], 'active', false, true, false,
   'Hindi / Krutidev PDF to Word — Free, No Upload', 'Convert a Krutidev, Unicode, or scanned Hindi PDF into editable text and download a Word document, entirely in your browser.', 63)
on conflict (slug) do nothing;
