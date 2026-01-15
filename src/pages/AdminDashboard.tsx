import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { logoutUser, getCurrentUser, getAllUsers } from "@/lib/authStore";
import { getPendingApplications } from "@/lib/caApplicationsStore";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Users, FileText, Settings, Shield, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import UserManagementTable from "@/components/admin/UserManagementTable";
import CAApplicationsReview from "@/components/admin/CAApplicationsReview";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const currentUser = getCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const allUsers = getAllUsers();
  const regularUsers = allUsers.filter(u => u.roles.includes("regular_user") && !u.roles.includes("ca"));
  const caUsers = allUsers.filter(u => u.roles.includes("ca"));
  const pendingCAApplications = getPendingApplications();

  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.length}</div>
              <p className="text-xs text-muted-foreground">{allUsers.filter(u => !u.isDisabled).length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Regular Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regularUsers.length}</div>
              <p className="text-xs text-muted-foreground">{regularUsers.filter(u => !u.isDisabled).length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CA Professionals</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caUsers.length}</div>
              <p className="text-xs text-muted-foreground">{caUsers.filter(u => !u.isDisabled).length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">99.9%</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>View, manage, and control all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Users ({allUsers.length})</TabsTrigger>
                <TabsTrigger value="regular">Regular Users ({regularUsers.length})</TabsTrigger>
                <TabsTrigger value="ca">CA Professionals ({caUsers.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <UserManagementTable key={`all-${refreshKey}`} onRefresh={() => setRefreshKey(k => k + 1)} />
              </TabsContent>
              <TabsContent value="regular">
                <UserManagementTable key={`regular-${refreshKey}`} filterRole="regular_user" onRefresh={() => setRefreshKey(k => k + 1)} />
              </TabsContent>
              <TabsContent value="ca">
                <UserManagementTable key={`ca-${refreshKey}`} filterRole="ca" onRefresh={() => setRefreshKey(k => k + 1)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* CA Applications Review Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CA Applications
              {pendingCAApplications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600 rounded-full">
                  {pendingCAApplications.length} pending
                </span>
              )}
            </CardTitle>
            <CardDescription>Review and approve CA registration requests</CardDescription>
          </CardHeader>
          <CardContent>
            <CAApplicationsReview />
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                General Settings
              </Button>
              <Button variant="outline" className="gap-2">
                <Shield className="w-4 h-4" />
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
