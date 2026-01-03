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

// A4 dimensions in pixels at 96 DPI: 210mm x 297mm ≈ 794px x 1123px
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_PADDING = 56; // ~15mm padding
const CONTENT_HEIGHT = A4_HEIGHT - (PAGE_PADDING * 2);
const ITEMS_PER_PAGE = 15; // Approximate items that fit on first page with header
const ITEMS_PER_CONTINUATION = 25; // More items fit on continuation pages

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

  // Split line items into pages
  const paginateItems = () => {
    const pages: LineItem[][] = [];
    const items = [...formData.lineItems];
    
    if (items.length <= ITEMS_PER_PAGE) {
      return [items];
    }

    // First page with header takes fewer items
    pages.push(items.splice(0, ITEMS_PER_PAGE));
    
    // Continuation pages can hold more items
    while (items.length > 0) {
      pages.push(items.splice(0, ITEMS_PER_CONTINUATION));
    }

    return pages;
  };

  const itemPages = paginateItems();
  const totalPages = itemPages.length;
  const isMultiPage = totalPages > 1;

  const PageWrapper = ({ children, pageNum }: { children: React.ReactNode; pageNum: number }) => (
    <div 
      className="bg-white text-black font-sans relative overflow-hidden"
      style={{ 
        width: `${A4_WIDTH}px`, 
        minHeight: `${A4_HEIGHT}px`, 
        padding: `${PAGE_PADDING}px`,
        paddingBottom: `${PAGE_PADDING + 16}px`,
        boxSizing: 'border-box',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}
    >
      {children}
      {/* Page number */}
      <div className="absolute bottom-4 right-8 text-xs text-slate-400">
        Page {pageNum} of {totalPages}
      </div>
    </div>
  );

  const TableHeader = () => (
    <tr className="bg-slate-700 text-white">
      <th className="py-2 px-3 text-left font-medium w-8">#</th>
      <th className="py-2 px-3 text-left font-medium">Description</th>
      <th className="py-2 px-3 text-center font-medium w-16">Qty</th>
      <th className="py-2 px-3 text-center font-medium w-16">Unit</th>
      <th className="py-2 px-3 text-right font-medium w-24">Rate ({formData.currency})</th>
      <th className="py-2 px-3 text-center font-medium w-16">Tax %</th>
      <th className="py-2 px-3 text-right font-medium w-24">Line Total</th>
    </tr>
  );

  const renderItemRow = (item: LineItem, globalIndex: number) => (
    <tr key={item.id} className="border-b border-slate-200">
      <td className="py-2 px-3 text-amber-600 font-medium">{globalIndex + 1}</td>
      <td className="py-2 px-3">{item.description || '-'}</td>
      <td className="py-2 px-3 text-center">{item.quantity}</td>
      <td className="py-2 px-3 text-center">{item.unit}</td>
      <td className="py-2 px-3 text-right">{formatCurrency(item.rate)}</td>
      <td className="py-2 px-3 text-center">{item.taxPercent}%</td>
      <td className="py-2 px-3 text-right font-semibold">{formatCurrency(calculateLineTotal(item))}</td>
    </tr>
  );

  // Calculate global index offset for each page
  const getGlobalIndex = (pageIndex: number, itemIndex: number) => {
    let offset = 0;
    for (let i = 0; i < pageIndex; i++) {
      offset += itemPages[i].length;
    }
    return offset + itemIndex;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* First Page */}
      <PageWrapper pageNum={1}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {formData.seller.logo ? (
              <img src={formData.seller.logo} alt="Company Logo" className="h-14 w-14 object-contain" />
            ) : (
              <div className="h-14 w-14 bg-amber-100 rounded flex items-center justify-center">
                <Building2 className="h-7 w-7 text-amber-700" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-wide">INVOICE</h1>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-slate-700 mb-4" />

        {/* Seller and Invoice Details */}
        <div className="flex justify-between mb-4">
          <div className="space-y-0.5 text-xs">
            <p className="text-slate-500 font-medium">Seller (From)</p>
            <p className="font-bold text-sm">{formData.seller.name || 'Company Name'}</p>
            <p className="whitespace-pre-line">{formData.seller.address || 'Address'}</p>
            <p>VAT: {formData.seller.taxId || 'Tax ID'}</p>
            <p>{formData.seller.email || 'email@example.com'}</p>
            <p>{formData.seller.phone || '+00 000 000 000'}</p>
          </div>
          <div className="text-xs space-y-0.5">
            <div className="grid grid-cols-2 gap-x-3">
              <span className="text-slate-500 font-medium">Invoice No:</span>
              <span className="font-semibold">{formData.invoiceNumber || 'INV-0000'}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3">
              <span className="text-slate-500 font-medium">Invoice Date:</span>
              <span>{formData.invoiceDate ? format(formData.invoiceDate, 'dd MMM yyyy') : '-'}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3">
              <span className="text-slate-500 font-medium">Due Date:</span>
              <span>{formData.dueDate ? format(formData.dueDate, 'dd MMM yyyy') : '-'}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3">
              <span className="text-slate-500 font-medium">Currency:</span>
              <span>{formData.currency}</span>
            </div>
          </div>
        </div>

        {/* Bill To and Client */}
        <div className="flex gap-6 mb-4">
          <div className="flex-1 space-y-0.5 text-xs">
            <p className="text-slate-500 font-medium">Bill To</p>
            <p className="font-bold text-sm">{formData.clientName || 'Client Name'}</p>
            <p className="whitespace-pre-line">{formData.clientAddress || 'Client Address'}</p>
          </div>
          <div className="flex-1 space-y-0.5 text-xs">
            <p className="text-slate-500 font-medium">Client:</p>
            <p className="font-bold text-sm">{formData.clientName || 'Client Name'}</p>
            <p className="whitespace-pre-line">{formData.clientAddress || 'Client Address'}</p>
          </div>
        </div>

        {/* Line Items Table - First Page */}
        <div className="mb-4">
          <table className="w-full text-xs">
            <thead>
              <TableHeader />
            </thead>
            <tbody>
              {itemPages[0].map((item, idx) => renderItemRow(item, getGlobalIndex(0, idx)))}
            </tbody>
          </table>

          {/* Show "Continued on next page" if multi-page */}
          {isMultiPage && (
            <p className="text-xs text-slate-400 italic text-right mt-2">Continued on next page...</p>
          )}
        </div>

        {/* Only show totals and footer on first page if single page */}
        {!isMultiPage && (
          <>
            {/* Totals */}
            <div className="flex justify-end mb-4">
              <div className="w-56 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Tax ({averageTaxPercent()}%)</span>
                  <span className="font-medium">{formatCurrency(calculateTotalTax())}</span>
                </div>
                <div className="flex justify-between py-1.5 bg-slate-100 px-2 mt-1 rounded">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-amber-600">{formData.currency} {formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Amount in words */}
            <p className="text-xs italic text-slate-600 mb-4">
              Amount in words: <span className="not-italic">{numberToWords(calculateTotal())}</span>
            </p>

            {/* Bank Details and Notes */}
            <div className="flex gap-6 mb-6">
              <div className="flex-1 space-y-1 text-xs">
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
              <div className="flex-1 space-y-1 text-xs">
                <p className="font-bold text-slate-700 border-b border-slate-300 pb-1">Notes / Terms</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 max-h-20 overflow-hidden">
                  {notesArray.length > 0 ? (
                    notesArray.slice(0, 5).map((note, index) => (
                      <li key={index} className="truncate">{note}</li>
                    ))
                  ) : (
                    <li>Payment due as per terms.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end text-xs border-t border-slate-200 pt-3">
              <p className="text-slate-500">Please include the invoice number on your payment reference.</p>
              <p className="italic text-slate-600">Authorized Sign & Stamp</p>
            </div>

            {/* Bottom Bar */}
            <div className="h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-amber-600 mt-6 rounded-b absolute bottom-0 left-0 right-0" />
          </>
        )}
      </PageWrapper>

      {/* Continuation Pages */}
      {itemPages.slice(1).map((pageItems, pageIdx) => {
        const isLastPage = pageIdx === itemPages.length - 2;
        
        return (
          <PageWrapper key={pageIdx + 1} pageNum={pageIdx + 2}>
            {/* Continuation Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{formData.seller.name}</span>
                <span className="mx-2">|</span>
                Invoice: {formData.invoiceNumber}
              </div>
              <h2 className="text-lg font-semibold text-slate-700">INVOICE (Continued)</h2>
            </div>

            <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-slate-700 mb-4" />

            {/* Line Items Table - Continuation */}
            <div className="mb-4">
              <table className="w-full text-xs">
                <thead>
                  <TableHeader />
                </thead>
                <tbody>
                  {pageItems.map((item, idx) => renderItemRow(item, getGlobalIndex(pageIdx + 1, idx)))}
                </tbody>
              </table>

              {!isLastPage && (
                <p className="text-xs text-slate-400 italic text-right mt-2">Continued on next page...</p>
              )}
            </div>

            {/* Show totals and footer only on last page */}
            {isLastPage && (
              <>
                {/* Totals */}
                <div className="flex justify-end mb-4">
                  <div className="w-56 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Tax ({averageTaxPercent()}%)</span>
                      <span className="font-medium">{formatCurrency(calculateTotalTax())}</span>
                    </div>
                    <div className="flex justify-between py-1.5 bg-slate-100 px-2 mt-1 rounded">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-amber-600">{formData.currency} {formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Amount in words */}
                <p className="text-xs italic text-slate-600 mb-4">
                  Amount in words: <span className="not-italic">{numberToWords(calculateTotal())}</span>
                </p>

                {/* Bank Details and Notes */}
                <div className="flex gap-6 mb-6">
                  <div className="flex-1 space-y-1 text-xs">
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
                  <div className="flex-1 space-y-1 text-xs">
                    <p className="font-bold text-slate-700 border-b border-slate-300 pb-1">Notes / Terms</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 max-h-20 overflow-hidden">
                      {notesArray.length > 0 ? (
                        notesArray.slice(0, 5).map((note, index) => (
                          <li key={index} className="truncate">{note}</li>
                        ))
                      ) : (
                        <li>Payment due as per terms.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end text-xs border-t border-slate-200 pt-3">
                  <p className="text-slate-500">Please include the invoice number on your payment reference.</p>
                  <p className="italic text-slate-600">Authorized Sign & Stamp</p>
                </div>

                {/* Bottom Bar */}
                <div className="h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-amber-600 mt-6 rounded-b absolute bottom-0 left-0 right-0" />
              </>
            )}
          </PageWrapper>
        );
      })}
    </div>
  );
};

export default InvoicePreview;
