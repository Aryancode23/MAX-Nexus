// Single source of truth for which tools have a real, working component.
// Both the public tool page and the admin sync-check page read from this
// exact map — there is no second list anywhere that could drift out of sync.
//
// Every entry is wrapped in next/dynamic rather than imported statically:
// merely reading REGISTERED_TOOL_SLUGS (e.g. the admin sync-check page,
// which only needs the slug list, never renders any of these) must not
// pull all ~60 tool components' code into that page's bundle. dynamic()
// defers the actual import until a component is rendered, so the slug
// list stays cheap to read anywhere while the public tool page still
// lazy-loads exactly the one tool it's showing.

import dynamic from "next/dynamic";

export const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "image-resizer": dynamic(() => import("@/components/tools/ImageResizerTool").then((m) => m.ImageResizerTool)),
  "signature-resizer": dynamic(() => import("@/components/tools/SignatureResizerTool").then((m) => m.SignatureResizerTool)),
  "passport-photo-maker": dynamic(() => import("@/components/tools/PassportPhotoTool").then((m) => m.PassportPhotoTool)),
  "image-to-pdf": dynamic(() => import("@/components/tools/ImageToPdfTool").then((m) => m.ImageToPdfTool)),
  "qr-generator": dynamic(() => import("@/components/tools/QrGeneratorTool").then((m) => m.QrGeneratorTool)),
  "word-counter": dynamic(() => import("@/components/tools/WordCounterTool").then((m) => m.WordCounterTool)),
  "pdf-merger": dynamic(() => import("@/components/tools/PdfMergerTool").then((m) => m.PdfMergerTool)),
  "image-compressor": dynamic(() => import("@/components/tools/ImageCompressorTool").then((m) => m.ImageCompressorTool)),
  "background-remover": dynamic(() => import("@/components/tools/BackgroundRemoverTool").then((m) => m.BackgroundRemoverTool)),
  "pdf-compressor": dynamic(() => import("@/components/tools/PdfCompressorTool").then((m) => m.PdfCompressorTool)),
  "resume-builder": dynamic(() => import("@/components/tools/ResumeBuilderTool").then((m) => m.ResumeBuilderTool)),
  "letter-generator": dynamic(() => import("@/components/tools/LetterGeneratorTool").then((m) => m.LetterGeneratorTool)),
  "text-case-converter": dynamic(() => import("@/components/tools/TextCaseConverterTool").then((m) => m.TextCaseConverterTool)),
  "percentage-calculator": dynamic(() => import("@/components/tools/PercentageCalculatorTool").then((m) => m.PercentageCalculatorTool)),
  "age-calculator": dynamic(() => import("@/components/tools/AgeCalculatorTool").then((m) => m.AgeCalculatorTool)),
  "date-calculator": dynamic(() => import("@/components/tools/DateCalculatorTool").then((m) => m.DateCalculatorTool)),
  "password-generator": dynamic(() => import("@/components/tools/PasswordGeneratorTool").then((m) => m.PasswordGeneratorTool)),
  "uuid-generator": dynamic(() => import("@/components/tools/UuidGeneratorTool").then((m) => m.UuidGeneratorTool)),
  "unit-converter": dynamic(() => import("@/components/tools/UnitConverterTool").then((m) => m.UnitConverterTool)),
  "remove-extra-spaces": dynamic(() => import("@/components/tools/RemoveExtraSpacesTool").then((m) => m.RemoveExtraSpacesTool)),
  "duplicate-line-remover": dynamic(() => import("@/components/tools/DuplicateLineRemoverTool").then((m) => m.DuplicateLineRemoverTool)),
  "pdf-page-extractor": dynamic(() => import("@/components/tools/PdfPageExtractorTool").then((m) => m.PdfPageExtractorTool)),
  "pdf-watermark": dynamic(() => import("@/components/tools/PdfWatermarkTool").then((m) => m.PdfWatermarkTool)),
  "pdf-splitter": dynamic(() => import("@/components/tools/PdfSplitterTool").then((m) => m.PdfSplitterTool)),
  "photo-cropper": dynamic(() => import("@/components/tools/PhotoCropperTool").then((m) => m.PhotoCropperTool)),
  "image-format-converter": dynamic(() => import("@/components/tools/ImageFormatConverterTool").then((m) => m.ImageFormatConverterTool)),
  "pincode-lookup": dynamic(() => import("@/components/tools/PinCodeLookupTool").then((m) => m.PinCodeLookupTool)),
  "ifsc-lookup": dynamic(() => import("@/components/tools/IfscLookupTool").then((m) => m.IfscLookupTool)),
  "aadhaar-print-formatter": dynamic(() => import("@/components/tools/AadhaarPrintTool").then((m) => m.AadhaarPrintTool)),
  "emi-calculator": dynamic(() => import("@/components/tools/EmiCalculatorTool").then((m) => m.EmiCalculatorTool)),
  "simple-interest-calculator": dynamic(() => import("@/components/tools/SimpleInterestTool").then((m) => m.SimpleInterestTool)),
  "compound-interest-calculator": dynamic(() => import("@/components/tools/CompoundInterestTool").then((m) => m.CompoundInterestTool)),
  "rd-calculator": dynamic(() => import("@/components/tools/RdCalculatorTool").then((m) => m.RdCalculatorTool)),
  "fd-calculator": dynamic(() => import("@/components/tools/FdCalculatorTool").then((m) => m.FdCalculatorTool)),
  "loan-tenure-calculator": dynamic(() => import("@/components/tools/LoanTenureCalculatorTool").then((m) => m.LoanTenureCalculatorTool)),
  "document-checklist": dynamic(() => import("@/components/tools/DocumentChecklistTool").then((m) => m.DocumentChecklistTool)),
  "official-portals": dynamic(() => import("@/components/tools/OfficialPortalsTool").then((m) => m.OfficialPortalsTool)),
  "signature-maker": dynamic(() => import("@/components/tools/SignatureMakerTool").then((m) => m.SignatureMakerTool)),
  "json-formatter": dynamic(() => import("@/components/tools/JsonFormatterTool").then((m) => m.JsonFormatterTool)),
  "text-diff-checker": dynamic(() => import("@/components/tools/TextDiffTool").then((m) => m.TextDiffTool)),
  "world-clock": dynamic(() => import("@/components/tools/WorldClockTool").then((m) => m.WorldClockTool)),
  "color-picker": dynamic(() => import("@/components/tools/ColorPickerTool").then((m) => m.ColorPickerTool)),
  "barcode-generator": dynamic(() => import("@/components/tools/BarcodeGeneratorTool").then((m) => m.BarcodeGeneratorTool)),
  "text-to-speech": dynamic(() => import("@/components/tools/TextToSpeechTool").then((m) => m.TextToSpeechTool)),
  "pdf-to-jpg": dynamic(() => import("@/components/tools/PdfToJpgTool").then((m) => m.PdfToJpgTool)),
  "image-watermark": dynamic(() => import("@/components/tools/ImageWatermarkTool").then((m) => m.ImageWatermarkTool)),
  "currency-converter": dynamic(() => import("@/components/tools/CurrencyConverterTool").then((m) => m.CurrencyConverterTool)),
  "invoice-generator": dynamic(() => import("@/components/tools/InvoiceGeneratorTool").then((m) => m.InvoiceGeneratorTool)),
  "bulk-image-processor": dynamic(() => import("@/components/tools/BulkImageProcessorTool").then((m) => m.BulkImageProcessorTool)),
  "csv-viewer": dynamic(() => import("@/components/tools/CsvViewerTool").then((m) => m.CsvViewerTool)),
  "ocr-studio": dynamic(() => import("@/components/tools/OcrStudioTool").then((m) => m.OcrStudioTool)),
  "question-paper-maker": dynamic(() => import("@/components/tools/QuestionPaperMakerTool").then((m) => m.QuestionPaperMakerTool)),
  "mcq-generator": dynamic(() => import("@/components/tools/McqGeneratorTool").then((m) => m.McqGeneratorTool)),
  "attendance-sheet": dynamic(() => import("@/components/tools/AttendanceSheetTool").then((m) => m.AttendanceSheetTool)),
  "timetable-maker": dynamic(() => import("@/components/tools/TimetableMakerTool").then((m) => m.TimetableMakerTool)),
  "id-card-maker": dynamic(() => import("@/components/tools/IdCardMakerTool").then((m) => m.IdCardMakerTool)),
  "fix-my-file": dynamic(() => import("@/components/tools/FixMyFileTool").then((m) => m.FixMyFileTool)),
  "document-pack-builder": dynamic(() => import("@/components/tools/DocumentPackBuilderTool").then((m) => m.DocumentPackBuilderTool)),
  "employee-id-card-studio": dynamic(() => import("@/components/tools/EmployeeIdCardStudioTool").then((m) => m.EmployeeIdCardStudioTool)),
  "pdf-fill-sign": dynamic(() => import("@/components/tools/PdfFillSignTool").then((m) => m.PdfFillSignTool)),
  "id-card-designer-pro": dynamic(() => import("@/components/tools/IdCardDesignerTool").then((m) => m.IdCardDesignerTool)),
  "live-capture-rehearsal": dynamic(() => import("@/components/tools/LiveCaptureRehearsalTool").then((m) => m.LiveCaptureRehearsalTool)),
  "hindi-pdf-to-word": dynamic(() => import("@/components/tools/HindiPdfToWordTool").then((m) => m.HindiPdfToWordTool)),
};

export const REGISTERED_TOOL_SLUGS = Object.keys(TOOL_COMPONENTS);
