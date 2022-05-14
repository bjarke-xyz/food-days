import { differenceInSeconds, parseISO, set, setYear } from "date-fns";
import { orderBy } from "lodash";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { EventWrapper } from "../components/event";
import { EventCalendar } from "../components/event-calendar";
import { DayEvent } from "../lib/models";
import { fetcher } from "../lib/utils";

const Home: NextPage = () => {
  const router = useRouter();
  const [date, setDate] = useState(
    set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  );
  // useEffect(() => {
  //   let inputDateStr = router.query["d"];
  //   if (isArray(inputDateStr)) {
  //     inputDateStr = inputDateStr[0];
  //   }
  //   let parsedDate = new Date();
  //   if (inputDateStr) {
  //     parsedDate = parse(inputDateStr, "MM-dd", new Date());
  //     if (isNaN(parsedDate as any)) {
  //       parsedDate = new Date();
  //     }
  //   }
  //   setDate(parsedDate);
  // }, [router.query]);

  const { data, error, isValidating } = useSWR<DayEvent[]>(
    `${process.env.API_URL}/events`,
    (...args) =>
      fetcher(...args).then((events) =>
        events.map((e: any) => ({
          ...e,
          date: setYear(parseISO(e.date), date.getFullYear()),
        }))
      ),
    {
      revalidateOnFocus: false,
    }
  );

  const onMonthChange = (date: Date) => {
    if (data) {
      const firstEventInMonth = data.find(
        (x) => x.date.getMonth() == date.getMonth()
      );
      if (firstEventInMonth) {
        setDate(firstEventInMonth.date);
        return;
      }
    }
    setDate(date);
  };

  const [events, setEvents] = useState(data?.[0] ? [data[0]] : []);
  useEffect(() => {
    if (data) {
      const eventsSorted = orderBy(
        data,
        (event) => {
          const dayDiff = Math.abs(differenceInSeconds(date, event.date));
          return dayDiff;
        },
        "asc"
      );
      const nearestEvents: DayEvent[] = [];
      for (const nearEvent of eventsSorted) {
        if (
          nearEvent.date.getMonth() == date.getMonth() &&
          nearEvent.date.getDate() == date.getDate()
        ) {
          nearestEvents.push(nearEvent);
        }
      }
      if (nearestEvents.length > 0) {
        setEvents(nearestEvents);
        if (nearestEvents[0]) {
          setDate(nearestEvents[0].date);
        }
      } else {
        setEvents([eventsSorted[0]]);
        setDate(eventsSorted[0].date);
      }
    }
  }, [data, date]);

  return (
    <div className="flex flex-col h-screen justify-between">
      <main className="mb-auto">
        <div className="flex mt-4 min-w-[320px]">
          <div className="">
            <EventCalendar
              date={date}
              setDate={setDate}
              onMonthChange={onMonthChange}
              events={data ?? null}
            />
          </div>
          <div className="">
            {error && <div>failed to load</div>}
            {isValidating && !data && <div>loading...</div>}
            {events && <EventWrapper date={date} events={events} />}
          </div>
        </div>
      </main>
      <footer className="h-10 p-4 rounded-t-lg ">
        <div className="flex items-center">
          Source:
          <a
            className="underline"
            href="https://en.wikipedia.org/wiki/List_of_food_days"
          >
            Wikipedia
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
