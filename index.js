require("dotenv").config();

const getRawBody = require("raw-body");

const { Client } = require("asana");
const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

let lastTask = "";

const { App } = require("@slack/bolt");

const app = new App({
  appToken: process.env.APP_TOKEN,
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  port: process.env.PORT || 3000,
  socketMode: true,
  customRoutes: [
    {
      path: "/webhook",
      method: ["POST"],
      handler: async (req, res) => {
        if (req.headers.hasOwnProperty("x-hook-secret")) {
          res.writeHead(200, {
            "x-hook-secret": req.headers["x-hook-secret"],
          });
          res.end();
          return;
        }
        console.log("### inicio");
        const rawBody = await getRawBody(req);
        const body = JSON.parse(rawBody.toString());

        if (lastTask === body.events[0].resource.gid) {
          return;
        }

        try {
          const response = await client.tasks.getTask(body.events[0].resource.gid);
          await app.client.chat.postMessage({
            token: process.env.BOT_TOKEN,
            channel: "C031679DDD1",
            text: `${response.name} \n ${response.permalink_url}`,
          });
          lastTask = body.events[0].resource.gid;
        } catch(e) {
          console.log(e);
        }
      },
    },
  ],
});

app.message("oi", async ({ say, message }) => {
  await say("Não quero conversas");
});

(async () => {
  await app.start();
  console.log("Bolt app started");
})();
