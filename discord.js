const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, GatewayIntentBits, Events} = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Use your own channelId
const channelId = '1133046453661601887';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Only necessary to connect to mongo or other data streamer
client.on('ready', async () => {
	await connect();
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.login(process.env.DISCORD_TOKEN);

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});



// Example code to connect to MongoDB and stream events to specific channels
// I recommend using whatever streamer or method is easiest for your needs
const uri = process.env.MONGODB_CONNECTION_STRING;
const mongoCon = new MongoClient(uri);

async function connect() {
  await mongoCon.connect();
  const channel = client.channels.cache.get(channelId);

  const coll = mongoCon.db('dao').collection('dtest');

  const changeStream = coll.watch();
  console.log("from mongo.js");

  changeStream.on('change', async change => {
    console.log(change.fullDocument.message);
    // Emit event with change 
	// If operationType: 'insert', 'update' or 'delete' 
	channel.send(change.fullDocument.message)
  });
} 
