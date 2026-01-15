// In-memory CA applications store
export type ApplicationStatus = "pending" | "approved" | "rejected";

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
  certificationDoc?: string; // URL/filename placeholder
  idProofDoc?: string; // URL/filename placeholder
  status: ApplicationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

interface CAApplicationsStore {
  applications: CAApplication[];
}

const store: CAApplicationsStore = {
  applications: [
    // Sample pending applications for demo
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
      bio: "Experienced CA with expertise in tax planning, GST compliance, and business advisory services. Helped 100+ businesses optimize their tax structure.",
      certificationDoc: "ca_certificate_rahul.pdf",
      idProofDoc: "aadhar_rahul.pdf",
      status: "pending",
      submittedAt: new Date("2024-01-10"),
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
      bio: "Senior CA specializing in statutory audits, internal audits, and financial due diligence for mid-sized companies and startups.",
      certificationDoc: "ca_certificate_priya.pdf",
      idProofDoc: "passport_priya.pdf",
      status: "pending",
      submittedAt: new Date("2024-01-12"),
    },
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
      bio: "Young and dynamic CA focused on helping startups with incorporation, compliance, funding documentation, and financial planning.",
      certificationDoc: "ca_certificate_amit.pdf",
      idProofDoc: "aadhar_amit.pdf",
      status: "pending",
      submittedAt: new Date("2024-01-14"),
    },
  ],
};

let idCounter = 4;

export const submitCAApplication = (application: Omit<CAApplication, "id" | "status" | "submittedAt">): CAApplication => {
  const newApplication: CAApplication = {
    ...application,
    id: `app-${String(idCounter++).padStart(3, "0")}`,
    status: "pending",
    submittedAt: new Date(),
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
  if (!app) {
    return { success: false, error: "Application not found" };
  }
  app.status = "approved";
  app.reviewedAt = new Date();
  app.reviewNotes = notes;
  return { success: true };
};

export const rejectApplication = (id: string, notes?: string): { success: boolean; error?: string } => {
  const app = store.applications.find((a) => a.id === id);
  if (!app) {
    return { success: false, error: "Application not found" };
  }
  app.status = "rejected";
  app.reviewedAt = new Date();
  app.reviewNotes = notes;
  return { success: true };
};

export const getApplicationsByStatus = (status: ApplicationStatus): CAApplication[] => {
  return store.applications.filter((app) => app.status === status);
};
