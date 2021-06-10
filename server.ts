import { Application, Context, Router, ServerSentEvent, ServerSentEventTarget } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import database from './db.ts';

const app = new Application();

const router = new Router();

let listeners: ServerSentEventTarget[] = [];

router.get("/sse", (ctx: Context) => {
  const target = ctx.sendEvents();
  listeners.push(target);
  console.log("Added ", target);
  target.dispatchMessage({hello: 'world'});
  listeners = listeners.filter((value) => !value.closed);
  console.log("listeners:", listeners);
});

// router.get("/barf", async (ctx) => {

//   const {rows: result} = await database.queryArray`SELECT id FROM countries ORDER BY id ASC;`;

//   console.log("SSEing to ", listeners, "data", result);
//   listeners.map((target) => {
//     const event = new ServerSentEvent("barf", { henk: 'something funny' });
//     target.dispatchMessage(event);
//   });

//   ctx.response.body = "Hello world!" + result;
// });

router.get("/barf2", (ctx) => {

  console.log("SSEing to ", listeners);
  listeners.map((target) => {
    const event = new ServerSentEvent("barf", {data:{ henk: 'something funny' }});
    target.dispatchEvent(event);
  });

  ctx.response.body = "Hello world2!";
});

app.use(oakCors());
app.use(router.routes());
// Send static content
app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/../frontend/dist/`,
    index: "index.html",
  });
});

console.log("Listening on http://127.0.0.1:8000");
await app.listen("127.0.0.1:8000");
