require("dotenv").config();

const { Client } = require("asana");
const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

const { App } = require("@slack/bolt");

const app = new App({
  appToken: process.env.APP_TOKEN,
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  socketMode: true,
  port: process.env.PORT || 3000,
  customRoutes: [
    {
      path: "/webhook",
      method: ["POST"],
      handler: (req, res) => {
        res.writeHead(200, {
          "x-hook-secret": req.headers["x-hook-secret"],
        });
        res.end();
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
