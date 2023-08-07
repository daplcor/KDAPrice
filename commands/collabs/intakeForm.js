const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('intakeform')
		.setDescription('Returns Intake Modal'),
	async execute(interaction, client) {
        const modal = new ModalBuilder()
        .setCustomId(`new-intakeform`)
        .setTitle('New Intake Form')

        const textInput = new TextInputBuilder()
        .setCustomId(`intakeName`)
        .setLabel(`Project Name`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const descInput = new TextInputBuilder()
        .setCustomId(`intakeDescription`)
        .setLabel(`Description`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)

        const contactInput = new TextInputBuilder()
        .setCustomId(`intakeContact`)
        .setLabel(`Contact Info`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        
        const wlInput = new TextInputBuilder()
        .setCustomId(`intakeWl`)
        .setLabel(`White List`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const firstActionRow = new ActionRowBuilder().addComponents(textInput);
		const secondActionRow = new ActionRowBuilder().addComponents(descInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(contactInput);
		const fourthActionRow = new ActionRowBuilder().addComponents(wlInput);


        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
        
        await interaction.showModal(modal);
},
};