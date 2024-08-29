const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { initStream } = require("./utils/mongo");
const {
	handleCollectionModal,
	handleDaoVoteModal,
	handleCommandInputModal,
  } = require("./events/customInteractions");
  const walletCommands = require("./commands/server/wallet.js").walletCommands;

require("dotenv").config();

// Use your own channelId
const channelId = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Only necessary to connect to mongo or other data streamer
client.on("ready", async () => {
  // await connect();
  const channelIds = process.env.CHANNEL_IDS.split(",");
console.log(channelIds);
//   const channel = client.channels.cache.get(channelIds);

  initStream("nftDatabase", "chain8ledger", channelIds, client);
});

client.commands = new Collection();
client.modals = new Collection();
client.buttons = new Collection();
// client.selectMenus = new Collection();
// client.commandArray = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const componentFolders = fs.readdirSync("./components");

for (const folder of componentFolders) {
  const componentPath = path.join(__dirname, "components", folder);
  const componentFiles = fs
    .readdirSync(componentPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of componentFiles) {
    const component = require(`./components/${folder}/${file}`);
    client.buttons.set(component.customId, component); // or client.modals, etc.
  }
}

client.on("interactionCreate", (i) => {
  if (!i.isModalSubmit()) return;

  const command = i.client.modals.get(i.customId);

  if (!command) return;

  command.execute(i);
});


client.on("interactionCreate", async (interaction) => {
  if (interaction.isModalSubmit()) {
    const command = interaction.client.modals.get(interaction.customId);
    if (command) {
      command.execute(interaction);
    }
  }
//   if (interaction.isCommand() && interaction.commandName === 'wallet') {
//     // Execute the wallet command
//     const walletCommand = client.commands.get('wallet');
//     if (walletCommand) {
//       await walletCommand.execute(interaction);
//     }
//   }

  await handleCollectionModal(interaction);
  await handleDaoVoteModal(interaction);
  await handleCommandInputModal(interaction, client);
});

// client.handleEvents();
// client.handleCommands();
// client.handleComponents();

client.login(process.env.DISCORD_TOKEN);

// Only handle the generic modal submit
