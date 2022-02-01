require("dotenv").config();

const { Client } = require("asana");
const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

const { App, ExpressReceiver } = require("@slack/bolt");
const receiver = new ExpressReceiver({
  signingSecret: process.env.SIGNING_SECRET,
});

const app = new App({
  token: process.env.BOT_TOKEN,
  receiver,
});

receiver.router.post("/webhook", (req, res) => {
  res.writeHead(200, {
    "x-hook-secret": req.headers["x-hook-secret"],
  });
  res.end();
});

app.message("ola", async ({ say }) => {
  say("Não quero conversas");
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("Bolt app started");
})();
