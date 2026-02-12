import { useMemo, useRef, useState, useEffect } from "react";
import { renderInvoiceHtml, type InvoiceFormData } from "@/lib/invoiceTemplateRenderer";

interface InvoicePreviewProps {
  formData: InvoiceFormData;
}

const InvoicePreview = ({ formData }: InvoicePreviewProps) => {
  const html = useMemo(() => renderInvoiceHtml(formData), [formData]);

  return (
    <div className="w-full overflow-hidden">
      <div
        className="origin-top-left"
        style={{
          width: "794px",
          height: "1123px",
          transform: "scale(var(--preview-scale, 1))",
        }}
      >
        <iframe
          srcDoc={html}
          title="Invoice Preview"
          className="bg-white border rounded-lg shadow w-full h-full"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
};

const InvoicePreviewWrapper = ({ formData }: InvoicePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(containerWidth / 794, 1);
        setScale(newScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{ height: `${1123 * scale}px` }}
        className="overflow-hidden"
      >
        <div
          className="origin-top-left"
          style={{
            width: "794px",
            height: "1123px",
            transform: `scale(${scale})`,
          }}
        >
          <iframe
            srcDoc={useMemo(() => renderInvoiceHtml(formData), [formData])}
            title="Invoice Preview"
            className="bg-white border rounded-lg shadow w-full h-full"
            style={{ border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewWrapper;
