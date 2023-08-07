const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, GatewayIntentBits, Events, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const { MongoClient } = require('mongodb');
const { initStream } = require('./utils/mongo');
const daovote = require('./commands/buttons/daovote');

require('dotenv').config();

// Use your own channelId
const channelId = process.env.CHANNEL_ID;
// const channelIds = process.env.CHANNEL_IDS.split(",");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Only necessary to connect to mongo or other data streamer
client.on('ready', async () => {
	// await connect();
	const channel = client.channels.cache.get(channelId);

	initStream('nftDatabase', "chain8ledger", channel);

});



client.commands = new Collection();
client.modals = new Collection();
client.buttons = new Collection();
// client.selectMenus = new Collection();
// client.commandArray = [];

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

// client.handleEvents();
// client.handleCommands();
// client.handleComponents();

client.login(process.env.DISCORD_TOKEN);

// Only handle the generic modal submit 
client.on('interactionCreate', i => {
	if(!i.isModalSubmit()) return;
  
	const command = i.client.modals.get(i.customId);
  
	if(!command) return;
  
	command.execute(i);
  
  })

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId === 'new-collection') {  
		await interaction.reply({
            content: `New Collection is: ${interaction.fields.getTextInputValue("collectionInput")} with ${interaction.fields.getTextInputValue("collectionSize")} NFTs`            
        });
	}
	if (interaction.customId === 'new-intakeform') {  
		await interaction.reply({
            content: `Project: ${interaction.fields.getTextInputValue("intakeName")} Description: ${interaction.fields.getTextInputValue("intakeDescription")} 
			Contact: ${interaction.fields.getTextInputValue("intakeContact")} Whitelist: ${interaction.fields.getTextInputValue("intakeWl")} `            
        });
	}

});

client.on(Events.InteractionCreate, async interaction => {
	// if (interaction.isCommand()) {
		if (interaction.commandName === 'daovote') {

	  const { content, components, votes } = await daovote.execute(interaction);
	  await interaction.reply({ content, components });
	} else if (interaction.isStringSelectMenu()) {
	  // Get votes when needed
	  const { votes } = await daovote.execute(interaction);
	//   console.log("vi", votes)
	  const selected = interaction.values[0];
  
	  // Find the selected vote options
	  const voteOptions = votes.find(v => v.proposition.proposal_title === selected)
		.voting_options;
	  
	  // Build dynamic buttons
	  const buttons = [];
	  
	  for (const option of voteOptions) {
		const button = new ButtonBuilder()
		  .setCustomId(option.vote_option.action + '_' + selected)
		  .setLabel(option.vote_option.action) 
		  .setStyle('Primary');
		
		buttons.push(button);
	  }
	  
	  const row = new ActionRowBuilder().addComponents(buttons);
	  
	  await interaction.reply({
		content: `Cast your vote for ${selected}`,
		components: [row]
	  });
	} else if (interaction.isButton()) {
	  const [action, proposal] = interaction.customId.split('_');
	  await interaction.reply(`You voted ${action} on proposal ${proposal}`);
	}
  });
  

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
// const uri = process.env.MONGODB_CONNECTION_STRING;
// const mongoCon = new MongoClient(uri);

// async function connect() {
//   await mongoCon.connect();
//   const channel = client.channels.cache.get(channelId);

//   const coll = mongoCon.db('dao').collection('swarmsmessages');

//   const changeStream = coll.watch();
//   console.log("from mongo.js");

//   changeStream.on('change', async change => {
//     console.log(change.fullDocument.message);
//     // Emit event with change 
// 	// If operationType: 'insert', 'update' or 'delete' 
// 	channel.send(change.fullDocument.message)
//   });
// } 



// async function connect() {
// 	await mongoCon.connect();
  
// 	const coll = mongoCon.db('dao').collection('dtest');
// 	const changeStream = coll.watch();
  
// 	console.log("from mongo.js");
  
// 	changeStream.on('change', async change => {
// 	  console.log(change.fullDocument.message);
  
// 	  // Loop over all channel IDs
// 	  for (const channelId of channelIds) {
// 		// Get the channel by its ID
// 		const channel = client.channels.cache.get(channelId);
  
// 		// Check if the channel exists
// 		if (!channel) {
// 		  console.error(`Channel with ID ${channelId} does not exist`);
// 		  continue;
// 		}
  
// 		// If operationType: 'insert', 'update' or 'delete' 
// 		channel.send(change.fullDocument.message);
// 	  }
// 	});
//   }
  
