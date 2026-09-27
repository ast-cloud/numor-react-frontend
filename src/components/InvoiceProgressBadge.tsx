import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  fetchInvoiceStatus,
  finalizeInvoice,
  resendInvoiceEmail,
  type InvoiceProgress,
} from "@/lib/api/invoices";

const POLL_MS = 2000;
// How long the success tick lingers.
const DONE_VISIBLE_MS = 2000;

interface Props {
  invoiceId: string;
  /** From the invoice list, so the first paint is correct. */
  pdfStatus?: string;
  emailStatus?: string;
  /** Fires when payment status changes (DRAFT -> UNPAID once issued). */
  onStatusChange?: (status: string) => void;
}

const isSettled = (p: { pdfStatus: string; emailStatus: string }) =>
  ["READY", "FAILED"].includes(p.pdfStatus) &&
  ["NOT_REQUESTED", "SENT", "FAILED"].includes(p.emailStatus);

/**
 * PDF and email progress for one invoice row. The dialog closes as soon as the
 * invoice is issued, so this is where the work is watched. Owns its polling and
 * stops once both lifecycles settle; a finished row never polls.
 */
export function InvoiceProgressBadge({
  invoiceId,
  pdfStatus = "NOT_STARTED",
  emailStatus = "NOT_REQUESTED",
  onStatusChange,
}: Props) {
  const [progress, setProgress] = useState<InvoiceProgress | null>(null);
  const [hidden, setHidden] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Kept in a ref so a status change cannot restart the interval mid-flight.
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  // Was this invoice already finished when the badge first mounted? If so there
  // is no progress to report and the tick stays hidden - otherwise every
  // completed invoice would flash "All done" on each page load. A row that
  // finishes while we are watching still shows it, because then this was false.
  // FAILED is excluded on purpose: that one needs its retry button on every load.
  const finishedBeforeMount = useRef(
    pdfStatus === "READY" && ["SENT", "NOT_REQUESTED"].includes(emailStatus)
  );

  const current = progress ?? { pdfStatus, emailStatus };
  const settled = isSettled(current);

  // A draft that was never issued has nothing to report.
  const idle = current.pdfStatus === "NOT_STARTED";

  useEffect(() => {
    if (idle || settled) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const next = await fetchInvoiceStatus(invoiceId);
        if (cancelled) return;

        setProgress(next);
        onStatusChangeRef.current?.(next.status);
      } catch {
        // Transient failures are fine - the next tick retries, and the sweeper
        // guarantees a terminal state regardless.
      }
    };

    poll();
    const timer = setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [invoiceId, idle, settled]);

  // Show the tick, then get out of the way.
  useEffect(() => {
    const finishedCleanly =
      current.pdfStatus === "READY" &&
      ["SENT", "NOT_REQUESTED"].includes(current.emailStatus);

    if (!finishedCleanly) return;

    const timer = setTimeout(() => setHidden(true), DONE_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [current.pdfStatus, current.emailStatus]);

  const retry = async (action: () => Promise<unknown>, failureTitle: string) => {
    setRetrying(true);
    try {
      await action();
      // Clear the snapshot so polling resumes from the server's view.
      setProgress(null);
      setHidden(false);
    } catch (err) {
      toast({
        title: failureTitle,
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRetrying(false);
    }
  };

  if (idle || hidden || finishedBeforeMount.current) return null;

  const stopRowClick = (e: React.MouseEvent) => e.stopPropagation();

  if (current.pdfStatus === "FAILED") {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={retrying}
        onClick={(e) => {
          stopRowClick(e);
          retry(() => finalizeInvoice(invoiceId), "Could not restart PDF generation");
        }}
        className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
      >
        <RotateCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
        Retry PDF generation
      </Button>
    );
  }

  if (current.pdfStatus === "READY" && current.emailStatus === "FAILED") {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={retrying}
        onClick={(e) => {
          stopRowClick(e);
          retry(() => resendInvoiceEmail(invoiceId), "Could not resend the email");
        }}
        title={progress?.emailError ?? undefined}
        className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
      >
        <RotateCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
        Retry sending email
      </Button>
    );
  }

  if (current.pdfStatus === "READY" && current.emailStatus === "PENDING") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Sharing with Client
      </span>
    );
  }

  if (current.pdfStatus === "READY") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-green-600" />
        All done
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      Generating PDF
    </span>
  );
}
