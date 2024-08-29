const { SlashCommandBuilder } = require('discord.js');
const { loadWalletConnectSession } = require('../../utils/wc3'); // Make sure to adjust the path

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wallet')
    .setDescription('Connect to the wallet and retrieve account information'),

  async execute(interaction) {
    console.log('Calling /wallet command');

    // Acknowledge the interaction immediately
    await interaction.deferReply();

    try {
      const { client, user, session } = await loadWalletConnectSession(interaction.user, interaction);

      if (session && session.namespaces && session.namespaces.kadena) {
        // Update your initial response with the success message
        await interaction.editReply(`You are already connected ${user}.`);
      } else {
        // Update your initial response with a different message or do something else
        await interaction.editReply(`Previous Session not found for ${user.username}`);
      }

    } catch (error) {
      // If an error occurs, update your initial response with the error message
      await interaction.editReply(`Failed to load WalletConnect session: ${error.message}`);
    }
  }
}
