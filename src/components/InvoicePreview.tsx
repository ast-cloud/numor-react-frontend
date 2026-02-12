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
          // Allow time for pagination script to run
          setTimeout(() => {
            const height = doc.body.scrollHeight;
            setIframeHeight(height + 48); // extra padding for page gaps
          }, 50);
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
        className="rounded-lg"
        style={{
          width: "850px",
          height: `${iframeHeight}px`,
          border: "none",
          overflow: "hidden",
          background: "#d1d5db",
        }}
        scrolling="no"
      />
    </div>
  );
};

export default InvoicePreview;
