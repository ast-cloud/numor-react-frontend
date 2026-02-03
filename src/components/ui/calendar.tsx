import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayButtonProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "h-9 w-9 p-0 font-normal",
        modifiers.today && !modifiers.selected && "bg-accent text-accent-foreground",
        modifiers.selected &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        modifiers.outside && "text-muted-foreground opacity-50",
        modifiers.disabled && "text-muted-foreground opacity-50",
        modifiers.hidden && "invisible",
        modifiers.range_middle &&
          "bg-accent text-accent-foreground rounded-none",
        modifiers.range_start && "rounded-r-none",
        modifiers.range_end && "rounded-l-none",
        defaultClassNames.day_button,
        className
      )}
      {...props}
    />
  );
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, showOutsideDays = true, ...props }, ref) => {
    const defaultClassNames = getDefaultClassNames();

    return (
      <div ref={ref}>
        <DayPicker
          showOutsideDays={showOutsideDays}
          className={cn("p-3 pointer-events-auto", className)}
          classNames={{
            root: cn("w-fit", defaultClassNames.root),
            months: cn(
              "flex flex-col sm:flex-row gap-4 relative",
              defaultClassNames.months
            ),
            month: cn("flex flex-col gap-4 w-full", defaultClassNames.month),
            month_caption: cn(
              "flex justify-center pt-1 relative items-center w-full h-9",
              defaultClassNames.month_caption
            ),
            caption_label: cn(
              "text-sm font-medium select-none",
              defaultClassNames.caption_label
            ),
            nav: cn(
              "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between px-1",
              defaultClassNames.nav
            ),
            button_previous: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10",
              defaultClassNames.button_previous
            ),
            button_next: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 z-10",
              defaultClassNames.button_next
            ),
            month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
            weekdays: cn("flex", defaultClassNames.weekdays),
            weekday: cn(
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] select-none flex-1 text-center",
              defaultClassNames.weekday
            ),
            week: cn("flex w-full mt-2", defaultClassNames.week),
            day: cn(
              "relative p-0 text-center text-sm flex-1 flex items-center justify-center aspect-square select-none",
              defaultClassNames.day
            ),
            range_start: cn("rounded-l-md", defaultClassNames.range_start),
            range_middle: cn("rounded-none", defaultClassNames.range_middle),
            range_end: cn("rounded-r-md", defaultClassNames.range_end),
            today: cn("", defaultClassNames.today),
            outside: cn("", defaultClassNames.outside),
            disabled: cn("", defaultClassNames.disabled),
            hidden: cn("invisible", defaultClassNames.hidden),
            ...classNames,
          }}
          components={{
            Chevron: ({ orientation }) => {
              if (orientation === "left") {
                return <ChevronLeft className="h-4 w-4" />;
              }
              return <ChevronRight className="h-4 w-4" />;
            },
            DayButton: CalendarDayButton,
          }}
          {...props}
        />
      </div>
    );
  }
);
Calendar.displayName = "Calendar";

export { Calendar };
