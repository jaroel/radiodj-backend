import { Application, Context, Router, ServerSentEvent, ServerSentEventTarget } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
// import database from './db.ts';

const app = new Application();

const router = new Router();

let listeners: ServerSentEventTarget[] = [];

router.get("/sse", (ctx: Context) => {
  const target = ctx.sendEvents();
  listeners.push(target);
  console.log("Added ", target);
  listeners = listeners.filter((value) => !value.closed);
  console.log("listeners:", listeners);
});

router.get("/barf", async (ctx) => {

  await listeners.map((target) => {
    const event = new ServerSentEvent("barf", JSON.stringify({ henk: 'something funny' }));
    console.log(`Sending ${event.type} ${event.data} to ${target}`);
    target.dispatchEvent(event);
  });

  ctx.response.body = "Hello world!";
});

app.use(oakCors({
 "origin": "*"
}));
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
