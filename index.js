require("dotenv").config();

const { App } = require("@slack/bolt");

const { Client } = require("asana");

const client = Client.create().useAccessToken(process.env.ACESS_TOKEN);

const app = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.SLACK_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  port: process.env.SLACK_PORT || 3000,
  socketMode: true,
});

client.events
  .get("30994714493547")
  .then((res) => {
    let syncToken = res.sync;
    setInterval(() => {
      client.events.get("30994714493547", syncToken).then((res) => {
        if (res.data.length > 0 && res.data[0].action == "added") {
          app.client.chat
            .postMessage({
              token: process.env.BOT_TOKEN,
              channel: "C02UWCUUSF5",
              text: `
              Acabou de ser adicionada uma task no pool. <@here>
              https://app.asana.com/0/30994714493547/list
              `,
            })
            .catch((error) => {
              console.log(error);
            });
        }

        const syncBase = res.sync.substring(0, res.sync.indexOf(":") + 1);
        const updateNum = res.sync.substring(res.sync.indexOf(":") + 1);
        syncToken = syncBase + updateNum;
      });
    }, 10000);
  })
  .catch((error) => console.log(error));

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
  await app.start();
  console.log("Bolt app started");
})();
