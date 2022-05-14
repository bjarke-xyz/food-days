/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Router } from "itty-router";
import { getEvents } from "./handlers/events";
import { EventsRepository } from "./lib/events-repository";
import { IttyRequest } from "./types";

const router = Router();

router.get("/events", (req: IttyRequest, env, context) =>
  getEvents(req, context, new EventsRepository(env))
);

// router.post("/events", (req: IttyRequest, env) =>
//   updateEvents(req, new EventsRepository(env))
// );

router.all("*", () => new Response("Not found", { status: 404 }));
export default {
  fetch: router.handle,
};
