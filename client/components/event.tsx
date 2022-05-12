import { DayEvent } from "../lib/models";

interface EventProps {
  event: DayEvent;
}
export const Event: React.FC<EventProps> = ({ event }) => {
  return (
    <div>
      <h3>{event.event}</h3>
      <time>{event.date}</time>
      <p>{event.details}</p>
      {event.imageUrl && <img src={event.imageUrl}></img>}
    </div>
  );
};
