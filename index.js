require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.SLACK_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  port: process.env.SLACK_PORT || 3000,
  socketMode: true,
});

app.message('bot', async ({ message, say }) => {
    await say(`Por que está falando de mim, <@${message.user}> ?`);
  });

(async () => {
  await app.start();
  console.log("Bolt app started");
})();
