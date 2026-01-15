import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: string;
  buffer: string;
}

interface TimelinePreviewProps {
  slots: TimeSlot[];
  enabled: boolean;
}

const TIMELINE_START = 6 * 60; // 6:00 AM in minutes
const TIMELINE_END = 21 * 60; // 9:00 PM in minutes
const TIMELINE_DURATION = TIMELINE_END - TIMELINE_START;

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const TimelinePreview = ({ slots, enabled }: TimelinePreviewProps) => {
  if (!enabled) {
    return (
      <div className="h-8 bg-muted/30 rounded-md flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Day off</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="h-8 bg-muted/30 rounded-md flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No slots configured</span>
      </div>
    );
  }

  const timeMarkers = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
  const markerPositions = [0, 20, 40, 60, 80, 100];

  return (
    <TooltipProvider>
      <div className="space-y-1">
        {/* Timeline bar */}
        <div className="relative h-8 bg-muted/30 rounded-md overflow-hidden">
          {/* Available slot bars */}
          {slots.map((slot) => {
            const startMinutes = timeToMinutes(slot.startTime);
            const endMinutes = timeToMinutes(slot.endTime);
            
            // Clamp to timeline bounds
            const clampedStart = Math.max(startMinutes, TIMELINE_START);
            const clampedEnd = Math.min(endMinutes, TIMELINE_END);
            
            if (clampedEnd <= clampedStart) return null;
            
            const left = ((clampedStart - TIMELINE_START) / TIMELINE_DURATION) * 100;
            const width = ((clampedEnd - clampedStart) / TIMELINE_DURATION) * 100;
            
            return (
              <Tooltip key={slot.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-1 bottom-1 bg-primary/80 rounded cursor-pointer hover:bg-primary transition-colors"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {slot.duration} min sessions • {slot.buffer === "0" ? "No buffer" : `${slot.buffer} min buffer`}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        
        {/* Time markers */}
        <div className="relative h-4">
          {timeMarkers.map((marker, index) => (
            <span
              key={marker}
              className="absolute text-[10px] text-muted-foreground transform -translate-x-1/2"
              style={{ left: `${markerPositions[index]}%` }}
            >
              {marker}
            </span>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TimelinePreview;
