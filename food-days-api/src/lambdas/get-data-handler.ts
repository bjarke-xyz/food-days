import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { parse } from "date-fns";
import { createEventsRepository } from "../lib/events-repository";

const eventsRepository = createEventsRepository();

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  let date = new Date();
  const dQueryParam = event.queryStringParameters?.["d"] ?? "";
  if (dQueryParam) {
    date = parse(dQueryParam, "MM-dd", new Date());
    if (isNaN(date as any)) {
      date = new Date();
    }
  }
  const events = await eventsRepository.GetEvents(date);
  return {
    statusCode: 200,
    body: JSON.stringify(events),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}
