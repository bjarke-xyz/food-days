import { Request as IttyRouterRequest } from "itty-router";

export type WorkerEnv = {
  FOOD_DAYS: KVNamespace;
};

export type IttyRequest = Request & IttyRouterRequest;
