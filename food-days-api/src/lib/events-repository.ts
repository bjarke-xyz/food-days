import { DynamoDB, S3 } from "aws-sdk";
import {
  addMonths,
  endOfMonth,
  format,
  parseISO,
  set,
  setYear,
  startOfMonth,
  subMonths,
} from "date-fns";
import { chunk, orderBy } from "lodash";
import { nanoid } from "nanoid";
import fetch from "node-fetch";
import { DayEvent, SourceType } from "./models";

export class EventsRepository {
  private readonly db: DynamoDB.DocumentClient;
  private readonly ddbTable: string;

  private readonly s3: S3;
  private readonly s3Bucket: string;

  constructor(
    db: DynamoDB.DocumentClient,
    ddbTable: string,
    s3: S3,
    s3Bucket: string
  ) {
    this.db = db;
    this.ddbTable = ddbTable;

    this.s3 = s3;
    this.s3Bucket = s3Bucket;
  }

  async GetEvents(date: Date): Promise<DayEvent[]> {
    const response: DayEvent[] = [];
    try {
      // const modifiedDate = set(date, {
      //   year: 1970,
      //   hours: 0,
      //   minutes: 0,
      //   seconds: 0,
      //   milliseconds: 0,
      // });
      // const from = startOfMonth(modifiedDate);
      // const to = endOfMonth(modifiedDate);
      const resp = await this.db
        .query({
          TableName: this.ddbTable,
          KeyConditionExpression: "PK = :PK",
          ExpressionAttributeValues: {
            ":PK": `MONTH#${date.getMonth() + 1}`,
          },
        })
        .promise();
      for (const _item of resp?.Items ?? []) {
        const item = _item as {
          PK: string;
          SK: string;
          details: string;
          imageUrl: string;
          // event: string;
          country: string;
        };
        const date = parseISO(item.SK.split("#")[1]);
        const event = item.SK.split("#")[3].replace("¤HTAG¤", "#");
        const { country, details, imageUrl } = item;
        response.push({
          date,
          event,
          details,
          imageUrl,
          country,
        });
      }
    } catch (error) {
      console.error(error);
    }
    return orderBy(response, (x) => x.date);
    return [
      {
        date,
        country: "Japan",
        details:
          'Date can be read "ichi-go" in Japanese, same as the word for strawberry',
        event: "Strawberry Day",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/0/08/Brazilian_strawberries.jpg",
      },
      {
        date,
        country: "Sweden",
        event: "National Waffle Day (Våffeldagen)",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/c/cf/Waffle_with_strawberries_and_confectioner%27s_sugar.jpg",
      },
    ];
  }

  async fetchAndStoreDataSource(): Promise<void> {
    const sources: { name: SourceType; link: string }[] = [
      {
        name: "wikipedia",
        link: "https://en.wikipedia.org/wiki/List_of_food_days",
      },
    ];
    for (const source of sources) {
      try {
        const resp = await fetch(source.link);
        console.log(source.name, resp.status);
        const text = await resp.text();
        await this.s3
          .upload({
            Bucket: this.s3Bucket.toLowerCase(),
            Key: `sourcedata/${source.name}`,
            Body: text,
          })
          .promise();
      } catch (error) {
        console.error(
          `Error getting source data for ${source.name} at ${source.link}`,
          error
        );
      }
    }
  }

  async getSourceData(type: SourceType): Promise<string | null> {
    const resp = await this.s3
      .getObject({
        Bucket: this.s3Bucket.toLowerCase(),
        Key: `sourcedata/${type}`,
      })
      .promise();
    return resp?.Body?.toString("utf-8") ?? null;
  }

  async writeEvents(events: DayEvent[]): Promise<void> {
    // TODO: Figure out better way, instead of overwriting everything
    const chunks = chunk(events, 25);
    let chunkIndex = 0;
    for (const chunk of chunks) {
      const insertBatch = chunk.map((event) => {
        const eventStr = event.event.replace("#", "¤HTAG¤");
        return {
          PutRequest: {
            Item: {
              PK: `MONTH#${event.date.getMonth() + 1}`,
              SK: `DATE#${event.date.toISOString()}#EVENT#${eventStr}`,
              // event: event.event,
              country: event.country,
              details: event.details,
              imageUrl: event.imageUrl,
            },
          },
        };
      });
      try {
        const resp = await this.db
          .batchWrite({
            RequestItems: {
              [this.ddbTable]: insertBatch,
            },
          })
          .promise();
        console.log(`written chunk ${chunkIndex + 1} of ${chunks.length}`);
        chunkIndex++;
      } catch (error) {
        console.log(error);
        // console.error("error writing chunk to dynamodb", error);
      }
    }
  }
}

export function createEventsRepository(): EventsRepository {
  const bucketName = process.env.BUCKET || "";
  const ddbTableName = process.env.TABLE || "";
  console.log("BUCKET ->", bucketName);
  console.log("TABLE -> ", ddbTableName);
  const localhostEndpoint =
    process.env.NODE_ENV === "dev"
      ? "http://host.docker.internal:4566"
      : undefined;
  const s3 = new S3({
    endpoint: localhostEndpoint,
    s3ForcePathStyle: true,
  });
  const db = new DynamoDB.DocumentClient({
    endpoint: localhostEndpoint,
  });
  const eventsRepository = new EventsRepository(
    db,
    ddbTableName,
    s3,
    bucketName
  );
  return eventsRepository;
}
