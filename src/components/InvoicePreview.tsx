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
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  email: string;
  phone: string;
}

interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  currency: string;
  taxType: string;
  seller: SellerInfo;
  clientName: string;
  clientStreetAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
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

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_PADDING = 56;

// Content limits per page
const FIRST_PAGE_ITEMS = 12;
const CONTINUATION_PAGE_ITEMS = 22;

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

  // Build pages structure
  interface PageContent {
    type: 'first' | 'items-continuation' | 'footer';
    items?: LineItem[];
    itemStartIndex?: number;
    showTotals?: boolean;
    showFooter?: boolean;
    notes?: string[];
    notesStartIndex?: number;
  }

  const buildPages = (): PageContent[] => {
    const pages: PageContent[] = [];
    const allItems = [...formData.lineItems];
    let remainingItems = [...allItems];
    let itemIndex = 0;

    // First page
    const firstPageItems = remainingItems.splice(0, FIRST_PAGE_ITEMS);
    const hasMoreItems = remainingItems.length > 0;
    
    pages.push({
      type: 'first',
      items: firstPageItems,
      itemStartIndex: 0,
      showTotals: !hasMoreItems,
      showFooter: !hasMoreItems,
    });

    itemIndex = firstPageItems.length;

    // Continuation pages for remaining items
    while (remainingItems.length > 0) {
      const pageItems = remainingItems.splice(0, CONTINUATION_PAGE_ITEMS);
      const isLastItemPage = remainingItems.length === 0;
      
      pages.push({
        type: 'items-continuation',
        items: pageItems,
        itemStartIndex: itemIndex,
        showTotals: isLastItemPage,
        showFooter: isLastItemPage,
      });
      
      itemIndex += pageItems.length;
    }

    return pages;
  };

  const pages = buildPages();
  const totalPages = pages.length;

  const PageWrapper = ({ children, pageNum }: { children: React.ReactNode; pageNum: number }) => (
    <div 
      className="bg-white text-black font-sans relative"
      style={{ 
        width: `${A4_WIDTH}px`, 
        height: `${A4_HEIGHT}px`, 
        padding: `${PAGE_PADDING}px`,
        boxSizing: 'border-box',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
      }}
    >
      <div className="h-full flex flex-col">
        {children}
      </div>
      <div className="absolute bottom-4 right-8 text-xs text-slate-400">
        Page {pageNum} of {totalPages}
      </div>
      <div className="h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-amber-600 absolute bottom-0 left-0 right-0" />
    </div>
  );

  const TableHeader = () => (
    <tr className="bg-slate-700 text-white">
      <th className="py-1.5 px-2 text-left font-medium w-8 text-xs">#</th>
      <th className="py-1.5 px-2 text-left font-medium text-xs">Description</th>
      <th className="py-1.5 px-2 text-center font-medium w-14 text-xs">Qty</th>
      <th className="py-1.5 px-2 text-center font-medium w-14 text-xs">Unit</th>
      <th className="py-1.5 px-2 text-right font-medium w-20 text-xs">Rate</th>
      <th className="py-1.5 px-2 text-center font-medium w-14 text-xs">Tax %</th>
      <th className="py-1.5 px-2 text-right font-medium w-20 text-xs">Total</th>
    </tr>
  );

  const renderItemRow = (item: LineItem, globalIndex: number) => (
    <tr key={item.id} className="border-b border-slate-200">
      <td className="py-1.5 px-2 text-amber-600 font-medium text-xs">{globalIndex + 1}</td>
      <td className="py-1.5 px-2 text-xs">{item.description || '-'}</td>
      <td className="py-1.5 px-2 text-center text-xs">{item.quantity}</td>
      <td className="py-1.5 px-2 text-center text-xs">{item.unit}</td>
      <td className="py-1.5 px-2 text-right text-xs">{formatCurrency(item.rate)}</td>
      <td className="py-1.5 px-2 text-center text-xs">{item.taxPercent}%</td>
      <td className="py-1.5 px-2 text-right font-semibold text-xs">{formatCurrency(calculateLineTotal(item))}</td>
    </tr>
  );

  const isIndiaToIndia = formData.seller.country === "India" && formData.clientCountry === "India";
  const isSameState = isIndiaToIndia && formData.seller.state === formData.clientState;
  const isDifferentStateIndia = isIndiaToIndia && formData.seller.state !== formData.clientState;

  const hasUniformTaxPercent = () => {
    if (formData.lineItems.length === 0) return true;
    const firstTax = formData.lineItems[0].taxPercent;
    return formData.lineItems.every(item => item.taxPercent === firstTax);
  };

  const uniformTaxPercent = hasUniformTaxPercent() ? formData.lineItems[0]?.taxPercent ?? 0 : null;

  const TotalsSection = () => (
    <div className="flex justify-end mt-3">
      <div className="w-52 text-xs">
        <div className="flex justify-between py-1 border-b border-slate-200">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
        </div>
        {isIndiaToIndia ? (
          isSameState ? (
            <>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">CGST{uniformTaxPercent !== null ? ` (${uniformTaxPercent / 2}%)` : ''}</span>
                <span className="font-medium">{formatCurrency(calculateTotalTax() / 2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">SGST{uniformTaxPercent !== null ? ` (${uniformTaxPercent / 2}%)` : ''}</span>
                <span className="font-medium">{formatCurrency(calculateTotalTax() / 2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">IGST{uniformTaxPercent !== null ? ` (${uniformTaxPercent}%)` : ''}</span>
              <span className="font-medium">{formatCurrency(calculateTotalTax())}</span>
            </div>
          )
        ) : (
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">{formData.taxType || 'Tax'}{uniformTaxPercent !== null ? ` (${uniformTaxPercent}%)` : ''}</span>
            <span className="font-medium">{formatCurrency(calculateTotalTax())}</span>
          </div>
        )}
        <div className="flex justify-between py-1.5 bg-slate-100 px-2 mt-1 rounded">
          <span className="font-bold">Total</span>
          <span className="font-bold text-amber-600">{formData.currency} {formatCurrency(calculateTotal())}</span>
        </div>
      </div>
    </div>
  );

  const isCrossBorder = formData.seller.country && formData.clientCountry && formData.seller.country !== formData.clientCountry;

  const FooterSection = () => (
    <>
      <p className="text-xs italic text-slate-600 mt-3 mb-3">
        Amount in words: <span className="not-italic">{numberToWords(calculateTotal())}</span>
      </p>

      {isCrossBorder && (
        <p className="text-xs text-slate-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
          Zero-rated export of services. Subject to reverse charge in the country of receipt.
        </p>
      )}

      <div className="flex gap-4 mb-4">
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
          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
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

      <div className="flex justify-between items-end text-xs border-t border-slate-200 pt-2 mt-auto">
        <p className="text-slate-500">Please include the invoice number on your payment reference.</p>
        <p className="italic text-slate-600">Authorized Sign & Stamp</p>
      </div>
    </>
  );

  const renderFirstPage = (page: PageContent, pageNum: number) => (
    <PageWrapper pageNum={pageNum}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          {formData.seller.logo ? (
            <img src={formData.seller.logo} alt="Company Logo" className="h-12 w-12 object-contain" />
          ) : (
            <div className="h-12 w-12 bg-amber-100 rounded flex items-center justify-center">
              <Building2 className="h-6 w-6 text-amber-700" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-wide">INVOICE</h1>
      </div>

      <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-slate-700 mb-3 flex-shrink-0" />

      {/* Seller and Invoice Details */}
      <div className="flex justify-between mb-3 flex-shrink-0">
        <div className="space-y-0.5 text-xs">
          <p className="text-slate-500 font-medium text-[10px]">Seller (From)</p>
          <p className="font-bold text-xs">{formData.seller.name || 'Company Name'}</p>
          <p className="whitespace-pre-line">{[formData.seller.streetAddress, formData.seller.city, formData.seller.state, formData.seller.zip, formData.seller.country].filter(Boolean).join(', ') || 'Address'}</p>
          <p>VAT: {formData.seller.taxId || 'Tax ID'}</p>
          <p>{formData.seller.email || 'email@example.com'}</p>
          <p>{formData.seller.phone || '+00 000 000 000'}</p>
        </div>
        <div className="text-xs space-y-0.5">
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-slate-500 font-medium text-[10px]">Invoice No:</span>
            <span className="font-semibold">{formData.invoiceNumber || 'INV-0000'}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-slate-500 font-medium text-[10px]">Invoice Date:</span>
            <span>{formData.invoiceDate ? format(formData.invoiceDate, 'dd MMM yyyy') : '-'}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-slate-500 font-medium text-[10px]">Due Date:</span>
            <span>{formData.dueDate ? format(formData.dueDate, 'dd MMM yyyy') : '-'}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-slate-500 font-medium text-[10px]">Currency:</span>
            <span>{formData.currency}</span>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="flex gap-4 mb-3 flex-shrink-0">
        <div className="flex-1 space-y-0.5 text-xs">
          <p className="text-slate-500 font-medium text-[10px]">Bill To</p>
          <p className="font-bold text-xs">{formData.clientName || 'Client Name'}</p>
          <p className="whitespace-pre-line">{[formData.clientStreetAddress, formData.clientCity, formData.clientState, formData.clientZip, formData.clientCountry].filter(Boolean).join(', ') || 'Client Address'}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <table className="w-full text-xs">
          <thead>
            <TableHeader />
          </thead>
          <tbody>
            {page.items?.map((item, idx) => renderItemRow(item, (page.itemStartIndex || 0) + idx))}
          </tbody>
        </table>

        {!page.showTotals && (
          <p className="text-[10px] text-slate-400 italic text-right mt-2">Continued on next page...</p>
        )}

        {page.showTotals && <TotalsSection />}
        {page.showFooter && <FooterSection />}
      </div>
    </PageWrapper>
  );

  const renderContinuationPage = (page: PageContent, pageNum: number) => (
    <PageWrapper pageNum={pageNum}>
      {/* Continuation Header */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{formData.seller.name}</span>
          <span className="mx-2">|</span>
          Invoice: {formData.invoiceNumber}
        </div>
        <h2 className="text-base font-semibold text-slate-700">INVOICE (Continued)</h2>
      </div>

      <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-slate-700 mb-3 flex-shrink-0" />

      {/* Line Items Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <table className="w-full text-xs">
          <thead>
            <TableHeader />
          </thead>
          <tbody>
            {page.items?.map((item, idx) => renderItemRow(item, (page.itemStartIndex || 0) + idx))}
          </tbody>
        </table>

        {!page.showTotals && (
          <p className="text-[10px] text-slate-400 italic text-right mt-2">Continued on next page...</p>
        )}

        {page.showTotals && <TotalsSection />}
        {page.showFooter && <FooterSection />}
      </div>
    </PageWrapper>
  );

  return (
    <div className="flex flex-col gap-6">
      {pages.map((page, idx) => (
        <div key={idx}>
          {page.type === 'first' 
            ? renderFirstPage(page, idx + 1)
            : renderContinuationPage(page, idx + 1)
          }
        </div>
      ))}
    </div>
  );
};

export default InvoicePreview;
