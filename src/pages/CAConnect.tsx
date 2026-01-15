import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Search, Star, Clock, IndianRupee, MapPin, Briefcase, CalendarDays } from "lucide-react";

interface CA {
  id: string;
  name: string;
  avatar?: string;
  specializations: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  bio: string;
  availableSlots: string[];
}

const mockCAs: CA[] = [
  {
    id: "1",
    name: "Priya Sharma",
    specializations: ["Tax Planning", "GST", "Audit"],
    experience: 12,
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 1500,
    location: "Mumbai",
    bio: "Experienced CA with expertise in corporate taxation and GST compliance. Former Big 4 professional.",
    availableSlots: ["10:00", "11:00", "14:00", "15:00", "16:00"],
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    specializations: ["Startup Advisory", "Funding", "Compliance"],
    experience: 8,
    rating: 4.8,
    reviewCount: 98,
    hourlyRate: 1200,
    location: "Bangalore",
    bio: "Specialized in helping startups with financial planning, fundraising, and regulatory compliance.",
    availableSlots: ["09:00", "10:00", "11:00", "15:00"],
  },
  {
    id: "3",
    name: "Anita Desai",
    specializations: ["Personal Tax", "Investment Advisory", "NRI Taxation"],
    experience: 15,
    rating: 4.95,
    reviewCount: 203,
    hourlyRate: 2000,
    location: "Delhi",
    bio: "Senior CA with deep expertise in personal finance, tax optimization, and NRI taxation matters.",
    availableSlots: ["10:00", "11:00", "12:00", "14:00"],
  },
  {
    id: "4",
    name: "Vikram Mehta",
    specializations: ["Corporate Tax", "Transfer Pricing", "International Tax"],
    experience: 10,
    rating: 4.7,
    reviewCount: 87,
    hourlyRate: 1800,
    location: "Pune",
    bio: "Expert in international taxation and transfer pricing with experience in multinational corporations.",
    availableSlots: ["09:00", "10:00", "14:00", "15:00", "16:00"],
  },
  {
    id: "5",
    name: "Sneha Patel",
    specializations: ["Bookkeeping", "GST", "Small Business"],
    experience: 5,
    rating: 4.6,
    reviewCount: 64,
    hourlyRate: 800,
    location: "Ahmedabad",
    bio: "Dedicated to helping small businesses and freelancers with their accounting and tax needs.",
    availableSlots: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
  },
  {
    id: "6",
    name: "Arjun Reddy",
    specializations: ["Audit", "Internal Controls", "Risk Advisory"],
    experience: 9,
    rating: 4.75,
    reviewCount: 112,
    hourlyRate: 1400,
    location: "Hyderabad",
    bio: "Certified internal auditor with extensive experience in risk management and compliance.",
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  },
];

const specializations = [
  "All Specializations",
  "Tax Planning",
  "GST",
  "Audit",
  "Startup Advisory",
  "Funding",
  "Compliance",
  "Personal Tax",
  "Investment Advisory",
  "NRI Taxation",
  "Corporate Tax",
  "Transfer Pricing",
  "Bookkeeping",
  "Small Business",
];

const CAConnect = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedCA, setSelectedCA] = useState<CA | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const filteredCAs = mockCAs
    .filter((ca) => {
      const matchesSearch =
        ca.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ca.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ca.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialization =
        selectedSpecialization === "All Specializations" ||
        ca.specializations.includes(selectedSpecialization);
      return matchesSearch && matchesSpecialization;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "experience") return b.experience - a.experience;
      if (sortBy === "price-low") return a.hourlyRate - b.hourlyRate;
      if (sortBy === "price-high") return b.hourlyRate - a.hourlyRate;
      return 0;
    });

  const handleBooking = () => {
    if (selectedCA && selectedDate && selectedSlot) {
      // Here you would integrate with your booking system
      console.log("Booking:", { ca: selectedCA.name, date: selectedDate, slot: selectedSlot });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">CA Connect</h1>
        <p className="text-muted-foreground mt-1">
          Find and book consultations with verified Chartered Accountants
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialization, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCAs.length} chartered accountant{filteredCAs.length !== 1 ? "s" : ""}
      </p>

      {/* CA Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCAs.map((ca) => (
          <Card key={ca.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={ca.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {ca.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{ca.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{ca.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({ca.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{ca.bio}</p>

              <div className="flex flex-wrap gap-1.5">
                {ca.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span>{ca.experience} yrs exp</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{ca.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{ca.availableSlots.length} slots today</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <IndianRupee className="w-4 h-4" />
                  <span>{ca.hourlyRate}/hr</span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" onClick={() => setSelectedCA(ca)}>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Book Consultation with {ca.name}</DialogTitle>
                    <DialogDescription>
                      Select a date and time slot for your consultation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="rounded-md border"
                      />
                    </div>

                    {selectedDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Available Time Slots</p>
                        <div className="flex flex-wrap gap-2">
                          {ca.availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedSlot === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDate && selectedSlot && (
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <p className="text-sm font-medium">Booking Summary</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Date: {selectedDate.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                          <p>Time: {selectedSlot}</p>
                          <p>Duration: 1 hour</p>
                          <p className="font-medium text-foreground">Total: ₹{ca.hourlyRate}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      disabled={!selectedDate || !selectedSlot}
                      onClick={handleBooking}
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCAs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No chartered accountants found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialization("All Specializations");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CAConnect;
