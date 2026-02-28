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
  clientId: string;
  customerId: string;
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
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerStreetAddress?: string;
  sellerCity?: string;
  sellerState?: string;
  sellerZipCode?: string;
  sellerCountry?: string;
  sellerTaxId?: string;
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
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    swift: string;
  };
  bankAddress?: string;
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

export async function updateInvoice(invoiceId: string, payload: Record<string, unknown>): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/updateInvoice`, {
    method: 'POST',
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

export async function updateInvoiceStatus(invoiceId: string, status: string): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/${invoiceId}/updateInvoice`, {
    method: 'POST',
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

export async function createInvoice(payload: Record<string, unknown>): Promise<InvoiceData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/invoices/createInvoice`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to create invoice');
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
