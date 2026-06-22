import { useMemo, useRef, useState, useLayoutEffect } from "react";
import { renderInvoiceHtml, type InvoiceFormData } from "@/lib/invoiceTemplateRenderer";

interface InvoicePreviewProps {
  formData: InvoiceFormData;
}

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

const InvoicePreviewWrapper = ({ formData }: InvoicePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  const srcDoc = useMemo(() => renderInvoiceHtml(formData), [formData]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(w / PAGE_WIDTH, 1));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-hidden" style={{ maxWidth: "100%" }}>
      <div
        style={{
          width: "100%",
          height: scale > 0 ? `${PAGE_HEIGHT * scale}px` : `${PAGE_HEIGHT}px`,
          overflow: "hidden",
          visibility: scale > 0 ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            width: `${PAGE_WIDTH}px`,
            height: `${PAGE_HEIGHT}px`,
            transform: `scale(${scale || 1})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            srcDoc={srcDoc}
            title="Invoice Preview"
            className="bg-white border rounded-lg shadow"
            style={{ border: "none", width: `${PAGE_WIDTH}px`, height: `${PAGE_HEIGHT}px`, display: "block" }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewWrapper;
