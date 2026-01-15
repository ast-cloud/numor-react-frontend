import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const CAAvailability = () => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    Monday: { enabled: true, slots: [{ id: generateId(), startTime: "09:00", endTime: "12:00" }, { id: generateId(), startTime: "13:00", endTime: "17:00" }] },
    Tuesday: { enabled: true, slots: [{ id: generateId(), startTime: "09:00", endTime: "12:00" }, { id: generateId(), startTime: "13:00", endTime: "17:00" }] },
    Wednesday: { enabled: true, slots: [{ id: generateId(), startTime: "09:00", endTime: "12:00" }, { id: generateId(), startTime: "13:00", endTime: "17:00" }] },
    Thursday: { enabled: true, slots: [{ id: generateId(), startTime: "09:00", endTime: "12:00" }, { id: generateId(), startTime: "13:00", endTime: "17:00" }] },
    Friday: { enabled: true, slots: [{ id: generateId(), startTime: "09:00", endTime: "12:00" }, { id: generateId(), startTime: "13:00", endTime: "17:00" }] },
    Saturday: { enabled: false, slots: [{ id: generateId(), startTime: "10:00", endTime: "13:00" }] },
    Sunday: { enabled: false, slots: [{ id: generateId(), startTime: "10:00", endTime: "13:00" }] },
  });

  const [consultationDuration, setConsultationDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("15");

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const addTimeSlot = (day: string) => {
    const lastSlot = availability[day].slots[availability[day].slots.length - 1];
    const newStartTime = lastSlot ? lastSlot.endTime : "09:00";
    const startIndex = timeSlots.indexOf(newStartTime);
    const newEndTime = timeSlots[Math.min(startIndex + 2, timeSlots.length - 1)] || "17:00";
    
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { id: generateId(), startTime: newStartTime, endTime: newEndTime }]
      }
    }));
  };

  const removeTimeSlot = (day: string, slotId: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const updateSlotTime = (day: string, slotId: string, field: "startTime" | "endTime", value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
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
            <CardDescription>Configure your available days and time slots. Add multiple time slots per day for breaks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {days.map((day) => (
              <div key={day} className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={availability[day].enabled}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <Label className={`font-medium ${availability[day].enabled ? "text-foreground" : "text-muted-foreground"}`}>
                      {day}
                    </Label>
                  </div>
                  {availability[day].enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </Button>
                  )}
                </div>
                
                {availability[day].enabled ? (
                  <div className="space-y-2 pl-10">
                    {availability[day].slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No time slots. Add one to set availability.</p>
                    ) : (
                      availability[day].slots.map((slot, index) => (
                        <div key={slot.id} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Slot {index + 1}:</span>
                          <Select
                            value={slot.startTime}
                            onValueChange={(value) => updateSlotTime(day, slot.id, "startTime", value)}
                          >
                            <SelectTrigger className="w-24">
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
                            value={slot.endTime}
                            onValueChange={(value) => updateSlotTime(day, slot.id, "endTime", value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeTimeSlot(day, slot.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pl-10">Unavailable</p>
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
