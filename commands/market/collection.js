const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('collection')
		.setDescription('Returns collection Modal'),
	async execute(interaction, client) {
        const modal = new ModalBuilder()
        .setCustomId(`new-collection`)
        .setTitle('New Collection')

        const textInput = new TextInputBuilder()
        .setCustomId(`collectionInput`)
        .setLabel(`Collection Name`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const sizeInput = new TextInputBuilder()
        .setCustomId(`collectionSize`)
        .setLabel(`Collection Size`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const firstActionRow = new ActionRowBuilder().addComponents(textInput);
		const secondActionRow = new ActionRowBuilder().addComponents(sizeInput);

        modal.addComponents(firstActionRow, secondActionRow);
        
        await interaction.showModal(modal);
},
};