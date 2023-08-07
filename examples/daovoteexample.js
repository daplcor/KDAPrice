// const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');



// module.exports = {
// 	data: new SlashCommandBuilder()
//     .setName('daovote')
//     .setDescription('Choose your Proposal'),
// 	async execute(interaction) {
// 		const select = new StringSelectMenuBuilder()
// 			.setCustomId('daovote')
// 			.setPlaceholder('Make a selection!')
// 			.addOptions(
// 				new StringSelectMenuOptionBuilder()
// 					.setLabel('Proposal1')
// 					.setDescription('You got the heebie jeebies')
// 					.setValue('Proposal1'),
// 				new StringSelectMenuOptionBuilder()
// 					.setLabel('Proposal2')
// 					.setDescription('catch a fish')
// 					.setValue('Proposal2'),
// 			);

// 		const row = new ActionRowBuilder()
// 			.addComponents(select);

// 		await interaction.reply({
// 			content: 'Choose your Proposal',
// 			components: [row],
// 		});
// 	},
// };