require("dotenv").config();

const express = require("express");

const { Client } = require("asana");
const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

const { App, ExpressReceiver } = require("@slack/bolt");
const receiver = new ExpressReceiver({ signingSecret: process.env.SIGNING_SECRET });
receiver.router.use(express.json());

const app = new App({
  appToken: process.env.APP_TOKEN,
  token: process.env.BOT_TOKEN,
  receiver,
});

let lastTask = "";

receiver.router.post("/webhook", (req, res) => {
  if (req.headers.hasOwnProperty("x-hook-secret")) {
    res.writeHead(200, { "x-hook-secret": req.headers["x-hook-secret"] });
    res.end();
    return;
  }

  if (req.body.events[0].resource.gid === lastTask) {
    res.sendStatus(200);
    return;
  }

  client.tasks.getTask(req.body.events[0].resource.gid).then((response) => {
    app.client.chat.postMessage({
      token: process.env.BOT_TOKEN,
      channel: "C01SKRMGTPW",
      text: `${response.name} \n ${response.permalink_url}`,
    });
  });

  lastTask = req.body.events[0].resource.gid;

  res.sendStatus(200);
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("Bolt app started");
})();
