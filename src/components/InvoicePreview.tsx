import { useMemo } from "react";
import { renderInvoiceHtml, type InvoiceFormData } from "@/lib/invoiceTemplateRenderer";

interface InvoicePreviewProps {
  formData: InvoiceFormData;
}

const InvoicePreview = ({ formData }: InvoicePreviewProps) => {
  const html = useMemo(() => renderInvoiceHtml(formData), [formData]);

  return (
    <div className="flex flex-col gap-6">
      <iframe
        srcDoc={html}
        title="Invoice Preview"
        className="bg-white border rounded-lg shadow"
        style={{
          width: "794px",
          height: "1123px",
          border: "none",
        }}
      />
    </div>
  );
};

export default InvoicePreview;
