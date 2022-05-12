import { Callback, Context, S3Event } from "aws-lambda";
import { isFunction } from "lodash";
import { createEventsRepository } from "../lib/events-repository";
import { SourceType } from "../lib/models";
import { parsers } from "../lib/parsers";

const eventsRepository = createEventsRepository();

export async function main(
  event: S3Event,
  context: Context,
  callback: Callback
): Promise<any> {
  const keys = event.Records.map((x) => x.s3.object.key);
  for (const key of keys) {
    console.log("KEY -> ", key);
    const source = key.split("/")[1] as SourceType;
    const sourceData = await eventsRepository.getSourceData(source);
    if (!sourceData) {
      console.error(`no source data found for ${source}`);
      continue;
    }
    const parse = parsers[source];
    if (isFunction(parse)) {
      const events = parse(sourceData);
      if (events.length > 0) {
        console.log(`writing ${events.length} '${key}' events`);
        await eventsRepository.writeEvents(events);
      }
    }
  }
  callback(null);
}
