<div align="center">
	<br />
	<p>
		<img src="https://cdn.discordapp.com/attachments/1005463875078078485/1028623915708334080/dscbots.png" width="546" alt="dscbots.js" />
	</p>
	<br />
</div>

> ! Note - I'm currently rewriting this project ! 

## Credits
[Goodsie](https://github.com/gidsola) - Helping me with the websocketmanager

## About

dscbots.js is a Node.js module that allows you to interact with the
Discord API without any complications.


- Performant
- 100% coverage of the Discord API
  
## Usage
** **
**Node.js 16.9.0 or newer is required.**

Installing dscbots.js:

```sh-session
npm install dscbots.js
yarn add dscbots.js
pnpm add dscbots.js
```

Setup your bot with the following code:

```js
const Dbot = require('dscbots.js')
const bot = new Dbot.Bot({
    intents: [Dbot.Intents.FLAGS.GUILD_MESSAGES, Dbot.Intents.FLAGS.DIRECT_MESSAGES],
    token: "<Bot Token>"
})

bot.Create(function () {
   console.log(`${bot.user.tag} is ready.`)
});
```

Afterwards we can create a quite simple message command:


```js
const Dbot = require('dscbots.js')
const bot = new Dbot.Bot({
    intents: [Dbot.Intents.FLAGS.GUILD_MESSAGES, Dbot.Intents.FLAGS.DIRECT_MESSAGES],
    token: "<Bot Token>"
})

bot.on('message', (message) => {
    if (message.author.isBot) return;
    
    if (message.content === '!hello') {
        message.reply("Hi!");
    }
})

bot.Create(function () {
   console.log(`${bot.user.tag} is ready.`)
});
```

You can also set your activity!

```js
const Dbot = require('dscbots.js')
const bot = new Dbot.Bot({
    intents: [Dbot.Intents.FLAGS.GUILD_MESSAGES, Dbot.Intents.FLAGS.DIRECT_MESSAGES],
    token: "<Bot Token>"
})

bot.Create(function () {
   console.log(`${bot.user.tag} is ready.`)
   bot.user.setActivity("This server!", "WATCHING");
   //Dbot.activities - Returns a list of activities available.
   // There is currently 2,5s delay to not cause ratelimit!
});
```

And you can set the your bot to be on phone.

```js
const Dbot = require('dscbots.js')
const bot = new Dbot.Bot({
    intents: [Dbot.Intents.FLAGS.GUILD_MESSAGES, Dbot.Intents.FLAGS.DIRECT_MESSAGES],
    token: "<Bot Token>",
    device: Dbot.devices.mobile
    // You can also remove this option, it's not required!
})

bot.Create(function () {
   console.log(`${bot.user.tag} is ready.`)
   bot.user.setActivity("This server!", "WATCHING");
});
```

For more information go to [dscbots.js Server](https://discord.gg/YM9KxHpcWb)!

## Help

If you don't understand something in the package, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [dscbots.js Server](https://discord.gg/YM9KxHpcWb).