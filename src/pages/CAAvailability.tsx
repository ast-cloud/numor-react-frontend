import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const durationOptions = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hr" },
  { value: "90", label: "1.5 hr" },
];

const bufferOptions = [
  { value: "0", label: "No buffer" },
  { value: "5", label: "5 min" },
  { value: "10", label: "10 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
];

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: string;
  buffer: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createDefaultSlot = (startTime: string, endTime: string): TimeSlot => ({
  id: generateId(),
  startTime,
  endTime,
  duration: "30",
  buffer: "15",
});

const CAAvailability = () => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    Monday: { enabled: true, slots: [createDefaultSlot("09:00", "12:00"), createDefaultSlot("13:00", "17:00")] },
    Tuesday: { enabled: true, slots: [createDefaultSlot("09:00", "12:00"), createDefaultSlot("13:00", "17:00")] },
    Wednesday: { enabled: true, slots: [createDefaultSlot("09:00", "12:00"), createDefaultSlot("13:00", "17:00")] },
    Thursday: { enabled: true, slots: [createDefaultSlot("09:00", "12:00"), createDefaultSlot("13:00", "17:00")] },
    Friday: { enabled: true, slots: [createDefaultSlot("09:00", "12:00"), createDefaultSlot("13:00", "17:00")] },
    Saturday: { enabled: false, slots: [createDefaultSlot("10:00", "13:00")] },
    Sunday: { enabled: false, slots: [createDefaultSlot("10:00", "13:00")] },
  });

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
        slots: [...prev[day].slots, createDefaultSlot(newStartTime, newEndTime)]
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

  const updateSlot = (day: string, slotId: string, field: keyof TimeSlot, value: string) => {
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>Configure your available days, time slots, and session settings for each slot.</CardDescription>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Availability
          </Button>
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
                <div className="space-y-3 pl-10">
                  {availability[day].slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No time slots. Add one to set availability.</p>
                  ) : (
                    availability[day].slots.map((slot, index) => (
                      <div key={slot.id} className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-md">
                        <span className="text-xs font-medium text-muted-foreground w-14">Slot {index + 1}</span>
                        
                        {/* Time Range */}
                        <div className="flex items-center gap-1">
                          <Select
                            value={slot.startTime}
                            onValueChange={(value) => updateSlot(day, slot.id, "startTime", value)}
                          >
                            <SelectTrigger className="w-[80px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground text-xs">–</span>
                          <Select
                            value={slot.endTime}
                            onValueChange={(value) => updateSlot(day, slot.id, "endTime", value)}
                          >
                            <SelectTrigger className="w-[80px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <span className="text-muted-foreground text-xs">|</span>

                        {/* Duration */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Duration:</span>
                          <Select
                            value={slot.duration}
                            onValueChange={(value) => updateSlot(day, slot.id, "duration", value)}
                          >
                            <SelectTrigger className="w-[75px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {durationOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Buffer */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Buffer:</span>
                          <Select
                            value={slot.buffer}
                            onValueChange={(value) => updateSlot(day, slot.id, "buffer", value)}
                          >
                            <SelectTrigger className="w-[90px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {bufferOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive ml-auto"
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
    </div>
  );
};

export default CAAvailability;
