import { differenceInDays, setYear, parseISO, format } from "date-fns";
import { orderBy, sortBy } from "lodash";
import { useEffect, useState } from "react";
import { DayEvent } from "../lib/models";

interface EventsViewerProps {
  events: DayEvent[];
  date: Date;
}
export const EventsViewer: React.FC<EventsViewerProps> = ({ events, date }) => {
  const eventsSorted = orderBy(
    events,
    (event) => {
      const eventDate1970 = parseISO(event.date);
      const eventDateThisYear = setYear(eventDate1970, date.getFullYear());
      const dayDiff = Math.abs(differenceInDays(date, eventDateThisYear));
      return dayDiff;
    },
    "asc"
  );
  const nearestEvent = eventsSorted[0];
  // console.log(nearestEvent, date, eventsSorted);
  return (
    <div>
      <Event date={date} event={nearestEvent} />
      {/* {eventsSorted.map((e) => (
        <Event key={e.event} event={e} />
      ))} */}
    </div>
  );
};

interface EventProps {
  event: DayEvent;
  date: Date;
}
export const Event: React.FC<EventProps> = ({ event, date }) => {
  // let imageUrl = "";
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // let imageUrl = event.imageUrl ?? null;
  const originalImageUrl = event.imageUrl ?? null;
  useEffect(() => {
    if (event.imageUrl) {
      let tmpUrl = event.imageUrl;
      if (tmpUrl.includes("/thumb/")) {
        tmpUrl = tmpUrl.replace("/thumb", "");
        const pathParts = tmpUrl.split("/");
        const lastPart = pathParts[pathParts.length - 1];
        tmpUrl = tmpUrl.replace(`/${lastPart}`, "");
        setImageUrl(tmpUrl);
        // imageUrl = tmpUrl;
      }
    }
  }, [event.imageUrl]);

  function imageUrlFallback() {
    if (imageUrl !== originalImageUrl) {
      setImageUrl(originalImageUrl);
      // imageUrl = originalImageUrl;
    }
  }

  let eventDate = parseISO(event.date);
  eventDate = setYear(eventDate, date.getFullYear());

  return (
    <div>
      <div className="text-3xl">{event.event}</div>
      <time>{format(eventDate, "E dd MMM")}</time>
      <p>{event.details}</p>
      {imageUrl && <img onError={imageUrlFallback} src={imageUrl}></img>}
    </div>
  );
};
