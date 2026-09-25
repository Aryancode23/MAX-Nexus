"use client";
import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";

interface LineItem { id: string; description: string; qty: number; rate: number; }

function inr(n: number) { return n.toLocaleString("en-IN", { maximumFractionDigits: 2 }); }

export function InvoiceGeneratorTool() {
  const [businessName, setBusinessName] = useState("");
  const [businessDetails, setBusinessDetails] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientDetails, setClientDetails] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ id: crypto.randomUUID(), description: "", qty: 1, rate: 0 }]);

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF({ unit: "pt", format: "a4" }) as any;
    const marginX = 48;

    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("INVOICE", marginX, 56);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`# ${invoiceNumber}`, marginX, 72);
    doc.text(`Date: ${date}`, marginX, 86);

    doc.setFont("helvetica", "bold"); doc.text(businessName || "Your Business", 400, 56);
    doc.setFont("helvetica", "normal");
    const bizLines = doc.splitTextToSize(businessDetails, 160);
    doc.text(bizLines, 400, 70);

    let y = 120;
    doc.setFont("helvetica", "bold"); doc.text("Bill To:", marginX, y);
    doc.setFont("helvetica", "normal"); y += 14;
    doc.text(clientName || "[Client Name]", marginX, y); y += 14;
    const clientLines = doc.splitTextToSize(clientDetails, 250);
    doc.text(clientLines, marginX, y);

    doc.autoTable({
      startY: 190,
      head: [["Description", "Qty", "Rate", "Amount"]],
      body: items.map((it) => [it.description || "-", String(it.qty), inr(it.rate), inr(it.qty * it.rate)]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: marginX, right: marginX },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text(`Subtotal: ${inr(subtotal)}`, 400, finalY);
    doc.text(`Tax (${taxRate}%): ${inr(tax)}`, 400, finalY + 16);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${inr(total)}`, 400, finalY + 34);

    if (notes) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(doc.splitTextToSize(`Notes: ${notes}`, 500), marginX, finalY + 60);
    }

    doc.save(`${invoiceNumber || "invoice"}.pdf`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Invoice number" value={invoiceNumber} onChange={setInvoiceNumber} />
          <Field label="Date" value={date} onChange={setDate} type="date" />
        </div>

        <div>
          <p className="text-sm font-semibold">Your business</p>
          <Field label="Name" value={businessName} onChange={setBusinessName} />
          <TextArea label="Address / GSTIN / contact" value={businessDetails} onChange={setBusinessDetails} rows={2} />
        </div>

        <div>
          <p className="text-sm font-semibold">Bill to</p>
          <Field label="Client name" value={clientName} onChange={setClientName} />
          <TextArea label="Client address" value={clientDetails} onChange={setClientDetails} rows={2} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Line items</p>
            <button onClick={() => setItems([...items, { id: crypto.randomUUID(), description: "", qty: 1, rate: 0 }])} className="focus-ring flex items-center gap-1 text-xs text-primary"><Plus size={14} /> Add</button>
          </div>
          <div className="mt-2 space-y-2">
            {items.map((it) => (
              <div key={it.id} className="grid grid-cols-[1fr_60px_80px_24px] gap-2">
                <input placeholder="Description" value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} className="focus-ring rounded-control border border-border bg-surface px-2 py-1.5 text-sm" />
                <input type="number" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(it.id, "qty", Number(e.target.value))} className="focus-ring rounded-control border border-border bg-surface px-2 py-1.5 text-sm" />
                <input type="number" placeholder="Rate" value={it.rate} onChange={(e) => updateItem(it.id, "rate", Number(e.target.value))} className="focus-ring rounded-control border border-border bg-surface px-2 py-1.5 text-sm" />
                <button onClick={() => setItems(items.filter((x) => x.id !== it.id))} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <Field label="Tax rate (%)" value={String(taxRate)} onChange={(v) => setTaxRate(Number(v))} type="number" />
        <TextArea label="Notes" value={notes} onChange={setNotes} rows={2} />

        <Button onClick={downloadPdf} className="w-full"><Download size={16} /> Download Invoice PDF</Button>
      </div>

      <div className="rounded-card border border-border bg-white p-6 text-sm text-black shadow-soft">
        <div className="flex justify-between">
          <div>
            <p className="text-lg font-bold">INVOICE</p>
            <p className="text-xs text-gray-500"># {invoiceNumber}</p>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{businessName || "Your Business"}</p>
            <p className="whitespace-pre-line text-xs text-gray-500">{businessDetails}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-600">Bill To:</p>
          <p>{clientName || "[Client Name]"}</p>
          <p className="whitespace-pre-line text-xs text-gray-500">{clientDetails}</p>
        </div>
        <table className="mt-4 w-full text-xs">
          <thead><tr className="border-b text-left text-gray-500"><th className="py-1">Description</th><th>Qty</th><th>Rate</th><th className="text-right">Amount</th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b"><td className="py-1">{it.description || "-"}</td><td>{it.qty}</td><td>{inr(it.rate)}</td><td className="text-right">{inr(it.qty * it.rate)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex justify-end">
          <div className="w-40 space-y-1 text-xs">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span>{inr(tax)}</span></div>
            <div className="flex justify-between font-bold"><span>Total</span><span>{inr(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <label className="mt-2 block text-sm">
      {label}
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
