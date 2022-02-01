require("dotenv").config();

const { App } = require("@slack/bolt");

const { Client } = require("asana");

const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

client.webhooks
  .create(
    "30994714493547",
    "https://slack-asana-bot.herokuapp.com/receive-webhook",
    {
      filters: [
        {
          action: "added",
          resource_type: "task",
        },
      ],
    }
  )
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error.value);
  });

const app = new App({
  appToken: process.env.SLACK_TOKEN,
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  port: process.env.PORT || 3000,
  customRoutes: [
    {
      path: "/receive-webhook",
      method: ["POST"],
      handler: (req, res) => {
        res.writeHead(200, {
          "X-Hook-Secret": req.headers["X-Hook-Secret"],
        });
        res.end();
      },
    },
    {
      path: "/receive-webhook",
      method: ["GET"],
      handler: (req, res) => {
        res.end('Working');
      },
    },
  ],
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
