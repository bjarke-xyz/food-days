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
      return JSON.parse(eventsStr);
    }
    return [];
  }

  async writeEvents(source: SourceType, events: DayEvent[]) {
    await this.env.FOOD_DAYS.put(source, JSON.stringify(events));
  }
}
