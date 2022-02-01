require("dotenv").config();

const { Client } = require("asana");
const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

const { App, ExpressReceiver } = require("@slack/bolt");
const receiver = new ExpressReceiver({
  signingSecret: process.env.SIGNING_SECRET,
});

const app = new App({
  token: process.env.BOT_TOKEN,
  port: process.env.SLACK_PORT || 3000,
  receiver,
});

receiver.router.post("/webhook", (req, res) => {
  res.writeHead(200, {
    "x-hook-secret": req.headers["x-hook-secret"],
  });
  res.end();
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

(async () => {
  await app.start();
  console.log("Bolt app started");
})();
