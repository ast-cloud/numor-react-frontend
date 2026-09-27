import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, MailCheck, MailWarning, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { fetchInvoiceStatus, resendInvoiceEmail } from "@/lib/api/invoices";

const POLL_MS = 2000;

interface Props {
  invoiceId: string;
  emailStatus?: string;
  emailSentAt?: string | null;
  emailRequested?: boolean;
  emailError?: string | null;
  /** Seeds the local view - an email cannot be sent before the PDF exists. */
  pdfReady: boolean;
}

/**
 * Whether this invoice reached the client by email, shown under the invoice
 * number. A failed or never-attempted send offers a button, because otherwise
 * the only trace of it is a log line nobody reads.
 */
export function InvoiceEmailStatus({
  invoiceId,
  emailStatus = "NOT_REQUESTED",
  emailSentAt = null,
  emailRequested = false,
  emailError = null,
  pdfReady,
}: Props) {
  // pdfReady is tracked in state, not read from the prop on every render. The
  // prop is a snapshot of the invoice list taken when the row was clicked, so
  // opening this dialog while the PDF is still generating would pin it to false
  // forever - the poll below would update the email fields but never this, and
  // the component would stay hidden until a full page reload.
  const [state, setState] = useState({ emailStatus, emailSentAt, emailError, pdfReady });
  const [sending, setSending] = useState(false);

  // Re-sync when the dialog is opened on a different invoice.
  const idRef = useRef(invoiceId);
  useEffect(() => {
    if (idRef.current !== invoiceId) {
      idRef.current = invoiceId;
      setState({ emailStatus, emailSentAt, emailError, pdfReady });
    }
  }, [invoiceId, emailStatus, emailSentAt, emailError, pdfReady]);

  // Poll until both the PDF and any requested send have resolved.
  //
  // Two things made this miss the live update. Waiting only for PENDING never
  // started the poll, because right after issuing the worker has not claimed the
  // send yet and emailStatus is still NOT_REQUESTED - emailRequested is what
  // tells "no email wanted" apart from "not sent yet". And the PDF has to be
  // watched too, since this renders nothing until one exists.
  useEffect(() => {
    const awaitingPdf = !state.pdfReady;
    const awaitingSend =
      state.emailStatus === "PENDING" ||
      (emailRequested && state.emailStatus === "NOT_REQUESTED");

    if (!awaitingPdf && !awaitingSend) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const next = await fetchInvoiceStatus(invoiceId);
        if (cancelled) return;
        setState({
          emailStatus: next.emailStatus,
          emailSentAt: next.emailSentAt,
          emailError: next.emailError,
          pdfReady: next.pdfStatus === "READY",
        });

        // A PDF that failed will never produce an email, so stop watching.
        if (next.pdfStatus === "FAILED") cancelled = true;
      } catch {
        // Transient - the next tick retries, and the sweeper guarantees this
        // reaches a terminal state either way.
      }
    };

    const timer = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [invoiceId, state.pdfReady, state.emailStatus, emailRequested]);

  const send = async () => {
    setSending(true);
    try {
      await resendInvoiceEmail(invoiceId);
      // PENDING starts the poll above, which picks up the real outcome.
      setState((s) => ({ ...s, emailStatus: "PENDING", emailError: null }));
    } catch (err) {
      toast({
        title: "Could not send the email",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Nothing to report until there is a document to attach.
  if (!state.pdfReady) return null;

  if (state.emailStatus === "SENT") {
    const when = state.emailSentAt
      ? format(new Date(state.emailSentAt), "h:mm a d MMM yyyy").replace(/\b(AM|PM)\b/, (m) => m.toLowerCase())
      : null;

    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
        <MailCheck className="h-3.5 w-3.5 text-green-600" />
        {when ? `Shared with client on e-mail at ${when}` : "Shared with client on e-mail"}
      </p>
    );
  }

  if (state.emailStatus === "PENDING") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Sending email to client...
      </p>
    );
  }

  const failed = state.emailStatus === "FAILED";

  return (
    <p className="flex items-center gap-1.5 text-xs mt-1">
      {failed && <MailWarning className="h-3.5 w-3.5 text-destructive" />}
      <span className={failed ? "text-destructive" : "text-muted-foreground"} title={state.emailError ?? undefined}>
        {failed ? "Email sending failed" : "Not shared by email"}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={sending}
        onClick={send}
        className="h-6 gap-1 px-2 text-xs"
      >
        <RotateCw className={`h-3 w-3 ${sending ? "animate-spin" : ""}`} />
        {failed ? "Retry" : "Send email"}
      </Button>
    </p>
  );
}
