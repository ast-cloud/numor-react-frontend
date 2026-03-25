// In-memory CA applications store
export type ApplicationStatus = "pending" | "approved" | "rejected" | "suspended" | "unverified";

export interface CAApplication {
  id: string;
  userEmail: string;
  userName: string;
  company: string;
  phone: string;
  qualification: string;
  membershipNumber: string;
  experience: string;
  specialization: string;
  firmName: string;
  bio: string;
  certificationDoc?: string;
  idProofDoc?: string;
  status: ApplicationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
  /** Whether this submission is an update after a previous approval */
  isUpdate: boolean;
  /** Whether this profile has ever been approved */
  hasBeenApproved: boolean;
}

interface CAApplicationsStore {
  applications: CAApplication[];
}

const store: CAApplicationsStore = {
  applications: [
    // Pending new profiles
    {
      id: "app-001",
      userEmail: "rahul.sharma@example.com",
      userName: "Rahul Sharma",
      company: "Sharma & Associates",
      phone: "+91 98765 43210",
      qualification: "Chartered Accountant (CA)",
      membershipNumber: "123456",
      experience: "8 years",
      specialization: "Tax Planning & GST",
      firmName: "Sharma & Associates",
      bio: "Experienced CA with expertise in tax planning, GST compliance, and business advisory services.",
      certificationDoc: "ca_certificate_rahul.pdf",
      idProofDoc: "aadhar_rahul.pdf",
      status: "pending",
      submittedAt: new Date("2024-01-10"),
      isUpdate: false,
      hasBeenApproved: false,
    },
    {
      id: "app-002",
      userEmail: "priya.patel@example.com",
      userName: "Priya Patel",
      company: "Patel Financial Services",
      phone: "+91 87654 32109",
      qualification: "Chartered Accountant (CA), CPA",
      membershipNumber: "234567",
      experience: "12 years",
      specialization: "Audit & Assurance",
      firmName: "Patel Financial Services",
      bio: "Senior CA specializing in statutory audits, internal audits, and financial due diligence.",
      certificationDoc: "ca_certificate_priya.pdf",
      idProofDoc: "passport_priya.pdf",
      status: "pending",
      submittedAt: new Date("2024-01-12"),
      isUpdate: false,
      hasBeenApproved: false,
    },
    // Pending update (previously approved, submitted updates)
    {
      id: "app-003",
      userEmail: "amit.verma@example.com",
      userName: "Amit Verma",
      company: "Verma Tax Consultants",
      phone: "+91 76543 21098",
      qualification: "Chartered Accountant (CA)",
      membershipNumber: "345678",
      experience: "5 years",
      specialization: "Startup Advisory",
      firmName: "Verma Tax Consultants",
      bio: "Young and dynamic CA focused on helping startups with incorporation, compliance, and funding documentation.",
      certificationDoc: "ca_certificate_amit.pdf",
      idProofDoc: "aadhar_amit.pdf",
      status: "pending",
      submittedAt: new Date("2024-01-14"),
      isUpdate: true,
      hasBeenApproved: true,
    },
    // Approved
    {
      id: "app-004",
      userEmail: "deepa.nair@example.com",
      userName: "Deepa Nair",
      company: "Nair & Co",
      phone: "+91 99887 76655",
      qualification: "Chartered Accountant (CA)",
      membershipNumber: "456789",
      experience: "10 years",
      specialization: "Corporate Tax",
      firmName: "Nair & Co",
      bio: "Corporate tax specialist with extensive experience in multinational compliance.",
      certificationDoc: "ca_certificate_deepa.pdf",
      idProofDoc: "aadhar_deepa.pdf",
      status: "approved",
      submittedAt: new Date("2024-01-05"),
      reviewedAt: new Date("2024-01-08"),
      isUpdate: false,
      hasBeenApproved: true,
    },
    // Rejected profile (never approved)
    {
      id: "app-005",
      userEmail: "sunil.kumar@example.com",
      userName: "Sunil Kumar",
      company: "Kumar Associates",
      phone: "+91 88776 65544",
      qualification: "CMA",
      membershipNumber: "567890",
      experience: "2 years",
      specialization: "Cost Accounting",
      firmName: "Kumar Associates",
      bio: "Cost management accountant looking to expand into CA advisory.",
      status: "rejected",
      submittedAt: new Date("2024-01-03"),
      reviewedAt: new Date("2024-01-06"),
      reviewNotes: "Insufficient qualification — CMA is not equivalent to CA.",
      isUpdate: false,
      hasBeenApproved: false,
    },
    // Rejected update (was approved, update rejected)
    {
      id: "app-006",
      userEmail: "meena.iyer@example.com",
      userName: "Meena Iyer",
      company: "Iyer Financial",
      phone: "+91 77665 54433",
      qualification: "Chartered Accountant (CA)",
      membershipNumber: "678901",
      experience: "7 years",
      specialization: "Forensic Accounting",
      firmName: "Iyer Financial",
      bio: "Forensic accounting expert. Update rejected due to unverifiable specialization claim.",
      status: "rejected",
      submittedAt: new Date("2024-01-09"),
      reviewedAt: new Date("2024-01-11"),
      reviewNotes: "Updated specialization claim could not be verified.",
      isUpdate: true,
      hasBeenApproved: true,
    },
    // Unverified (newly created, not yet submitted)
    {
      id: "app-007",
      userEmail: "karan.singh@example.com",
      userName: "Karan Singh",
      company: "Singh & Partners",
      phone: "+91 66554 43322",
      qualification: "Chartered Accountant (CA)",
      membershipNumber: "789012",
      experience: "3 years",
      specialization: "GST Filing",
      firmName: "Singh & Partners",
      bio: "New CA looking to join the platform.",
      status: "unverified",
      submittedAt: new Date("2024-01-15"),
      isUpdate: false,
      hasBeenApproved: false,
    },
  ],
};

let idCounter = 8;

export const submitCAApplication = (application: Omit<CAApplication, "id" | "status" | "submittedAt" | "isUpdate" | "hasBeenApproved">): CAApplication => {
  const newApplication: CAApplication = {
    ...application,
    id: `app-${String(idCounter++).padStart(3, "0")}`,
    status: "pending",
    submittedAt: new Date(),
    isUpdate: false,
    hasBeenApproved: false,
  };
  store.applications.push(newApplication);
  return newApplication;
};

export const getAllApplications = (): CAApplication[] => {
  return [...store.applications];
};

export const getPendingApplications = (): CAApplication[] => {
  return store.applications.filter((app) => app.status === "pending");
};

export const getApplicationById = (id: string): CAApplication | undefined => {
  return store.applications.find((app) => app.id === id);
};

export const approveApplication = (id: string, notes?: string): { success: boolean; error?: string } => {
  const app = store.applications.find((a) => a.id === id);
  if (!app) return { success: false, error: "Application not found" };
  app.status = "approved";
  app.reviewedAt = new Date();
  app.reviewNotes = notes;
  app.hasBeenApproved = true;
  return { success: true };
};

export const rejectApplication = (id: string, notes?: string): { success: boolean; error?: string } => {
  const app = store.applications.find((a) => a.id === id);
  if (!app) return { success: false, error: "Application not found" };
  app.status = "rejected";
  app.reviewedAt = new Date();
  app.reviewNotes = notes;
  return { success: true };
};

export const suspendApplication = (id: string, notes?: string): { success: boolean; error?: string } => {
  const app = store.applications.find((a) => a.id === id);
  if (!app) return { success: false, error: "Application not found" };
  app.status = "suspended";
  app.reviewedAt = new Date();
  app.reviewNotes = notes;
  return { success: true };
};

export const getApplicationsByStatus = (status: ApplicationStatus): CAApplication[] => {
  return store.applications.filter((app) => app.status === status);
};
