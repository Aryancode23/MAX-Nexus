import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { getPublicToolBySlug } from "@/lib/tools-data";
import { RecentlyUsedTracker } from "@/components/RecentlyUsedTracker";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ImageResizerTool } from "@/components/tools/ImageResizerTool";
import { SignatureResizerTool } from "@/components/tools/SignatureResizerTool";
import { PassportPhotoTool } from "@/components/tools/PassportPhotoTool";
import { ImageToPdfTool } from "@/components/tools/ImageToPdfTool";
import { QrGeneratorTool } from "@/components/tools/QrGeneratorTool";
import { WordCounterTool } from "@/components/tools/WordCounterTool";
import { PdfMergerTool } from "@/components/tools/PdfMergerTool";
import { ImageCompressorTool } from "@/components/tools/ImageCompressorTool";
import { BackgroundRemoverTool } from "@/components/tools/BackgroundRemoverTool";
import { PdfCompressorTool } from "@/components/tools/PdfCompressorTool";
import { ResumeBuilderTool } from "@/components/tools/ResumeBuilderTool";
import { LetterGeneratorTool } from "@/components/tools/LetterGeneratorTool";
import { TextCaseConverterTool } from "@/components/tools/TextCaseConverterTool";
import { PercentageCalculatorTool } from "@/components/tools/PercentageCalculatorTool";
import { AgeCalculatorTool } from "@/components/tools/AgeCalculatorTool";
import { DateCalculatorTool } from "@/components/tools/DateCalculatorTool";
import { PasswordGeneratorTool } from "@/components/tools/PasswordGeneratorTool";
import { UuidGeneratorTool } from "@/components/tools/UuidGeneratorTool";
import { UnitConverterTool } from "@/components/tools/UnitConverterTool";
import { RemoveExtraSpacesTool } from "@/components/tools/RemoveExtraSpacesTool";
import { DuplicateLineRemoverTool } from "@/components/tools/DuplicateLineRemoverTool";
import { PdfPageExtractorTool } from "@/components/tools/PdfPageExtractorTool";
import { PdfWatermarkTool } from "@/components/tools/PdfWatermarkTool";
import { PdfSplitterTool } from "@/components/tools/PdfSplitterTool";
import { PhotoCropperTool } from "@/components/tools/PhotoCropperTool";
import { ImageFormatConverterTool } from "@/components/tools/ImageFormatConverterTool";
import { PinCodeLookupTool } from "@/components/tools/PinCodeLookupTool";
import { IfscLookupTool } from "@/components/tools/IfscLookupTool";
import { AadhaarPrintTool } from "@/components/tools/AadhaarPrintTool";
import { EmiCalculatorTool } from "@/components/tools/EmiCalculatorTool";
import { SimpleInterestTool } from "@/components/tools/SimpleInterestTool";
import { CompoundInterestTool } from "@/components/tools/CompoundInterestTool";
import { RdCalculatorTool } from "@/components/tools/RdCalculatorTool";
import { FdCalculatorTool } from "@/components/tools/FdCalculatorTool";
import { LoanTenureCalculatorTool } from "@/components/tools/LoanTenureCalculatorTool";
import { DocumentChecklistTool } from "@/components/tools/DocumentChecklistTool";
import { OfficialPortalsTool } from "@/components/tools/OfficialPortalsTool";
import { SignatureMakerTool } from "@/components/tools/SignatureMakerTool";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";
import { TextDiffTool } from "@/components/tools/TextDiffTool";
import { WorldClockTool } from "@/components/tools/WorldClockTool";
import { ColorPickerTool } from "@/components/tools/ColorPickerTool";
import { BarcodeGeneratorTool } from "@/components/tools/BarcodeGeneratorTool";
import { TextToSpeechTool } from "@/components/tools/TextToSpeechTool";
import { PdfToJpgTool } from "@/components/tools/PdfToJpgTool";
import { ImageWatermarkTool } from "@/components/tools/ImageWatermarkTool";
import { CurrencyConverterTool } from "@/components/tools/CurrencyConverterTool";

// Real, working tool implementations. A tool row can exist in the database
// (so it shows up, can be reordered, disabled, etc.) before its component
// exists here — it will correctly show "coming soon" until this map is
// updated, rather than pretending to work.
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "image-resizer": ImageResizerTool,
  "signature-resizer": SignatureResizerTool,
  "passport-photo-maker": PassportPhotoTool,
  "image-to-pdf": ImageToPdfTool,
  "qr-generator": QrGeneratorTool,
  "word-counter": WordCounterTool,
  "pdf-merger": PdfMergerTool,
  "image-compressor": ImageCompressorTool,
  "background-remover": BackgroundRemoverTool,
  "pdf-compressor": PdfCompressorTool,
  "resume-builder": ResumeBuilderTool,
  "letter-generator": LetterGeneratorTool,
  "text-case-converter": TextCaseConverterTool,
  "percentage-calculator": PercentageCalculatorTool,
  "age-calculator": AgeCalculatorTool,
  "date-calculator": DateCalculatorTool,
  "password-generator": PasswordGeneratorTool,
  "uuid-generator": UuidGeneratorTool,
  "unit-converter": UnitConverterTool,
  "remove-extra-spaces": RemoveExtraSpacesTool,
  "duplicate-line-remover": DuplicateLineRemoverTool,
  "pdf-page-extractor": PdfPageExtractorTool,
  "pdf-watermark": PdfWatermarkTool,
  "pdf-splitter": PdfSplitterTool,
  "photo-cropper": PhotoCropperTool,
  "image-format-converter": ImageFormatConverterTool,
  "pincode-lookup": PinCodeLookupTool,
  "ifsc-lookup": IfscLookupTool,
  "aadhaar-print-formatter": AadhaarPrintTool,
  "emi-calculator": EmiCalculatorTool,
  "simple-interest-calculator": SimpleInterestTool,
  "compound-interest-calculator": CompoundInterestTool,
  "rd-calculator": RdCalculatorTool,
  "fd-calculator": FdCalculatorTool,
  "loan-tenure-calculator": LoanTenureCalculatorTool,
  "document-checklist": DocumentChecklistTool,
  "official-portals": OfficialPortalsTool,
  "signature-maker": SignatureMakerTool,
  "json-formatter": JsonFormatterTool,
  "text-diff-checker": TextDiffTool,
  "world-clock": WorldClockTool,
  "color-picker": ColorPickerTool,
  "barcode-generator": BarcodeGeneratorTool,
  "text-to-speech": TextToSpeechTool,
  "pdf-to-jpg": PdfToJpgTool,
  "image-watermark": ImageWatermarkTool,
  "currency-converter": CurrencyConverterTool,
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = await getPublicToolBySlug(params.slug);
  if (!tool) return {};
  return { title: tool.seoTitle, description: tool.seoDescription };
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getPublicToolBySlug(params.slug);
  if (!tool) notFound();

  const Component = TOOL_COMPONENTS[tool.slug];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <RecentlyUsedTracker slug={tool.slug} />
      <nav className="mb-4 text-sm text-muted">
        <Link href="/tools" className="hover:text-text">Tools</Link> / {tool.name}
      </nav>

      <h1 className="flex items-center gap-2 text-2xl font-bold text-text">
        {tool.name}
        <FavoriteButton slug={tool.slug} />
      </h1>
      <p className="mt-1 text-muted">{tool.shortDescription}</p>

      <div className="mt-8">
        {tool.status === "coming_soon" || !Component ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface p-12 text-center">
            <Clock size={28} className="text-muted" />
            <p className="font-medium text-text">This tool is coming soon.</p>
            <p className="text-sm text-muted">We're still building it — check back shortly.</p>
          </div>
        ) : (
          <Component />
        )}
      </div>
    </div>
  );
}
