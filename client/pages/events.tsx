import { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Event } from "../components/event";
import { DayEvent } from "../lib/models";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import { isArray } from "lodash";

const fetcher = (...args: any[]) =>
  fetch.apply(null, args as any).then((res) => res.json());

const EventPage: NextPage = () => {
  const router = useRouter();
  const [dateStr, setDateStr] = useState("");
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
    const formattedDateStr = format(parsedDate, "MM-dd");
    setDateStr(formattedDateStr);
  }, [router.query]);
  // const dateStr = router.query["d"] ?? format(new Date(), "MM-dd");
  const { data, error } = useSWR<DayEvent[]>(
    `${process.env.API_URL}/events?d=${dateStr}`,
    fetcher,
    {
      refreshInterval: 0,
    }
  );
  // console.log(data, error);

  return (
    <div>
      <h1>{dateStr}</h1>
      {error && <div>failed to load</div>}
      {!data && <div>loading...</div>}
      {data &&
        data.map((event) => <Event key={event.event} event={event}></Event>)}
    </div>
  );
};

export default EventPage;
