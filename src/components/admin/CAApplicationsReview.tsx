import { useState, useEffect, useCallback } from "react";
import { fetchCAProfileCounts, fetchCAProfiles, approveCAProfileApi, approveCAProfileUpdateApi, type CAProfileTab } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Eye, CheckCircle, XCircle, FileText, Clock, User, Building, Phone,
  Award, Briefcase, Download, Ban, UserPlus, Info, GraduationCap, ShieldCheck, Loader2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface CAProfile {
  id: string;
  status: string;
  registrationNo?: string;
  experienceYears?: number;
  hourlyFee?: string;
  bio?: string;
  languages?: string[];
  specializations?: string[];
  type?: string;
  calendlyUrl?: string;
  calComUrl?: string;
  zoomEmail?: string;
  whatsappNumber?: string;
  comment?: string;
  ratingAvg?: string;
  ratingCount?: number;
  city?: string;
  country?: string;
  state?: string;
  streetAddress?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  submittedAt?: string;
  user?: { name: string; email: string; phone?: string };
  documents?: any[];
  pendingProfile?: any;
}

type TabStatusLabel = "pending" | "approved" | "rejected" | "suspended" | "unverified";

// ─── Hook: per-tab paginated data ────────────────────────────────────
function useTabProfiles(tab: CAProfileTab, active: boolean, refreshKey: number) {
  const [profiles, setProfiles] = useState<CAProfile[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback((p: number) => {
    setLoading(true);
    fetchCAProfiles(tab, p, 20)
      .then((res) => {
        setProfiles(res.profiles);
        setTotalPages(res.totalPages);
        setPage(res.page);
      })
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    if (active) load(1);
  }, [active, load, refreshKey]);

  return { profiles, page, totalPages, loading, goToPage: load };
}

// ─── Helpers ─────────────────────────────────────────────────────────
function getDisplayDate(profile: CAProfile, status: TabStatusLabel): string {
  const dateStr =
    (status === "approved" || status === "rejected") && profile.reviewedAt
      ? profile.reviewedAt
      : profile.submittedAt || profile.updatedAt || profile.createdAt;
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function getStatusBadge(status: TabStatusLabel) {
  const map: Record<TabStatusLabel, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    approved: { label: "Approved", cls: "bg-green-500/10 text-green-600 border-green-500/20" },
    rejected: { label: "Rejected", cls: "bg-red-500/10 text-red-600 border-red-500/20" },
    suspended: { label: "Suspended", cls: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    unverified: { label: "Unverified", cls: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  };
  const m = map[status];
  return <Badge variant="outline" className={m.cls}>{m.label}</Badge>;
}

// ─── Sub-components ──────────────────────────────────────────────────
const TabLabelWithTooltip = ({ label, tooltip, count }: { label: string; tooltip: string; count: number }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center gap-1.5">
          {label} ({count})
          <Info className="w-3 h-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="z-[9999] max-w-[300px] break-words whitespace-normal">
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

const PaginationControls = ({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => page > 1 && onPageChange(page - 1)}
            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => onPageChange(p)} className="cursor-pointer">
                {p}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            onClick={() => page < totalPages && onPageChange(page + 1)}
            className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

// ─── Profile Table ───────────────────────────────────────────────────
interface ProfileTableProps {
  profiles: CAProfile[];
  loading: boolean;
  status: TabStatusLabel;
  showActions?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onView: (p: CAProfile) => void;
  onApprove?: (p: CAProfile) => void;
  onReject?: (p: CAProfile) => void;
  onSuspend?: (p: CAProfile) => void;
}

const ProfileTable = ({
  profiles, loading, status, showActions = true,
  page, totalPages, onPageChange, onView, onApprove, onReject, onSuspend,
}: ProfileTableProps) => {
  if (loading) return <TableSkeleton />;
  if (profiles.length === 0)
    return <div className="text-center py-8 text-muted-foreground">No profiles found.</div>;

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Status: {getStatusBadge(status)}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>{status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Submitted"}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{p.user?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{p.user?.email ?? "—"}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{p.experienceYears != null ? `${p.experienceYears} yrs` : "—"}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getDisplayDate(p, status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(p)} title="View Details">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {showActions && (status === "pending") && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onApprove?.(p)} title="Approve" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onReject?.(p)} title="Reject" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {status === "approved" && (
                    <Button variant="ghost" size="icon" onClick={() => onSuspend?.(p)} title="Suspend" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                      <Ban className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

// ─── Unverified Table (basic info only) ──────────────────────────────
const UnverifiedTable = ({ profiles, loading, page, totalPages, onPageChange }: {
  profiles: CAProfile[]; loading: boolean; page: number; totalPages: number; onPageChange: (p: number) => void;
}) => {
  if (loading) return <TableSkeleton />;
  if (profiles.length === 0)
    return <div className="text-center py-8 text-muted-foreground">No profiles found.</div>;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-medium">{p.user?.name ?? "—"}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{p.user?.email ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{p.user?.phone ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("en-GB")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

// ─── Tab Content Wrapper ─────────────────────────────────────────────
const TabProfileContent = ({ tab, status, active, showActions, refreshKey = 0, onView, onApprove, onReject, onSuspend }: {
  tab: CAProfileTab; status: TabStatusLabel; active: boolean; showActions?: boolean; refreshKey?: number;
  onView: (p: CAProfile) => void; onApprove?: (p: CAProfile) => void;
  onReject?: (p: CAProfile) => void; onSuspend?: (p: CAProfile) => void;
}) => {
  const { profiles, page, totalPages, loading, goToPage } = useTabProfiles(tab, active, refreshKey);

  if (tab === "unverified") {
    return <UnverifiedTable profiles={profiles} loading={loading} page={page} totalPages={totalPages} onPageChange={goToPage} />;
  }

  return (
    <ProfileTable
      profiles={profiles} loading={loading} status={status} showActions={showActions}
      page={page} totalPages={totalPages} onPageChange={goToPage}
      onView={onView} onApprove={onApprove} onReject={onReject} onSuspend={onSuspend}
    />
  );
};

// ─── Main Component ──────────────────────────────────────────────────
const CAApplicationsReview = () => {
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<CAProfile | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [previewDoc, setPreviewDoc] = useState<{ url: string; description: string; mimeType?: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mainTab, setMainTab] = useState("pendingReview");
  const [pendingSubTab, setPendingSubTab] = useState("underReview");
  const [rejectedSubTab, setRejectedSubTab] = useState("rejected");
  const [refreshKey, setRefreshKey] = useState(0);
  const [counts, setCounts] = useState({
    unverified: 0, underReview: 0, verified: 0, rejected: 0, suspended: 0,
    unverifiedUpdates: 0, updatesUnderReview: 0, updatesRejected: 0,
    pendingReview: 0, allRejected: 0, total: 0,
  });

  const refreshData = useCallback(() => {
    setRefreshKey(k => k + 1);
    fetchCAProfileCounts().then(setCounts).catch(() => {});
  }, []);

  useEffect(() => {
    fetchCAProfileCounts().then(setCounts).catch(() => {});
  }, []);

  const openView = (p: CAProfile) => { setSelectedProfile(p); setViewDialogOpen(true); };
  const openApprove = (p: CAProfile) => { setSelectedProfile(p); setReviewNotes(""); setApproveDialogOpen(true); };
  const openReject = (p: CAProfile) => { setSelectedProfile(p); setReviewNotes(""); setRejectDialogOpen(true); };
  const openSuspend = (p: CAProfile) => { setSelectedProfile(p); setReviewNotes(""); setSuspendDialogOpen(true); };

  const handleApprove = async () => {
    if (!selectedProfile) return;
    setActionLoading(true);
    try {
      const isUpdate = pendingSubTab === "updatesUnderReview";
      if (isUpdate) {
        await approveCAProfileUpdateApi(selectedProfile.id);
      } else {
        await approveCAProfileApi(selectedProfile.id);
      }
      toast({ title: isUpdate ? "Update Approved" : "Application Approved", description: `${selectedProfile.user?.name}'s CA ${isUpdate ? "profile update" : "application"} has been approved.` });
      refreshData();
    } catch {
      toast({ title: "Error", description: "Failed to approve. Please try again.", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setApproveDialogOpen(false);
      setSelectedProfile(null);
      setReviewNotes("");
    }
  };

  const handleReject = () => {
    toast({ title: "Application Rejected", description: `${selectedProfile?.user?.name}'s CA application has been rejected.` });
    setRejectDialogOpen(false);
    setSelectedProfile(null);
    setReviewNotes("");
  };

  const handleSuspend = () => {
    toast({ title: "Application Suspended", description: `${selectedProfile?.user?.name}'s CA application has been suspended.` });
    setSuspendDialogOpen(false);
    setSelectedProfile(null);
    setReviewNotes("");
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{counts.pendingReview}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{counts.verified}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{counts.allRejected}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <Ban className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{counts.suspended}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unverified</CardTitle>
            <UserPlus className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-slate-600">{counts.unverified}</div></CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="pendingReview" className="gap-2">
            <Clock className="w-4 h-4" />
            <TabLabelWithTooltip label="Pending Review" tooltip="Profiles submitted for approval" count={counts.pendingReview} />
          </TabsTrigger>
          <TabsTrigger value="verified" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({counts.verified + counts.unverifiedUpdates})
          </TabsTrigger>
          <TabsTrigger value="allRejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            <TabLabelWithTooltip label="Rejected" tooltip="Applications that were rejected" count={counts.allRejected} />
          </TabsTrigger>
          <TabsTrigger value="suspended" className="gap-2">
            <Ban className="w-4 h-4" />
            <TabLabelWithTooltip label="Suspended" tooltip="Suspended due to compliance violations" count={counts.suspended} />
          </TabsTrigger>
          <TabsTrigger value="unverified" className="gap-2">
            <UserPlus className="w-4 h-4" />
            <TabLabelWithTooltip label="New Unverified" tooltip="Newly created profiles that are yet to be submitted for first time approval" count={counts.unverified} />
          </TabsTrigger>
        </TabsList>

        {/* Pending Review — sub-tabs */}
        <TabsContent value="pendingReview">
          <Tabs value={pendingSubTab} onValueChange={setPendingSubTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="underReview">
                <TabLabelWithTooltip label="New Profiles" tooltip="Profiles submitted for approval for the first time after creation" count={counts.underReview} />
              </TabsTrigger>
              <TabsTrigger value="updatesUnderReview">
                <TabLabelWithTooltip label="Updates" tooltip="CA added some updates after last approval" count={counts.updatesUnderReview} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="underReview">
              <TabProfileContent tab="underReview" status="pending" active={mainTab === "pendingReview" && pendingSubTab === "underReview"} showActions refreshKey={refreshKey} onView={openView} onApprove={openApprove} onReject={openReject} />
            </TabsContent>
            <TabsContent value="updatesUnderReview">
              <TabProfileContent tab="updatesUnderReview" status="pending" active={mainTab === "pendingReview" && pendingSubTab === "updatesUnderReview"} showActions refreshKey={refreshKey} onView={openView} onApprove={openApprove} onReject={openReject} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Approved — sub-tabs */}
        <TabsContent value="verified">
          <Tabs defaultValue="verified">
            <TabsList className="mb-4">
              <TabsTrigger value="verified">
                <TabLabelWithTooltip label="Approved Profiles" tooltip="Profiles that have been approved" count={counts.verified} />
              </TabsTrigger>
              <TabsTrigger value="unverifiedUpdates">
                <TabLabelWithTooltip label="Unverified Updates" tooltip="Approved profiles with unsaved/unsubmitted updates" count={counts.unverifiedUpdates} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="verified">
              <TabProfileContent tab="verified" status="approved" active={mainTab === "verified"} showActions refreshKey={refreshKey} onView={openView} onSuspend={openSuspend} />
            </TabsContent>
            <TabsContent value="unverifiedUpdates">
              <TabProfileContent tab="unverifiedUpdates" status="approved" active={mainTab === "verified"} refreshKey={refreshKey} onView={openView} onSuspend={openSuspend} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Rejected — sub-tabs */}
        <TabsContent value="allRejected">
          <Tabs value={rejectedSubTab} onValueChange={setRejectedSubTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="rejected">
                <TabLabelWithTooltip label="Rejected Profiles" tooltip="Never been approved" count={counts.rejected} />
              </TabsTrigger>
              <TabsTrigger value="updatesRejected">
                <TabLabelWithTooltip label="Rejected Updates" tooltip="Updates after last approval have been rejected" count={counts.updatesRejected} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rejected">
              <TabProfileContent tab="rejected" status="rejected" active={mainTab === "allRejected" && rejectedSubTab === "rejected"} showActions={false} refreshKey={refreshKey} onView={openView} />
            </TabsContent>
            <TabsContent value="updatesRejected">
              <TabProfileContent tab="updatesRejected" status="rejected" active={mainTab === "allRejected" && rejectedSubTab === "updatesRejected"} showActions={false} refreshKey={refreshKey} onView={openView} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Suspended */}
        <TabsContent value="suspended">
          <TabProfileContent tab="suspended" status="suspended" active={mainTab === "suspended"} showActions={false} refreshKey={refreshKey} onView={openView} />
        </TabsContent>

        {/* New Unverified */}
        <TabsContent value="unverified">
          <TabProfileContent tab="unverified" status="unverified" active={mainTab === "unverified"} refreshKey={refreshKey} onView={openView} />
        </TabsContent>
      </Tabs>

      {/* View Profile Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
            <DialogDescription>Review the complete CA profile</DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedProfile.user?.name}</h3>
                  <p className="text-muted-foreground">{selectedProfile.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" /> Phone</div>
                  <p className="font-medium">{selectedProfile.user?.phone ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="w-4 h-4" /> Registration No</div>
                  <p className="font-medium">{selectedProfile.registrationNo ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="w-4 h-4" /> Experience</div>
                  <p className="font-medium">{selectedProfile.experienceYears != null ? `${selectedProfile.experienceYears} years` : "—"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Award className="w-4 h-4" /> Specializations</div>
                  <p className="font-medium">{selectedProfile.specializations?.join(", ") || "—"}</p>
                </div>
              </div>

              {selectedProfile.bio && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Professional Bio</Label>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedProfile.bio}</p>
                </div>
              )}

              {(() => {
                const docs = selectedProfile.documents || [];
                const certs = docs.filter((d: any) => d.type === "CERTIFICATION");
                const idProofs = docs.filter((d: any) => d.type === "ID_PROOF");

                const renderDocList = (title: string, Icon: React.ElementType, list: any[]) => {
                  if (list.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <Label className="text-sm font-medium">{title}</Label>
                      </div>
                      <div className="space-y-2">
                        {list.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={() => (doc.signedUrl || doc.url) && setPreviewDoc({ url: doc.signedUrl || doc.url, description: doc.description || doc.type, mimeType: doc.mimeType })}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-background rounded shrink-0">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{doc.description || doc.type || "Document"}</p>
                                {doc.createdAt && (
                                  <p className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString("en-GB")}</p>
                                )}
                              </div>
                              <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="space-y-4">
                    {renderDocList("Certifications", GraduationCap, certs)}
                    {renderDocList("ID Proofs", ShieldCheck, idProofs)}
                    {certs.length === 0 && idProofs.length === 0 && (
                      <p className="text-sm text-muted-foreground">No documents submitted.</p>
                    )}
                  </div>
                );
              })()}

              {selectedProfile.comment && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Review Notes</Label>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedProfile.comment}</p>
                  {selectedProfile.reviewedAt && (
                    <p className="text-xs text-muted-foreground">Reviewed on {new Date(selectedProfile.reviewedAt).toLocaleDateString("en-GB")}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedProfile?.status === "UNDER_REVIEW" && (
              <>
                <Button variant="outline" onClick={() => { setViewDialogOpen(false); openReject(selectedProfile); }} className="text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button onClick={() => { setViewDialogOpen(false); openApprove(selectedProfile); }} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              </>
            )}
            {selectedProfile?.status === "APPROVED" && (
              <Button variant="outline" onClick={() => { setViewDialogOpen(false); openSuspend(selectedProfile); }} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <Ban className="w-4 h-4 mr-2" /> Suspend
              </Button>
            )}
            {(selectedProfile?.status === "REJECTED" || selectedProfile?.status === "SUSPENDED" || selectedProfile?.status === "PENDING") && (
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /> Approve Application</AlertDialogTitle>
            <AlertDialogDescription>You are about to approve {selectedProfile?.user?.name}'s CA application.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="approve-notes">Notes (optional)</Label>
            <Textarea id="approve-notes" placeholder="Add any notes about this approval..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><XCircle className="w-5 h-5" /> Reject Application</AlertDialogTitle>
            <AlertDialogDescription>You are about to reject {selectedProfile?.user?.name}'s CA application.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reject-notes">Reason for Rejection</Label>
            <Textarea id="reject-notes" placeholder="Explain why this application is being rejected..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Reject Application</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600"><Ban className="w-5 h-5" /> Suspend Application</AlertDialogTitle>
            <AlertDialogDescription>You are about to suspend {selectedProfile?.user?.name}'s CA privileges.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="suspend-notes">Reason for Suspension</Label>
            <Textarea id="suspend-notes" placeholder="Explain why this application is being suspended..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} className="bg-orange-600 text-white hover:bg-orange-700">Suspend Application</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) { setPreviewDoc(null); setPreviewLoading(true); } }}>
        <DialogContent className="max-w-3xl w-full max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.description || "Document"}</DialogTitle>
            <DialogDescription>Document preview</DialogDescription>
          </DialogHeader>
          <div className="relative flex items-center justify-center overflow-hidden max-h-[65vh]" style={{ minHeight: 200 }}>
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {(() => {
              const url = previewDoc?.url?.replace(/[&?]download=?[^&]*/gi, '') || '';
              if (previewDoc?.mimeType?.startsWith("image/")) {
                return (
                  <img
                    src={url}
                    alt={previewDoc.description}
                    className="max-w-full max-h-[60vh] object-contain rounded"
                    onLoad={() => setPreviewLoading(false)}
                    onError={() => setPreviewLoading(false)}
                  />
                );
              } else if (previewDoc?.mimeType === "application/pdf") {
                return (
                  <iframe
                    src={url}
                    title={previewDoc.description}
                    className="w-full h-[60vh] rounded border-0"
                    onLoad={() => setPreviewLoading(false)}
                  />
                );
              }
              return <p className="text-sm text-muted-foreground py-8">Preview not available for this file type.</p>;
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CAApplicationsReview;
