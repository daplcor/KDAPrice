const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Provides information about the server'),
  
  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Server Info')
      .addFields(
        { name: 'Name', value: interaction.guild.name },
        { name: 'Member Count', value: interaction.guild.memberCount.toString() }  
      );

    await interaction.reply({ 
      embeds: [embed]
    });

  }

}