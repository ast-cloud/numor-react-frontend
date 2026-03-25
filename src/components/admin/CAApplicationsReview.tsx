import { useState } from "react";
import {
  CAApplication,
  ApplicationStatus,
  getAllApplications,
  approveApplication,
  rejectApplication,
  suspendApplication,
} from "@/lib/caApplicationsStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  User,
  Building,
  Phone,
  Award,
  Briefcase,
  Download,
  Ban,
  UserPlus,
  Info,
} from "lucide-react";

const CAApplicationsReview = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<CAApplication[]>(getAllApplications());
  const [selectedApp, setSelectedApp] = useState<CAApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const refreshApplications = () => {
    setApplications(getAllApplications());
  };

  // Main category filters
  const pendingApps = applications.filter((a) => a.status === "pending");
  const pendingNewApps = pendingApps.filter((a) => !a.isUpdate);
  const pendingUpdateApps = pendingApps.filter((a) => a.isUpdate);

  const approvedApps = applications.filter((a) => a.status === "approved");

  const rejectedApps = applications.filter((a) => a.status === "rejected");
  const rejectedProfileApps = rejectedApps.filter((a) => !a.hasBeenApproved);
  const rejectedUpdateApps = rejectedApps.filter((a) => a.hasBeenApproved);

  const suspendedApps = applications.filter((a) => a.status === "suspended");
  const unverifiedApps = applications.filter((a) => a.status === "unverified");

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">Suspended</Badge>;
      case "unverified":
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20">Unverified</Badge>;
    }
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    const result = approveApplication(selectedApp.id, reviewNotes);
    if (result.success) {
      toast({ title: "Application Approved", description: `${selectedApp.userName}'s CA application has been approved.` });
      setApproveDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes("");
      refreshApplications();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleReject = () => {
    if (!selectedApp) return;
    const result = rejectApplication(selectedApp.id, reviewNotes);
    if (result.success) {
      toast({ title: "Application Rejected", description: `${selectedApp.userName}'s CA application has been rejected.` });
      setRejectDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes("");
      refreshApplications();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleSuspend = () => {
    if (!selectedApp) return;
    const result = suspendApplication(selectedApp.id, reviewNotes);
    if (result.success) {
      toast({ title: "Application Suspended", description: `${selectedApp.userName}'s CA application has been suspended.` });
      setSuspendDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes("");
      refreshApplications();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const openViewDialog = (app: CAApplication) => { setSelectedApp(app); setViewDialogOpen(true); };
  const openApproveDialog = (app: CAApplication) => { setSelectedApp(app); setReviewNotes(""); setApproveDialogOpen(true); };
  const openRejectDialog = (app: CAApplication) => { setSelectedApp(app); setReviewNotes(""); setRejectDialogOpen(true); };
  const openSuspendDialog = (app: CAApplication) => { setSelectedApp(app); setReviewNotes(""); setSuspendDialogOpen(true); };

  const ApplicationTable = ({ apps, showActions = true, status }: { apps: CAApplication[]; showActions?: boolean; status: ApplicationStatus }) => {
    if (apps.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No applications found.</div>;
    }

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
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{app.userName}</p>
                      <p className="text-sm text-muted-foreground">{app.userEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{app.qualification}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{app.experience}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {app.submittedAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(app)} title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {showActions && app.status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openApproveDialog(app)} title="Approve" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openRejectDialog(app)} title="Reject" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {app.status === "approved" && (
                      <Button variant="ghost" size="icon" onClick={() => openSuspendDialog(app)} title="Suspend" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const TabLabelWithTooltip = ({ label, tooltip, count }: { label: string; tooltip: string; count: number }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center gap-1.5">
            {label} ({count})
            <Info className="w-3 h-3 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs max-w-[200px]">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingApps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedApps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedApps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
            <Ban className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{suspendedApps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unverified</CardTitle>
            <UserPlus className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{unverifiedApps.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="pending-review" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="pending-review" className="gap-2">
            <Clock className="w-4 h-4" />
            <TabLabelWithTooltip label="Pending Review" tooltip="Profiles submitted for approval" count={pendingApps.length} />
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedApps.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            <TabLabelWithTooltip label="Rejected" tooltip="Applications that were rejected" count={rejectedApps.length} />
          </TabsTrigger>
          <TabsTrigger value="suspended" className="gap-2">
            <Ban className="w-4 h-4" />
            <TabLabelWithTooltip label="Suspended" tooltip="Suspended due to compliance violations" count={suspendedApps.length} />
          </TabsTrigger>
          <TabsTrigger value="unverified" className="gap-2">
            <UserPlus className="w-4 h-4" />
            <TabLabelWithTooltip label="New Unverified" tooltip="Newly created profiles that are yet to be submitted for first time approval" count={unverifiedApps.length} />
          </TabsTrigger>
        </TabsList>

        {/* Pending Review — with sub-tabs */}
        <TabsContent value="pending-review">
          <Tabs defaultValue="new-profiles">
            <TabsList className="mb-4">
              <TabsTrigger value="new-profiles">
                <TabLabelWithTooltip label="New Profiles" tooltip="Profiles submitted for approval for the first time after creation" count={pendingNewApps.length} />
              </TabsTrigger>
              <TabsTrigger value="updates">
                <TabLabelWithTooltip label="Updates" tooltip="CA added some updates after last approval" count={pendingUpdateApps.length} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="new-profiles">
              <ApplicationTable apps={pendingNewApps} showActions={true} />
            </TabsContent>
            <TabsContent value="updates">
              <ApplicationTable apps={pendingUpdateApps} showActions={true} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved">
          <ApplicationTable apps={approvedApps} showActions={true} />
        </TabsContent>

        {/* Rejected — with sub-tabs */}
        <TabsContent value="rejected">
          <Tabs defaultValue="rejected-profiles">
            <TabsList className="mb-4">
              <TabsTrigger value="rejected-profiles">
                <TabLabelWithTooltip label="Rejected Profiles" tooltip="Never been approved" count={rejectedProfileApps.length} />
              </TabsTrigger>
              <TabsTrigger value="rejected-updates">
                <TabLabelWithTooltip label="Rejected Updates" tooltip="Updates after last approval have been rejected" count={rejectedUpdateApps.length} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rejected-profiles">
              <ApplicationTable apps={rejectedProfileApps} showActions={false} />
            </TabsContent>
            <TabsContent value="rejected-updates">
              <ApplicationTable apps={rejectedUpdateApps} showActions={false} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Suspended */}
        <TabsContent value="suspended">
          <ApplicationTable apps={suspendedApps} showActions={false} />
        </TabsContent>

        {/* New Unverified — simplified table with basic info only */}
        <TabsContent value="unverified">
          {unverifiedApps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No applications found.</div>
          ) : (
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
                {unverifiedApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <p className="font-medium">{app.userName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.userEmail}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.phone}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.submittedAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the complete CA application</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedApp.userName}</h3>
                  <p className="text-muted-foreground">{selectedApp.userEmail}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(selectedApp.status)}
                    {selectedApp.isUpdate && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Update</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" /> Phone</div>
                  <p className="font-medium">{selectedApp.phone}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Building className="w-4 h-4" /> Firm Name</div>
                  <p className="font-medium">{selectedApp.firmName}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Award className="w-4 h-4" /> Qualification</div>
                  <p className="font-medium">{selectedApp.qualification}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="w-4 h-4" /> Membership Number</div>
                  <p className="font-medium">{selectedApp.membershipNumber}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="w-4 h-4" /> Experience</div>
                  <p className="font-medium">{selectedApp.experience}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Award className="w-4 h-4" /> Specialization</div>
                  <p className="font-medium">{selectedApp.specialization}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Professional Bio</Label>
                <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedApp.bio}</p>
              </div>

              <div className="space-y-3">
                <Label className="text-muted-foreground">Submitted Documents</Label>
                <div className="flex flex-wrap gap-3">
                  {selectedApp.certificationDoc && (
                    <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> CA Certificate</Button>
                  )}
                  {selectedApp.idProofDoc && (
                    <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> ID Proof</Button>
                  )}
                </div>
              </div>

              {selectedApp.reviewNotes && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Review Notes</Label>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedApp.reviewNotes}</p>
                  {selectedApp.reviewedAt && (
                    <p className="text-xs text-muted-foreground">Reviewed on {selectedApp.reviewedAt.toLocaleDateString()}</p>
                  )}
                </div>
              )}

              <div className="text-sm text-muted-foreground border-t pt-4">
                <p>Submitted: {selectedApp.submittedAt.toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedApp?.status === "pending" && (
              <>
                <Button variant="outline" onClick={() => { setViewDialogOpen(false); openRejectDialog(selectedApp); }} className="text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button onClick={() => { setViewDialogOpen(false); openApproveDialog(selectedApp); }} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              </>
            )}
            {selectedApp?.status === "approved" && (
              <Button variant="outline" onClick={() => { setViewDialogOpen(false); openSuspendDialog(selectedApp); }} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <Ban className="w-4 h-4 mr-2" /> Suspend
              </Button>
            )}
            {(selectedApp?.status === "rejected" || selectedApp?.status === "suspended" || selectedApp?.status === "unverified") && (
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
            <AlertDialogDescription>You are about to approve {selectedApp?.userName}'s CA application. They will be granted CA privileges on the platform.</AlertDialogDescription>
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
            <AlertDialogDescription>You are about to reject {selectedApp?.userName}'s CA application. Please provide a reason for rejection.</AlertDialogDescription>
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
            <AlertDialogDescription>You are about to suspend {selectedApp?.userName}'s CA privileges. Please provide a reason for suspension.</AlertDialogDescription>
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
