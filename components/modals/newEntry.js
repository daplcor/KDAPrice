const { EmbedBuilder } = require('discord.js');

module.exports = {

    async execute(interaction) {

    const name = interaction.fields.getTextInputValue('collectionInput');
    const size = interaction.fields.getTextInputValue('collectionSize');

    const embed = new EmbedBuilder()
      .setTitle('New Collection')
      .addFields(
        { name: 'Name', value: name },
        { name: 'Size', value: size }  
      );

    await interaction.reply({
      embeds: [embed] 
    });

  }

}

// module.exports = {
//     data: {
//         name: `new-collection`
//     },
//     async execute(interaction, client) {
//        await interaction.reply({
//             content: `New Collection is: ${interaction.fields.getTextInputValue("collectionInput")}`            
//         })
//     }
// }