import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DayAvailability {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const CAAvailability = () => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    Monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    Tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    Wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    Thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    Friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    Saturday: { enabled: false, startTime: "09:00", endTime: "13:00" },
    Sunday: { enabled: false, startTime: "09:00", endTime: "13:00" },
  });

  const [consultationDuration, setConsultationDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("15");

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const updateTime = (day: string, field: "startTime" | "endTime", value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = () => {
    toast({
      title: "Availability Saved",
      description: "Your availability settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Availability</h1>
        <p className="text-muted-foreground mt-1">Set your available hours for client consultations</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>Configure your available days and hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {days.map((day) => (
              <div key={day} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3 w-32">
                  <Switch
                    checked={availability[day].enabled}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <Label className={availability[day].enabled ? "text-foreground" : "text-muted-foreground"}>
                    {day}
                  </Label>
                </div>
                
                {availability[day].enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={availability[day].startTime}
                      onValueChange={(value) => updateTime(day, "startTime", value)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">to</span>
                    <Select
                      value={availability[day].endTime}
                      onValueChange={(value) => updateTime(day, "endTime", value)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Unavailable</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Consultation Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session Settings
              </CardTitle>
              <CardDescription>Configure consultation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Consultation Duration</Label>
                <Select value={consultationDuration} onValueChange={setConsultationDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Buffer Between Sessions</Label>
                <Select value={bufferTime} onValueChange={setBufferTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No buffer</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Availability
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CAAvailability;
