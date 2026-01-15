import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Star, Clock, IndianRupee, MapPin, Briefcase, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";

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
  availableSlots: { [date: string]: string[] };
}

// Generate mock slots for the next 7 days
const generateMockSlots = () => {
  const slots: { [date: string]: string[] } = {};
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const dateKey = format(date, "yyyy-MM-dd");
    
    // Random availability for each day
    const allSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
    const numSlots = Math.floor(Math.random() * 8) + 1;
    const shuffled = allSlots.sort(() => 0.5 - Math.random());
    slots[dateKey] = shuffled.slice(0, numSlots).sort();
  }
  
  return slots;
};

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
    availableSlots: generateMockSlots(),
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
    availableSlots: generateMockSlots(),
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
    availableSlots: generateMockSlots(),
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
    availableSlots: generateMockSlots(),
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
    availableSlots: generateMockSlots(),
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
    availableSlots: generateMockSlots(),
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
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Generate dates for the next 7 days
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

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

  const handleOpenDialog = (ca: CA) => {
    setSelectedCA(ca);
    setSelectedDateIndex(0);
    setSelectedSlot(null);
    setDialogOpen(true);
  };

  const getSlotsForDate = (ca: CA, date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return ca.availableSlots[dateKey] || [];
  };

  const categorizeSlots = (slots: string[]) => {
    const morning: string[] = [];
    const afternoon: string[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.split(":")[0]);
      if (hour < 12) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    });

    return { morning, afternoon };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDateLabel = (date: Date, index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";
    return format(date, "EEE, d MMM");
  };

  const handleBooking = () => {
    if (selectedCA && selectedSlot) {
      const selectedDate = dates[selectedDateIndex];
      console.log("Booking:", { ca: selectedCA.name, date: selectedDate, slot: selectedSlot });
      setDialogOpen(false);
    }
  };

  const currentSlots = selectedCA ? getSlotsForDate(selectedCA, dates[selectedDateIndex]) : [];
  const { morning, afternoon } = categorizeSlots(currentSlots);

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
                  <span>{getSlotsForDate(ca, new Date()).length} slots today</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <IndianRupee className="w-4 h-4" />
                  <span>{ca.hourlyRate}/hr</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => handleOpenDialog(ca)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CA Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          {selectedCA && (
            <>
              <DialogHeader className="pb-2">
                <div className="flex items-start gap-5">
                  <Avatar className="w-18 h-18">
                    <AvatarImage src={selectedCA.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {selectedCA.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedCA.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{selectedCA.rating}</span>
                      <span className="text-xs text-muted-foreground">({selectedCA.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {selectedCA.experience} years
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {selectedCA.location}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <IndianRupee className="w-4 h-4" />
                        {selectedCA.hourlyRate}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Bio */}
                <div>
                  <h4 className="text-sm font-medium mb-2">About</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCA.bio}</p>
                </div>

                {/* Specializations */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCA.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Selector */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Select a Slot</h4>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setSelectedDateIndex(Math.max(0, selectedDateIndex - 1))}
                      disabled={selectedDateIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex gap-1">
                        {dates.slice(selectedDateIndex, selectedDateIndex + 5).map((date, i) => {
                          const actualIndex = selectedDateIndex + i;
                          const slots = getSlotsForDate(selectedCA, date);
                          const isSelected = actualIndex === selectedDateIndex;

                          return (
                            <button
                              key={actualIndex}
                              onClick={() => {
                                setSelectedDateIndex(actualIndex);
                                setSelectedSlot(null);
                              }}
                              className={`flex-1 text-center py-2 px-1.5 rounded-md transition-colors ${
                                isSelected
                                  ? "border-b-2 border-primary bg-muted/50"
                                  : "hover:bg-muted/30"
                              }`}
                            >
                              <div className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                {getDateLabel(date, actualIndex)}
                              </div>
                              <div className={`text-[10px] mt-0.5 ${
                                slots.length > 0 ? "text-cyan-500" : "text-muted-foreground"
                              }`}>
                                {slots.length > 0 ? `${slots.length} Slots` : "No Slots"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setSelectedDateIndex(Math.min(dates.length - 3, selectedDateIndex + 1))}
                      disabled={selectedDateIndex >= dates.length - 3}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-5">
                  {morning.length > 0 && (
                    <div>
                      <h5 className="text-sm text-muted-foreground mb-3">
                        Morning <span className="text-xs">({morning.length} slots)</span>
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {morning.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSlot(slot)}
                            className="min-w-[100px]"
                          >
                            {formatTime(slot)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {afternoon.length > 0 && (
                    <div>
                      <h5 className="text-sm text-muted-foreground mb-3">
                        Afternoon <span className="text-xs">({afternoon.length} slots)</span>
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {afternoon.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSlot(slot)}
                            className="min-w-[100px]"
                          >
                            {formatTime(slot)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSlots.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No slots available for this date
                    </div>
                  )}
                </div>

                {/* Booking Summary */}
                {selectedSlot && (
                  <div className="rounded-lg bg-muted p-5 space-y-3">
                    <p className="text-sm font-medium">Booking Summary</p>
                    <div className="text-sm text-muted-foreground space-y-1.5">
                      <p>Date: {format(dates[selectedDateIndex], "EEEE, MMMM d, yyyy")}</p>
                      <p>Time: {formatTime(selectedSlot)}</p>
                      <p>Duration: 1 hour</p>
                      <p className="font-medium text-foreground pt-1">Total: ₹{selectedCA.hourlyRate}</p>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-2"
                  size="lg"
                  disabled={!selectedSlot}
                  onClick={handleBooking}
                >
                  Confirm Booking
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
