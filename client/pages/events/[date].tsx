import { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Event } from "../../components/event";
import { DayEvent } from "../../lib/models";

const fetcher = (...args: any[]) =>
  fetch.apply(null, args as any).then((res) => res.json());

const Date: NextPage = () => {
  const router = useRouter();
  const dateStr = router.asPath.split("/")[2];
  const { data, error } = useSWR<DayEvent[]>(
    `${process.env.API_URL}/events?d=${dateStr}`,
    fetcher
  );
  return (
    <div>
      <h1>{dateStr}</h1>
      {data &&
        data.map((event) => <Event key={event.event} event={event}></Event>)}
    </div>
  );
};

export default Date;
