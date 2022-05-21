import { parseISO } from "date-fns";
import { EventsRepository } from "../lib/events-repository";
import { parsers } from "../lib/parsers";
import { IttyRequest } from "../types";

export async function getEvents(
  request: IttyRequest,
  context: EventContext<any, any, any>,
  eventsRepository: EventsRepository
): Promise<Response> {
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (!response) {
    // Not in cache, fetch from origin
    let events = await eventsRepository.getEvents();
    if (events.length === 0) {
      await updateEvents(request, eventsRepository);
      events = await eventsRepository.getEvents();
    }
    if (events) {
      const todayOnly = request.query?.["today"] === "true";
      if (todayOnly) {
        const today = new Date();
        events = events.filter((x) => {
          return (
            x.date.getMonth() === today.getMonth() &&
            x.date.getDate() === today.getDate()
          );
        });
      }
      response = new Response(JSON.stringify(events), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      response = new Response("No events found", { status: 404 });
    }

    response.headers.append("Cache-Control", "s-maxage=600");
    response.headers.append("Access-Control-Allow-Origin", "*");
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}

export async function updateEvents(
  request: IttyRequest,
  eventsRepository: EventsRepository
): Promise<Response> {
  const parser = parsers["wikipedia"];
  const html = await (
    await fetch("https://en.wikipedia.org/wiki/List_of_food_days")
  ).text();
  const events = parser(html);
  await eventsRepository.writeEvents("wikipedia", events);
  return new Response("OK", { status: 200 });
}
