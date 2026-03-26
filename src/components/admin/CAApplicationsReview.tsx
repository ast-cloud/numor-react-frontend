import { useState, useEffect, useCallback } from "react";
import { fetchCAProfileCounts, fetchCAProfiles, type CAProfileTab } from "@/lib/api/admin";
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
  Award, Briefcase, Download, Ban, UserPlus, Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface CAProfile {
  id: string;
  status: string;
  firmName?: string;
  qualification?: string;
  membershipNumber?: string;
  experience?: string;
  specialization?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  submittedAt?: string;
  reviewNotes?: string;
  user?: { name: string; email: string; phone?: string };
  documents?: any[];
  pendingProfile?: any;
}

type TabStatusLabel = "pending" | "approved" | "rejected" | "suspended" | "unverified";

// ─── Hook: per-tab paginated data ────────────────────────────────────
function useTabProfiles(tab: CAProfileTab, active: boolean) {
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
  }, [active, load]);

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
            <TableHead>Qualification</TableHead>
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
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{p.qualification ?? "—"}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{p.experience ?? "—"}</span>
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
const TabProfileContent = ({ tab, status, active, showActions, onView, onApprove, onReject, onSuspend }: {
  tab: CAProfileTab; status: TabStatusLabel; active: boolean; showActions?: boolean;
  onView: (p: CAProfile) => void; onApprove?: (p: CAProfile) => void;
  onReject?: (p: CAProfile) => void; onSuspend?: (p: CAProfile) => void;
}) => {
  const { profiles, page, totalPages, loading, goToPage } = useTabProfiles(tab, active);

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
  const [mainTab, setMainTab] = useState("pendingReview");
  const [pendingSubTab, setPendingSubTab] = useState("underReview");
  const [rejectedSubTab, setRejectedSubTab] = useState("rejected");
  const [counts, setCounts] = useState({
    unverified: 0, underReview: 0, verified: 0, rejected: 0, suspended: 0,
    unverifiedUpdates: 0, updatesUnderReview: 0, updatesRejected: 0,
    pendingReview: 0, allRejected: 0, total: 0,
  });

  useEffect(() => {
    fetchCAProfileCounts().then(setCounts).catch(() => {});
  }, []);

  const openView = (p: CAProfile) => { setSelectedProfile(p); setViewDialogOpen(true); };
  const openApprove = (p: CAProfile) => { setSelectedProfile(p); setReviewNotes(""); setApproveDialogOpen(true); };
  const openReject = (p: CAProfile) => { setSelectedProfile(p); setReviewNotes(""); setRejectDialogOpen(true); };
  const openSuspend = (p: CAProfile) => { setSelectedProfile(p); setReviewNotes(""); setSuspendDialogOpen(true); };

  const handleApprove = () => {
    toast({ title: "Application Approved", description: `${selectedProfile?.user?.name}'s CA application has been approved.` });
    setApproveDialogOpen(false);
    setSelectedProfile(null);
    setReviewNotes("");
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
            Approved ({counts.verified})
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
              <TabProfileContent tab="underReview" status="pending" active={mainTab === "pendingReview" && pendingSubTab === "underReview"} showActions onView={openView} onApprove={openApprove} onReject={openReject} />
            </TabsContent>
            <TabsContent value="updatesUnderReview">
              <TabProfileContent tab="updatesUnderReview" status="pending" active={mainTab === "pendingReview" && pendingSubTab === "updatesUnderReview"} showActions onView={openView} onApprove={openApprove} onReject={openReject} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Approved */}
        <TabsContent value="verified">
          <TabProfileContent tab="verified" status="approved" active={mainTab === "verified"} showActions onView={openView} onSuspend={openSuspend} />
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
              <TabProfileContent tab="rejected" status="rejected" active={mainTab === "allRejected" && rejectedSubTab === "rejected"} showActions={false} onView={openView} />
            </TabsContent>
            <TabsContent value="updatesRejected">
              <TabProfileContent tab="updatesRejected" status="rejected" active={mainTab === "allRejected" && rejectedSubTab === "updatesRejected"} showActions={false} onView={openView} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Suspended */}
        <TabsContent value="suspended">
          <TabProfileContent tab="suspended" status="suspended" active={mainTab === "suspended"} showActions={false} onView={openView} />
        </TabsContent>

        {/* New Unverified */}
        <TabsContent value="unverified">
          <TabProfileContent tab="unverified" status="unverified" active={mainTab === "unverified"} onView={openView} />
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Building className="w-4 h-4" /> Firm Name</div>
                  <p className="font-medium">{selectedProfile.firmName ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Award className="w-4 h-4" /> Qualification</div>
                  <p className="font-medium">{selectedProfile.qualification ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="w-4 h-4" /> Membership Number</div>
                  <p className="font-medium">{selectedProfile.membershipNumber ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="w-4 h-4" /> Experience</div>
                  <p className="font-medium">{selectedProfile.experience ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Award className="w-4 h-4" /> Specialization</div>
                  <p className="font-medium">{selectedProfile.specialization ?? "—"}</p>
                </div>
              </div>

              {selectedProfile.bio && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Professional Bio</Label>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedProfile.bio}</p>
                </div>
              )}

              {selectedProfile.documents && selectedProfile.documents.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-muted-foreground">Submitted Documents</Label>
                  <div className="flex flex-wrap gap-3">
                    {selectedProfile.documents.map((doc: any) => (
                      <Button key={doc.id} variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> {doc.type || doc.description || "Document"}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.reviewNotes && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Review Notes</Label>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedProfile.reviewNotes}</p>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">Approve Application</AlertDialogAction>
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
    </>
  );
};

export default CAApplicationsReview;
