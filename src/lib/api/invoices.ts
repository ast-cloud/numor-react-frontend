import { config } from '@/lib/config';
import { getToken } from './authToken';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  totalPrice: string;
  createdAt: string;
}

export interface InvoiceData {
  id: string;
  orgId: string;
  clientId: string | null;
  createdByUserId: string;
  invoiceNumber: string;
  invoiceType: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  subtotal: string;
  discount: string;
  taxAmount: string;
  shippingCost: string;
  totalAmount: string;
  paidAmount: string;
  balanceDue: string;
  status: string;
  category: string;
  pdfKey: string | null;
  pdfStatus: string;
  emailStatus?: string;
  emailRequested?: boolean;
  emailSentAt?: string | null;
  emailError?: string | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerStreetAddress?: string;
  sellerCity?: string;
  sellerState?: string;
  sellerZipCode?: string;
  sellerCountry?: string;
  sellerTaxId?: string;
  // The billed party as stored on the invoice itself. Survives the client being
  // edited or deleted, unlike clientId and the client relation.
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientStreetAddress?: string | null;
  clientCity?: string | null;
  clientState?: string | null;
  clientZipCode?: string | null;
  clientCountry?: string | null;
  clientTaxId?: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: (InvoiceItem & { unitType?: string })[];
  // Extended fields from detail endpoint
  taxType?: string;
  reverseCharge?: boolean;
  sacCode?: string;
  taxSummary?: Record<string, { rate: number; amount: number }>;
  seller?: {
    name: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    taxId: string;
  };
  client?: {
    name: string;
    email: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bankDetails?: {
    // Which saved payment set these came from, copied at issue time. Absent on
    // invoices whose details were typed by hand.
    nickname?: string | null;
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    swift: string;
  };
  bankAddress?: string;
  // definitionId is not always sent; the dialog resolves it by name when absent.
  customFields?: { definitionId?: string; name: string; value: string }[];
}

export async function fetchInvoices(): Promise<InvoiceData[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch invoices');
  const json = await res.json();
  return json.data ?? [];
}

export async function fetchInvoice(invoiceId: string): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch invoice');
  const json = await res.json();
  return json.data ?? json;
}

/** Saves edits to an existing invoice. Cannot change status - see the two below. */
export async function updateInvoice(invoiceId: string, payload: Record<string, unknown>): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to update invoice');
  const json = await res.json();
  return json.data;
}

/** Marks an invoice PAID / UNPAID / OVERDUE / DRAFT. */
export async function updateInvoiceStatus(invoiceId: string, status: string): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/payment-status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error('Failed to update invoice status');
  const json = await res.json();
  return json.data;
}

/**
 * Creates a new invoice. Always a draft - issuing it is a separate call to
 * finalizeInvoice(), so the id is in hand before any PDF work starts.
 *
 * Pass the same idempotencyKey on every retry of one attempt. It is what lets a
 * retry resolve to the invoice already created when the first response never
 * arrived, instead of creating a second one.
 */
export async function createInvoice(
  payload: Record<string, unknown>,
  options?: { idempotencyKey?: string },
): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, idempotencyKey: options?.idempotencyKey }),
  });

  if (!res.ok) throw new Error('Failed to create invoice');
  const json = await res.json();
  return json.data;
}

/**
 * Copies an invoice's contents into a new draft. Pass the same idempotencyKey on
 * a retry, or a lost response would leave two copies behind.
 */
export async function cloneInvoiceAsDraft(
  invoiceId: string,
  idempotencyKey: string,
): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/clone`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idempotencyKey }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || 'Failed to clone the invoice');
  }
  const json = await res.json();
  return json.data;
}

export interface InvoiceProgress {
  id: string;
  status: string;
  pdfStatus: 'NOT_STARTED' | 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED';
  emailStatus: 'NOT_REQUESTED' | 'PENDING' | 'SENT' | 'FAILED';
  emailError: string | null;
  emailSentAt: string | null;
  /** Whether an email was asked for. NOT_REQUESTED is only terminal when this is false. */
  emailRequested: boolean;
  pdfUrl: string | null;
  /** Both lifecycles have finished - stop polling this row. */
  settled: boolean;
}

/** Lightweight poll for the row progress badge. */
export async function fetchInvoiceStatus(invoiceId: string): Promise<InvoiceProgress> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/status`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch invoice status');
  const json = await res.json();
  return json.data;
}

/** Re-sends the invoice email after a failed send. */
export async function resendInvoiceEmail(invoiceId: string): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/resend-email`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || 'Failed to resend the invoice email');
  }
  const json = await res.json();
  return json.data;
}

/**
 * Issues an existing draft and ensures a PDF job is running. Idempotent, so it
 * doubles as the retry after PDF generation fails.
 */
export async function finalizeInvoice(
  invoiceId: string,
  options?: { sendEmail?: boolean },
): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const query = options?.sendEmail ? '?sendEmail=true' : '';
  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/finalize${query}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to finalize invoice');
  const json = await res.json();
  return json.data;
}

export interface PdfStatusResponse {
  success: boolean;
  status: string;
  message?: string;
  url?: string;
}

export async function deleteInvoice(invoiceId: string): Promise<{ success: boolean; data?: { success: boolean; message: string; id: string } }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to delete invoice');
  return res.json();
}

export async function fetchInvoicePdfStatus(invoiceId: string): Promise<PdfStatusResponse> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/pdf`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch PDF status');
  return res.json();
}
