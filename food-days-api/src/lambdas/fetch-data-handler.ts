import { Callback, Context, EventBridgeEvent } from "aws-lambda";
import { createEventsRepository } from "../lib/events-repository";

const eventsRepository = createEventsRepository();
export async function main(
  event: EventBridgeEvent<any, any>,
  context: Context,
  callback: Callback
): Promise<any> {
  await eventsRepository.fetchAndStoreDataSource();
  callback(null);
}
