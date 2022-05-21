import { parseISO } from "date-fns";
import { WorkerEnv } from "../types";
import { DayEvent, SourceType } from "./models";

export class EventsRepository {
  private readonly env: WorkerEnv;
  constructor(env: WorkerEnv) {
    this.env = env;
  }
  async getEvents(): Promise<DayEvent[]> {
    const eventsStr = await this.env.FOOD_DAYS.get("wikipedia" as SourceType);
    if (eventsStr) {
      const parsed: DayEvent[] = JSON.parse(eventsStr);
      return parsed.map((x) => ({
        ...x,
        date: parseISO(x.date as any as string),
      }));
    }
    return [];
  }

  async writeEvents(source: SourceType, events: DayEvent[]) {
    await this.env.FOOD_DAYS.put(source, JSON.stringify(events));
  }
}
