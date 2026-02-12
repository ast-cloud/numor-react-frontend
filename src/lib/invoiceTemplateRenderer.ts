import Handlebars from "handlebars";
import invoiceTemplateHtml from "@/templates/invoice.html?raw";
import { format } from "date-fns";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  taxPercent: number;
}

interface SellerInfo {
  logo: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  email: string;
  phone: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  currency: string;
  taxType: string;
  seller: SellerInfo;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompanyType?: string;
  clientStreetAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  lineItems: LineItem[];
  bankName: string;
  accountName: string;
  iban: string;
  swiftBic: string;
  ifscCode: string;
  bankAddress: string;
  notes: string;
  sacCode?: string;
  paymentTerms?: string;
}

const utgstTerritories = [
  "Lakshadweep",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Ladakh",
  "Chandigarh",
  "Andaman and Nicobar Islands",
];

function buildTaxSummary(formData: InvoiceFormData) {
  const { seller, clientCountry, lineItems, taxType } = formData;
  const isCrossBorder = seller.country && clientCountry && seller.country !== clientCountry;

  if (isCrossBorder) return undefined;

  if (taxType === "GST" && seller.country === "India" && clientCountry === "India") {
    const isSameState = seller.state === formData.clientState;
    if (isSameState) {
      const isUT = utgstTerritories.includes(seller.state);
      const secondLabel = isUT ? "UTGST" : "SGST";
      const summary: Record<string, { rate: number; amount: number }> = {};
      lineItems.forEach((item) => {
        const halfRate = item.taxPercent / 2;
        const itemSubtotal = item.quantity * item.rate;
        const halfAmount = itemSubtotal * (halfRate / 100);
        summary["CGST"] = summary["CGST"] || { rate: halfRate, amount: 0 };
        summary["CGST"].amount += halfAmount;
        summary[secondLabel] = summary[secondLabel] || { rate: halfRate, amount: 0 };
        summary[secondLabel].amount += halfAmount;
      });
      Object.values(summary).forEach((v) => { v.amount = Math.round(v.amount * 100) / 100; });
      return summary;
    } else {
      const summary: Record<string, { rate: number; amount: number }> = {};
      lineItems.forEach((item) => {
        const itemSubtotal = item.quantity * item.rate;
        const amount = itemSubtotal * (item.taxPercent / 100);
        summary["IGST"] = summary["IGST"] || { rate: item.taxPercent, amount: 0 };
        summary["IGST"].amount += amount;
      });
      Object.values(summary).forEach((v) => { v.amount = Math.round(v.amount * 100) / 100; });
      return summary;
    }
  }

  if (taxType === "VAT" || taxType === "Sales Tax") {
    const summary: Record<string, { rate: number; amount: number }> = {};
    lineItems.forEach((item) => {
      const itemSubtotal = item.quantity * item.rate;
      const amount = itemSubtotal * (item.taxPercent / 100);
      summary[taxType] = summary[taxType] || { rate: item.taxPercent, amount: 0 };
      summary[taxType].amount += amount;
    });
    Object.values(summary).forEach((v) => { v.amount = Math.round(v.amount * 100) / 100; });
    return summary;
  }

  return undefined;
}

function calculateSubtotal(lineItems: LineItem[]) {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

function calculateTotalTax(lineItems: LineItem[], isCrossBorder: boolean) {
  if (isCrossBorder) return 0;
  return lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.rate * (item.taxPercent / 100);
  }, 0);
}

function calculateEffectiveTax(lineItems: LineItem[], isCrossBorder: boolean) {
  if (isCrossBorder) return 0;
  if (lineItems.length === 0) return 0;
  const totalPercent = lineItems.reduce((sum, item) => sum + item.taxPercent, 0);
  return Math.round(totalPercent / lineItems.length);
}

function formatAmount(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function renderInvoiceHtml(formData: InvoiceFormData): string {
  const template = Handlebars.compile(invoiceTemplateHtml);

  const isCrossBorder = !!(formData.seller.country && formData.clientCountry && formData.seller.country !== formData.clientCountry);
  const subtotal = calculateSubtotal(formData.lineItems);
  const taxAmount = calculateTotalTax(formData.lineItems, isCrossBorder);
  const effectiveTax = calculateEffectiveTax(formData.lineItems, isCrossBorder);
  const totalAmount = subtotal + taxAmount;
  const taxSummary = buildTaxSummary(formData);

  const data = {
    invoiceNumber: formData.invoiceNumber || "Auto-generated",
    issueDate: formData.invoiceDate ? format(formData.invoiceDate, "yyyy-MM-dd") : "-",
    dueDate: formData.dueDate ? format(formData.dueDate, "yyyy-MM-dd") : "-",
    currency: formData.currency,
    sellerName: formData.seller.name || "Company Name",
    sellerStreetAddress: formData.seller.streetAddress || "",
    sellerCity: formData.seller.city || "",
    sellerState: formData.seller.state || "",
    sellerZipCode: formData.seller.zip || "",
    sellerCountry: formData.seller.country || "",
    sellerTaxId: formData.seller.taxId || "",
    sellerEmail: formData.seller.email || "",
    sellerPhone: formData.seller.phone || "",
    sacCode: formData.sacCode || "",
    client: {
      name: formData.clientName || "Client Name",
      streetAddress: formData.clientStreetAddress || "",
      city: formData.clientCity || "",
      state: formData.clientState || "",
      zip: formData.clientZip || "",
      country: formData.clientCountry || "",
      email: formData.clientEmail || "",
      phone: formData.clientPhone || "",
      companyType: formData.clientCompanyType || "",
    },
    items: formData.lineItems.map((item, index) => ({
      serialNo: index + 1,
      itemName: item.description || "-",
      quantity: item.quantity,
      unitPrice: formatAmount(item.rate),
      unitType: item.unit,
      taxRate: isCrossBorder ? 0 : item.taxPercent,
      totalPrice: formatAmount(
        item.quantity * item.rate + (isCrossBorder ? 0 : item.quantity * item.rate * (item.taxPercent / 100))
      ),
    })),
    subtotal: formatAmount(subtotal),
    taxSummary: taxSummary
      ? Object.fromEntries(
          Object.entries(taxSummary).map(([key, val]) => [
            key,
            { rate: val.rate, amount: formatAmount(val.amount) },
          ])
        )
      : undefined,
    effectiveTax,
    taxAmount: formatAmount(taxAmount),
    totalAmount: formatAmount(totalAmount),
    reverseCharge: isCrossBorder,
    bankDetails: {
      bankName: formData.bankName || "",
      accountName: formData.accountName || "",
      accountNumber: formData.iban || "",
      ifsc: formData.ifscCode || "",
      swift: formData.swiftBic || "",
    },
    bankAddress: formData.bankAddress || "",
    paymentTerms: formData.paymentTerms || "Payment due as per terms.",
    notes: formData.notes || "",
  };

  return template(data);
}
