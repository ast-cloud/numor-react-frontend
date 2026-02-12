import { useMemo, useRef, useEffect, useState } from "react";
import { renderInvoiceHtml, type InvoiceFormData } from "@/lib/invoiceTemplateRenderer";

interface InvoicePreviewProps {
  formData: InvoiceFormData;
}

const InvoicePreview = ({ formData }: InvoicePreviewProps) => {
  const html = useMemo(() => renderInvoiceHtml(formData), [formData]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(1123);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc?.body) {
          const height = doc.body.scrollHeight;
          setIframeHeight(Math.max(height, 1123));
        }
      } catch {
        // cross-origin fallback
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [html]);

  return (
    <div className="flex flex-col gap-6">
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Invoice Preview"
        className="bg-white border rounded-lg shadow"
        style={{
          width: "794px",
          height: `${iframeHeight}px`,
          border: "none",
          overflow: "hidden",
        }}
        scrolling="no"
      />
    </div>
  );
};

export default InvoicePreview;
