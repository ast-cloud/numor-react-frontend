import { format } from "date-fns";
import { Building2 } from "lucide-react";

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
  address: string;
  taxId: string;
  email: string;
  phone: string;
}

interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  currency: string;
  seller: SellerInfo;
  clientName: string;
  clientAddress: string;
  lineItems: LineItem[];
  bankName: string;
  iban: string;
  swiftBic: string;
  bankAddress: string;
  notes: string;
}

interface InvoicePreviewProps {
  formData: InvoiceFormData;
}

const numberToWords = (num: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (num === 0) return 'zero';

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    return convert(Math.floor(n / 1000000)) + ' million' + (n % 1000000 ? ' ' + convert(n % 1000000) : '');
  };

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = convert(intPart);
  if (decPart > 0) {
    result += ' and ' + convert(decPart) + ' fils';
  }

  return result.charAt(0).toUpperCase() + result.slice(1) + ' only.';
};

const InvoicePreview = ({ formData }: InvoicePreviewProps) => {
  const calculateLineTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.rate;
    const tax = subtotal * (item.taxPercent / 100);
    return subtotal + tax;
  };

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const calculateTotalTax = () => {
    return formData.lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.rate;
      return sum + subtotal * (item.taxPercent / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const averageTaxPercent = () => {
    if (formData.lineItems.length === 0) return 0;
    const totalTaxPercent = formData.lineItems.reduce((sum, item) => sum + item.taxPercent, 0);
    return Math.round(totalTaxPercent / formData.lineItems.length);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const notesArray = formData.notes.split('\n').filter(note => note.trim());

  return (
    <div className="bg-white text-black font-sans" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          {formData.seller.logo ? (
            <img src={formData.seller.logo} alt="Company Logo" className="h-16 w-16 object-contain" />
          ) : (
            <div className="h-16 w-16 bg-amber-100 rounded flex items-center justify-center">
              <Building2 className="h-8 w-8 text-amber-700" />
            </div>
          )}
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-wide">INVOICE</h1>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-slate-700 mb-6" />

      {/* Seller and Invoice Details */}
      <div className="flex justify-between mb-6">
        <div className="space-y-1 text-sm">
          <p className="text-slate-500 font-medium">Seller (From)</p>
          <p className="font-bold text-base">{formData.seller.name || 'Company Name'}</p>
          <p className="whitespace-pre-line">{formData.seller.address || 'Address'}</p>
          <p>VAT: {formData.seller.taxId || 'Tax ID'}</p>
          <p>{formData.seller.email || 'email@example.com'}</p>
          <p>{formData.seller.phone || '+00 000 000 000'}</p>
        </div>
        <div className="text-sm space-y-1">
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-slate-500 font-medium">Invoice No:</span>
            <span className="font-semibold">{formData.invoiceNumber || 'INV-0000'}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-slate-500 font-medium">Invoice Date:</span>
            <span>{formData.invoiceDate ? format(formData.invoiceDate, 'dd MMM yyyy') : '-'}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-slate-500 font-medium">Due Date:</span>
            <span>{formData.dueDate ? format(formData.dueDate, 'dd MMM yyyy') : '-'}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-slate-500 font-medium">Currency:</span>
            <span>{formData.currency}</span>
          </div>
        </div>
      </div>

      {/* Bill To and Client */}
      <div className="flex gap-8 mb-6">
        <div className="flex-1 space-y-1 text-sm">
          <p className="text-slate-500 font-medium">Bill To</p>
          <p className="font-bold">{formData.clientName || 'Client Name'}</p>
          <p className="whitespace-pre-line">{formData.clientAddress || 'Client Address'}</p>
        </div>
        <div className="flex-1 space-y-1 text-sm">
          <p className="text-slate-500 font-medium">Client:</p>
          <p className="font-bold">{formData.clientName || 'Client Name'}</p>
          <p className="whitespace-pre-line">{formData.clientAddress || 'Client Address'}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="py-2 px-3 text-left font-medium w-8">#</th>
              <th className="py-2 px-3 text-left font-medium">Description</th>
              <th className="py-2 px-3 text-center font-medium w-16">Qty</th>
              <th className="py-2 px-3 text-center font-medium w-16">Unit</th>
              <th className="py-2 px-3 text-right font-medium w-24">Rate ({formData.currency})</th>
              <th className="py-2 px-3 text-center font-medium w-16">Tax %</th>
              <th className="py-2 px-3 text-right font-medium w-24">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {formData.lineItems.map((item, index) => (
              <tr key={item.id} className="border-b border-slate-200">
                <td className="py-2 px-3 text-amber-600 font-medium">{index + 1}</td>
                <td className="py-2 px-3">{item.description || '-'}</td>
                <td className="py-2 px-3 text-center">{item.quantity}</td>
                <td className="py-2 px-3 text-center">{item.unit}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-2 px-3 text-center">{item.taxPercent}%</td>
                <td className="py-2 px-3 text-right font-semibold">{formatCurrency(calculateLineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-4">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Tax ({averageTaxPercent()}%)</span>
              <span className="font-medium">{formatCurrency(calculateTotalTax())}</span>
            </div>
            <div className="flex justify-between py-2 bg-slate-100 px-2 mt-1 rounded">
              <span className="font-bold">Total</span>
              <span className="font-bold text-amber-600">{formData.currency} {formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <p className="text-sm italic text-slate-600 mb-6">
        Amount in words: <span className="not-italic">{numberToWords(calculateTotal())}</span>
      </p>

      {/* Bank Details and Notes */}
      <div className="flex gap-8 mb-8">
        <div className="flex-1 space-y-2 text-sm">
          <p className="font-bold text-slate-700 border-b border-slate-300 pb-1">Bank / Payment Details</p>
          {formData.bankName && (
            <p><span className="text-slate-500">Bank Name:</span> {formData.bankName}</p>
          )}
          {formData.iban && (
            <p><span className="text-slate-500">IBAN:</span> {formData.iban}</p>
          )}
          {formData.swiftBic && (
            <p><span className="text-slate-500">SWIFT/BIC:</span> {formData.swiftBic}</p>
          )}
          {formData.bankAddress && (
            <p><span className="text-slate-500">Bank Address:</span> {formData.bankAddress}</p>
          )}
        </div>
        <div className="flex-1 space-y-2 text-sm">
          <p className="font-bold text-slate-700 border-b border-slate-300 pb-1">Notes / Terms</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            {notesArray.length > 0 ? (
              notesArray.map((note, index) => (
                <li key={index}>{note}</li>
              ))
            ) : (
              <li>Payment due as per terms.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end text-sm border-t border-slate-200 pt-4">
        <p className="text-slate-500">Please include the invoice number on your payment reference.</p>
        <p className="italic text-slate-600">Authorized Sign & Stamp</p>
      </div>

      {/* Bottom Bar */}
      <div className="h-4 bg-gradient-to-r from-slate-700 via-slate-600 to-amber-600 mt-8 rounded-b" />
    </div>
  );
};

export default InvoicePreview;
