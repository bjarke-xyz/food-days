import { DayEvent, SourceType } from "./models";
import { load } from "cheerio";
import { parse, parseISO } from "date-fns";

type ParseFunction = (html: string) => DayEvent[];

function parseWikipedia(html: string): DayEvent[] {
  const $ = load(html);
  const events: DayEvent[] = [];
  $("h2 > .mw-headline").each((i, elem) => {
    const ch = $(elem);
    let country = ch.text().trim();
    if (country === "Global or International") {
      country = "International";
    }
    const table = ch.parent().next("table");
    table.find("tr").each((rowIndex, rowElem) => {
      const tds = $(rowElem).find("td").toArray();
      // console.log(country, tds.length);
      const dateStr = $(tds[0]).text().trim();
      // TODO: Extract wikipedia link from tds[1] to find image if missing from image column
      const event = $(tds[1]).text().trim();
      const origin = $(tds[2]).text().trim();
      const notes = $(tds[3]).text();
      const imageUrl = $(tds[4]).find("img")?.attr("src")?.trim();
      let date = parse(dateStr, "MMMM d", new Date(0));
      if (isNaN(date as any)) {
        date = new Date(0);
      }
      let details = "";
      if (origin) {
        details = `Origin: ${origin}`;
      }
      if (event) {
        // console.log(dateStr, date);
        events.push({
          date,
          event,
          details,
          imageUrl,
          country,
        });
      }
    });
  });

  console.log(events.length);
  return events;
}

export const parsers: Record<SourceType, ParseFunction> = {
  wikipedia: parseWikipedia,
};
