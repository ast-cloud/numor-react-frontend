import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Video, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  duration: number;
  type: "video" | "phone" | "chat";
  status: "upcoming" | "completed" | "cancelled";
  topic: string;
  notes?: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    clientName: "Rahul Sharma",
    clientEmail: "rahul@example.com",
    date: "2024-01-20",
    time: "10:00",
    duration: 30,
    type: "video",
    status: "upcoming",
    topic: "Tax planning for FY 2024-25",
  },
  {
    id: "2",
    clientName: "Priya Patel",
    clientEmail: "priya@example.com",
    date: "2024-01-20",
    time: "14:00",
    duration: 45,
    type: "phone",
    status: "upcoming",
    topic: "GST registration assistance",
  },
  {
    id: "3",
    clientName: "Amit Kumar",
    clientEmail: "amit@example.com",
    date: "2024-01-18",
    time: "11:00",
    duration: 30,
    type: "video",
    status: "completed",
    topic: "Business compliance review",
    notes: "Discussed quarterly compliance requirements. Follow-up scheduled for next month.",
  },
  {
    id: "4",
    clientName: "Sneha Reddy",
    clientEmail: "sneha@example.com",
    date: "2024-01-17",
    time: "15:00",
    duration: 60,
    type: "chat",
    status: "cancelled",
    topic: "Investment advisory",
  },
];

const CABookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const upcomingBookings = bookings.filter(b => b.status === "upcoming");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const cancelledBookings = bookings.filter(b => b.status === "cancelled");

  const getTypeIcon = (type: Booking["type"]) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "phone": return <Phone className="w-4 h-4" />;
      case "chat": return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Cancelled</Badge>;
    }
  };

  const handleCancel = () => {
    if (selectedBooking) {
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id ? { ...b, status: "cancelled" as const } : b
      ));
      toast({
        title: "Booking Cancelled",
        description: `The booking with ${selectedBooking.clientName} has been cancelled.`,
      });
      setShowCancelDialog(false);
      setCancelReason("");
      setSelectedBooking(null);
    }
  };

  const handleComplete = (booking: Booking) => {
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? { ...b, status: "completed" as const } : b
    ));
    toast({
      title: "Booking Completed",
      description: `The session with ${booking.clientName} has been marked as completed.`,
    });
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{booking.clientName}</h3>
              <p className="text-sm text-muted-foreground">{booking.clientEmail}</p>
              <p className="text-sm text-muted-foreground mt-1">{booking.topic}</p>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(booking.date).toLocaleDateString("en-IN", { 
              day: "numeric", 
              month: "short", 
              year: "numeric" 
            })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {booking.time} ({booking.duration} min)
          </div>
          <div className="flex items-center gap-1">
            {getTypeIcon(booking.type)}
            <span className="capitalize">{booking.type}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedBooking(booking);
              setShowDetailsDialog(true);
            }}
          >
            View Details
          </Button>
          {booking.status === "upcoming" && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="text-green-600 hover:bg-green-50"
                onClick={() => handleComplete(booking)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowCancelDialog(true);
                }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Helmet><title>Numor - Bookings</title></Helmet>
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage your client consultation appointments</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcomingBookings.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedBookings.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cancelledBookings.length}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No upcoming bookings
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No completed bookings
              </CardContent>
            </Card>
          ) : (
            completedBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4 mt-4">
          {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No cancelled bookings
              </CardContent>
            </Card>
          ) : (
            cancelledBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Full details of the consultation</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedBooking.clientName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.clientEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedBooking.date).toLocaleDateString("en-IN", { 
                    day: "numeric", 
                    month: "long", 
                    year: "numeric" 
                  })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedBooking.duration} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium flex items-center gap-1">
                    {getTypeIcon(selectedBooking.type)}
                    <span className="capitalize">{selectedBooking.type}</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Topic</p>
                <p className="font-medium">{selectedBooking.topic}</p>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking with {selectedBooking?.clientName}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for cancellation (optional)</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CABookings;
