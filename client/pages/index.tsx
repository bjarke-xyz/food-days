import { parse, format, parseISO } from "date-fns";
import { isArray } from "lodash";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { DayEvent } from "../lib/models";
import { fetcher } from "../lib/utils";
import { Event, EventsViewer } from "../components/event";
import { EventCalendar } from "../components/event-calendar";

const Home: NextPage = () => {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    let inputDateStr = router.query["d"];
    if (isArray(inputDateStr)) {
      inputDateStr = inputDateStr[0];
    }
    let parsedDate = new Date();
    if (inputDateStr) {
      parsedDate = parse(inputDateStr, "MM-dd", new Date());
      if (isNaN(parsedDate as any)) {
        parsedDate = new Date();
      }
    }
    setDate(parsedDate);
  }, [router.query]);

  const { data, error, isValidating } = useSWR<DayEvent[]>(
    `${process.env.API_URL}/events`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const onMonthChange = (date: Date) => {
    setDate(date);
  };

  return (
    <div className="columns-2 mt-4">
      <div className="">
        {error && <div>failed to load</div>}
        {isValidating && !data && <div>loading...</div>}
        {data && <EventsViewer events={data} date={date} />}
      </div>
      <div className="">
        <EventCalendar
          date={date}
          setDate={setDate}
          onMonthChange={onMonthChange}
          events={data ?? null}
        />
      </div>
    </div>
  );
};

export default Home;
