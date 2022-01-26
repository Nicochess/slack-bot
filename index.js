require("dotenv").config();

const { App, ExpressReceiver } = require("@slack/bolt");

const express = require("express");
const receiver = new ExpressReceiver({
  signingSecret: process.env.SIGNING_SECRET,
});
receiver.router.use(express.json());

const { Client } = require("asana");

const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

client.webhooks.createWebhook({
  filters: [
    {
      action: "added",
      resource_type: "task",
    },
  ],
  resource: "30994714493547",
  target: "https://slack-asana-bot.herokuapp.com/webhook",
});

client.webhooks.getWebhooks({ workspace: "2653227806782" }).then((res) => {
  console.log(res);
});

const app = new App({
  token: process.env.BOT_TOKEN,
  port: process.env.PORT || 3000,
  receiver,
});

receiver.router.post("/receive-webhook", (req, res) => {
  res
    .status(200)
    .send(res.header("X-Hook-Secret", req.headers["x-hook-secret"]));
});

app.message("bot", async ({ message, say }) => {
  await say(`Por que está falando de mim, <@${message.user}> ?`);
});

app.message("task doing", async ({ say }) => {
  try {
    const { data } = await client.tasks.getTasksForSection("1140999922606648", {
      completed_since: "now",
    });

    if (data.length == 0) {
      say("Ninguém trabalhando? :eyes:");
      return;
    }

    let message = "";
    data.map(
      (task) =>
        (message += `
    - ${task.name}
    https://app.asana.com/0/1140999922606648/${task.gid}

    `)
    );
    say(message);
  } catch (error) {
    console.log(error);
  }
});

app.message("task todo", async ({ say }) => {
  try {
    const { data } = await client.tasks.getTasksForSection("1140999922812186", {
      completed_since: "now",
    });

    if (data.length == 0) {
      say("Nenhuma tarefa pendente. :eyes:");
      return;
    }

    let message = "";
    res.data.map(
      (task) =>
        (message += `
    - ${task.name}
    https://app.asana.com/0/1140999922812186/${task.gid}

    `)
    );
    say(message);
  } catch (error) {
    console.log(error);
  }
});

app.message("comandos", async ({ say, message }) => {
  say(`
    Olá, <@${message.user}> !
    Nós podemos nos comunicar utilizando os comandos:
    - task doing
    - task todo
  `);
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("Bolt app started");
})();
