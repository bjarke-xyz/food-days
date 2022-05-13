import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useState } from "react";
import { addDays, format, parse, parseISO, setYear, addYears } from "date-fns";
import { DayEvent } from "../lib/models";

export interface EventCalendarProps {
  date: Date;
  setDate: (date: Date) => any;
  onMonthChange: (date: Date) => any;
  events: DayEvent[] | null;
}
export const EventCalendar: React.FC<EventCalendarProps> = ({
  date,
  setDate,
  onMonthChange,
  events,
}) => {
  const eventDates = (events ?? []).map((x) => {
    const eventDate = parseISO(x.date);
    return setYear(eventDate, date.getFullYear());
  });
  const eventDatesSet = new Set<string>(
    eventDates.map((x) => format(x, "MM-dd"))
  );
  const disabledDates: Date[] = [];
  const startDate = parse(
    `${date.getFullYear()}-01-01`,
    "yyyy-MM-dd",
    new Date()
  );
  const endDate = addYears(startDate, 1);
  for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
    if (!eventDatesSet.has(format(d, "MM-dd"))) {
      disabledDates.push(d);
    }
  }
  return (
    <DayPicker
      mode="single"
      selected={date}
      onSelect={(d) => setDate(d ?? new Date())}
      fromYear={date.getFullYear()}
      toYear={date.getFullYear()}
      onMonthChange={(d) => onMonthChange(d)}
      disabled={disabledDates}
      // modifiers={{ eventDay: eventDates }}
      // modifiersClassNames={{
      //   eventDay: "!bg-blue-200 !text-extrabold !text-lg !text-black",
      // }}
    />
  );
};
