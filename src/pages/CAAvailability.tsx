import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, Plus, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TimelinePreview from "@/components/dashboard/TimelinePreview";

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

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getSlotDurationMinutes = (startTime: string, endTime: string): number => {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
};

const doSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);
  return start1 < end2 && start2 < end1;
};

interface SlotError {
  slotId: string;
  message: string;
}

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
  const [hasChanges, setHasChanges] = useState(false);
  const [slotErrors, setSlotErrors] = useState<Record<string, SlotError[]>>({});

  const validateSlots = (day: string, slots: TimeSlot[]): SlotError[] => {
    const errors: SlotError[] = [];
    
    slots.forEach((slot, index) => {
      const startMinutes = timeToMinutes(slot.startTime);
      const endMinutes = timeToMinutes(slot.endTime);
      const slotDuration = endMinutes - startMinutes;
      const requiredDuration = parseInt(slot.duration);

      // Check if end time is after start time
      if (endMinutes <= startMinutes) {
        errors.push({ slotId: slot.id, message: "End time must be after start time" });
      }
      // Check if slot duration meets minimum requirement
      else if (slotDuration < requiredDuration) {
        errors.push({ slotId: slot.id, message: `Slot must be at least ${slot.duration} min (current: ${slotDuration} min)` });
      }

      // Check for overlaps with other slots
      slots.forEach((otherSlot, otherIndex) => {
        if (index < otherIndex && doSlotsOverlap(slot, otherSlot)) {
          errors.push({ slotId: slot.id, message: "This slot overlaps with another slot" });
        }
      });
    });

    return errors;
  };

  const validateAllSlots = (newAvailability: Record<string, DayAvailability>) => {
    const newErrors: Record<string, SlotError[]> = {};
    days.forEach(day => {
      if (newAvailability[day].enabled) {
        const dayErrors = validateSlots(day, newAvailability[day].slots);
        if (dayErrors.length > 0) {
          newErrors[day] = dayErrors;
        }
      }
    });
    setSlotErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSlotError = (day: string, slotId: string): string | undefined => {
    return slotErrors[day]?.find(e => e.slotId === slotId)?.message;
  };

  const hasValidationErrors = Object.keys(slotErrors).length > 0;

  const toggleDay = (day: string) => {
    const newAvailability = {
      ...availability,
      [day]: { ...availability[day], enabled: !availability[day].enabled }
    };
    setAvailability(newAvailability);
    validateAllSlots(newAvailability);
    setHasChanges(true);
  };

  const addTimeSlot = (day: string) => {
    const lastSlot = availability[day].slots[availability[day].slots.length - 1];
    const newStartTime = lastSlot ? lastSlot.endTime : "09:00";
    const startIndex = timeSlots.indexOf(newStartTime);
    const newEndTime = timeSlots[Math.min(startIndex + 2, timeSlots.length - 1)] || "17:00";
    
    const newAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        slots: [...availability[day].slots, createDefaultSlot(newStartTime, newEndTime)]
      }
    };
    setAvailability(newAvailability);
    validateAllSlots(newAvailability);
    setHasChanges(true);
  };

  const removeTimeSlot = (day: string, slotId: string) => {
    const newAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        slots: availability[day].slots.filter(slot => slot.id !== slotId)
      }
    };
    setAvailability(newAvailability);
    validateAllSlots(newAvailability);
    setHasChanges(true);
  };

  const updateSlot = (day: string, slotId: string, field: keyof TimeSlot, value: string) => {
    const newAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        slots: availability[day].slots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    };
    setAvailability(newAvailability);
    validateAllSlots(newAvailability);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (hasValidationErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in your time slots before saving.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Availability Saved",
      description: "Your availability settings have been updated successfully.",
    });
    setHasChanges(false);
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
          <Button onClick={handleSave} disabled={!hasChanges || hasValidationErrors} className={(!hasChanges || hasValidationErrors) ? "opacity-50" : ""}>
            <Save className="w-4 h-4 mr-2" />
            Save Availability
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline Overview */}
          <div className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Weekly Overview</span>
            </div>
            <div className="space-y-3">
              {days.map((day) => (
                <div key={`timeline-${day}`} className="flex items-center gap-3">
                  <span className={`w-12 text-xs font-medium ${availability[day].enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {day.slice(0, 3)}
                  </span>
                  <div className="flex-1">
                    <TimelinePreview 
                      slots={availability[day].slots} 
                      enabled={availability[day].enabled} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day configurations */}
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
                    availability[day].slots.map((slot, index) => {
                      const error = getSlotError(day, slot.id);
                      return (
                        <div key={slot.id} className="space-y-1">
                          <div className={`flex flex-wrap items-center gap-2 p-3 rounded-md ${error ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/50'}`}>
                            <span className="text-xs font-medium text-muted-foreground w-14">Slot {index + 1}</span>
                            
                            {/* Time Range */}
                            <div className="flex items-center gap-1">
                              <Select
                                value={slot.startTime}
                                onValueChange={(value) => updateSlot(day, slot.id, "startTime", value)}
                              >
                                <SelectTrigger className={`w-[80px] h-8 text-xs ${error ? 'border-destructive' : ''}`}>
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
                                <SelectTrigger className={`w-[80px] h-8 text-xs ${error ? 'border-destructive' : ''}`}>
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
                                <SelectTrigger className="w-[70px] h-8 text-xs px-2">
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
                                <SelectTrigger className="w-[85px] h-8 text-xs px-2">
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
                          {error && (
                            <p className="text-xs text-destructive pl-3">{error}</p>
                          )}
                        </div>
                      );
                    })
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
