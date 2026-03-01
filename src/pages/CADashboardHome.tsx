import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCAProfile } from "@/hooks/use-ca-profile";
import { AlertCircle, ArrowRight, Calendar, Users, IndianRupee, Clock, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CADashboardHome = () => {
  const navigate = useNavigate();
  const { isProfileComplete, profileData } = useCAProfile();
  const showBanner = !profileData.isSubmitted;

  // Mock analytics data
  const analytics = {
    totalEarnings: 45000,
    thisMonthEarnings: 12500,
    totalClients: 28,
    upcomingBookings: 5,
    completedSessions: 42,
    averageRating: 4.8,
    hoursThisMonth: 18,
    pendingPayouts: 8500,
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Numor - CA Dashboard</title></Helmet>
      {/* Profile Completion Banner */}
      {showBanner && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Complete your profile to start connecting with clients</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isProfileComplete() 
                ? "Your profile is complete! Submit it for review to get verified and start accepting clients."
                : "Please fill in all your professional details, upload certifications, and ID proof to submit your profile for review."
              }
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => navigate("/ca/settings")}
            >
              {isProfileComplete() ? "Submit for Review" : "Complete Profile"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your practice.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+₹{analytics.thisMonthEarnings.toLocaleString()}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+3</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Bookings</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {analytics.averageRating}
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">From {analytics.completedSessions} sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hours This Month</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.hoursThisMonth} hrs</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${(analytics.hoursThisMonth / 40) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">45% of your monthly goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sessions</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+8</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payout</CardTitle>
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.pendingPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Will be processed on 1st</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/ca/bookings")}>
            <Calendar className="w-4 h-4 mr-2" />
            View Bookings
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/ca/availability")}>
            <Clock className="w-4 h-4 mr-2" />
            Manage Availability
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/ca/settings")}>
            <Users className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CADashboardHome;
