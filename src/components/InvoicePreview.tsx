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

interface InvoiceFormData {
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
  accountName?: string;
  iban: string;
  swiftBic: string;
  ifscCode?: string;
  bankAddress: string;
  notes: string;
  sacCode?: string;
  paymentTerms?: string;
}

interface InvoicePreviewProps {
  formData: InvoiceFormData;
}

const InvoicePreview = ({ formData }: InvoicePreviewProps) => {
  const calculateLineTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.rate;
    const tax = subtotal * (item.taxPercent / 100);
    return subtotal + tax;
  };

  const calculateSubtotal = () =>
    formData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  const calculateTotalTax = () =>
    formData.lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.rate;
      return sum + subtotal * (item.taxPercent / 100);
    }, 0);

  const calculateTotal = () => calculateSubtotal() + calculateTotalTax();

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isIndiaToIndia =
    formData.seller.country === "India" && formData.clientCountry === "India";
  const isSameState =
    isIndiaToIndia && formData.seller.state === formData.clientState;
  const isCrossBorder =
    formData.seller.country &&
    formData.clientCountry &&
    formData.seller.country !== formData.clientCountry;

  const utgstTerritories = [
    "Lakshadweep",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Ladakh",
    "Chandigarh",
    "Andaman and Nicobar Islands",
  ];
  const isUTGST = isSameState && utgstTerritories.includes(formData.seller.state);

  const hasUniformTax = () => {
    if (formData.lineItems.length === 0) return true;
    const first = formData.lineItems[0].taxPercent;
    return formData.lineItems.every((i) => i.taxPercent === first);
  };
  const uniformTax = hasUniformTax() ? (formData.lineItems[0]?.taxPercent ?? 0) : null;

  // Build tax summary entries matching backend taxSummary object
  const buildTaxSummary = (): { label: string; rate: string; amount: string }[] => {
    if (isCrossBorder) return [];
    const totalTax = calculateTotalTax();
    if (isIndiaToIndia) {
      if (isSameState) {
        const halfRate = uniformTax !== null ? `${uniformTax / 2}` : "";
        const halfAmount = fmt(totalTax / 2);
        return [
          { label: "CGST", rate: halfRate, amount: halfAmount },
          { label: isUTGST ? "UTGST" : "SGST", rate: halfRate, amount: halfAmount },
        ];
      } else {
        return [
          { label: "IGST", rate: uniformTax !== null ? `${uniformTax}` : "", amount: fmt(totalTax) },
        ];
      }
    }
    return [];
  };

  const taxSummary = buildTaxSummary();
  const effectiveTax = isCrossBorder
    ? 0
    : uniformTax !== null
      ? uniformTax
      : formData.lineItems.length > 0
        ? Math.round(
            formData.lineItems.reduce((s, i) => s + i.taxPercent, 0) /
              formData.lineItems.length
          )
        : 0;

  const taxLabel = formData.taxType && formData.taxType !== "None" ? formData.taxType : "Tax";

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "12px",
        color: "#333",
        margin: 0,
        padding: "24px",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          border: "1px solid #e5e7eb",
          padding: "24px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #f59e0b",
            paddingBottom: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "20px", color: "#f59e0b" }}>
            NUMOR
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: 0, fontSize: "22px", letterSpacing: "1px" }}>INVOICE</h1>
            <div style={{ marginTop: "6px" }}>
              Invoice No: {formData.invoiceNumber || "Auto-generated"}
              <br />
              Issue Date:{" "}
              {formData.invoiceDate ? format(formData.invoiceDate, "yyyy-MM-dd") : "-"}
              <br />
              Due Date:{" "}
              {formData.dueDate ? format(formData.dueDate, "yyyy-MM-dd") : "-"}
              <br />
              Currency: {formData.currency}
            </div>
          </div>
        </div>

        {/* SELLER / BUYER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "40%",
            marginBottom: "20px",
          }}
        >
          <div style={{ width: "48%" }}>
            <h4 style={{ marginBottom: "6px", fontSize: "13px", color: "#111827" }}>
              Seller (From)
            </h4>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>
              <strong>{formData.seller.name || "Company Name"}</strong>
            </p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>{formData.seller.streetAddress}</p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>
              {[formData.seller.city, formData.seller.state, formData.seller.zip]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>{formData.seller.country}</p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>Tax ID: {formData.seller.taxId || "-"}</p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>
              Email: {formData.seller.email || "-"}
            </p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>
              Phone: {formData.seller.phone || "-"}
            </p>
            {formData.sacCode && (
              <p style={{ margin: "2px 0", lineHeight: 1.4 }}>SAC Code: {formData.sacCode}</p>
            )}
          </div>
          <div style={{ width: "48%" }}>
            <h4 style={{ marginBottom: "6px", fontSize: "13px", color: "#111827" }}>Bill To</h4>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>
              <strong>{formData.clientName || "Client Name"}</strong>
            </p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>{formData.clientStreetAddress}</p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>
              {[formData.clientCity, formData.clientState, formData.clientZip]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p style={{ margin: "2px 0", lineHeight: 1.4 }}>{formData.clientCountry}</p>
            {formData.clientEmail && (
              <p style={{ margin: "2px 0", lineHeight: 1.4 }}>{formData.clientEmail}</p>
            )}
            {formData.clientPhone && (
              <p style={{ margin: "2px 0", lineHeight: 1.4 }}>{formData.clientPhone}</p>
            )}
            {formData.clientCompanyType && (
              <p style={{ margin: "2px 0", lineHeight: 1.4 }}>{formData.clientCompanyType}</p>
            )}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ background: "#374151", color: "#fff" }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Qty</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Unit</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Unit Type</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Tax %</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {formData.lineItems.map((item, idx) => (
              <tr key={item.id}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={tdStyle}>{item.description || "-"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{item.quantity}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{fmt(item.rate)}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{item.unit}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{item.taxPercent}%</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{fmt(calculateLineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <table style={{ width: "300px", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={totalsTdStyle}>Subtotal</td>
                <td style={{ ...totalsTdStyle, textAlign: "right" }}>{fmt(calculateSubtotal())}</td>
              </tr>
              {taxSummary.map((entry, i) => (
                <tr key={i}>
                  <td style={totalsTdStyle}>
                    {entry.label} ({entry.rate}%):
                  </td>
                  <td style={{ ...totalsTdStyle, textAlign: "right" }}>{entry.amount}</td>
                </tr>
              ))}
              <tr>
                <td style={totalsTdStyle}>
                  {taxLabel} ({effectiveTax}%)
                </td>
                <td style={{ ...totalsTdStyle, textAlign: "right" }}>
                  {fmt(isCrossBorder ? 0 : calculateTotalTax())}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    ...totalsTdStyle,
                    fontWeight: "bold",
                    borderTop: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    ...totalsTdStyle,
                    textAlign: "right",
                    fontWeight: "bold",
                    color: "#f59e0b",
                    borderTop: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                >
                  {formData.currency} {fmt(isCrossBorder ? calculateSubtotal() : calculateTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* REVERSE CHARGE NOTE */}
        {isCrossBorder && (
          <div
            style={{
              marginTop: "16px",
              padding: "10px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              fontSize: "11px",
            }}
          >
            Zero-rated export of services. Subject to reverse charge in the country of receipt.
          </div>
        )}

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "24px",
            fontSize: "11px",
          }}
        >
          <div>
            <h4 style={{ marginBottom: "6px", fontSize: "12px" }}>Bank / Payment Details</h4>
            {formData.bankName && (
              <p style={{ margin: "2px 0" }}>
                <strong>Bank Name:</strong> {formData.bankName}
              </p>
            )}
            {formData.accountName && (
              <p style={{ margin: "2px 0" }}>
                <strong>Account Name:</strong> {formData.accountName}
              </p>
            )}
            {formData.iban && (
              <p style={{ margin: "2px 0" }}>
                <strong>Account Number:</strong> {formData.iban}
              </p>
            )}
            {formData.ifscCode && (
              <p style={{ margin: "2px 0" }}>
                <strong>IFSC:</strong> {formData.ifscCode}
              </p>
            )}
            {formData.swiftBic && (
              <p style={{ margin: "2px 0" }}>
                <strong>SWIFT:</strong> {formData.swiftBic}
              </p>
            )}
            {formData.bankAddress && (
              <p style={{ margin: "2px 0" }}>
                <strong>Bank Address:</strong> {formData.bankAddress}
              </p>
            )}
          </div>
          <div>
            <h4 style={{ marginBottom: "6px", fontSize: "12px" }}>Notes / Terms</h4>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {formData.paymentTerms && <li>{formData.paymentTerms}</li>}
              {formData.notes ? (
                formData.notes
                  .split("\n")
                  .filter((n) => n.trim())
                  .map((note, i) => <li key={i}>{note}</li>)
              ) : (
                !formData.paymentTerms && <li>Payment due as per terms.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  textAlign: "left",
  fontWeight: "normal",
  fontSize: "12px",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  textAlign: "left",
};

const totalsTdStyle: React.CSSProperties = {
  border: "none",
  padding: "6px",
};

export default InvoicePreview;
