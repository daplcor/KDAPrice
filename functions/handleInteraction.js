const { BaseInteraction } = require("discord.js");

/**
 * @param {BaseInteraction} interaction - The interaction.
 * @param {Client} client - Discord Client.
 */

async function handleInteraction(interaction, client) {
  if (interaction.isChatInputCommand()) {
    const { commands } = client;
    const { commandName } = interaction;
    const command = commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `Something went wrong while executing this command...`,
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    const { buttons } = client;
    const { customId } = interaction;
    const button = buttons.get(customId);
    if (!button) return new Error("There is no code for this button.");

    try {
      await button.execute(interaction, client);
    } catch (err) {
      console.error(err);
    }
  } else if (interaction.isStringSelectMenu()) {
    const { selectMenus } = client;
    const { customId } = interaction;
    const menu = selectMenus.get(customId);
    if (!menu) return new Error("There is no code for this select menu.");

    try {
      await menu.execute(interaction, client);
    } catch (error) {
      console.error(error);
    }
  } else if (interaction.isModalSubmit()) {
    const { modals } = client;
    const { customId } = interaction;
    const modal = modals.get(customId);
    if (!modal) return new Error("There is no code for this modal.");

    try {
      await modal.execute(interaction, client);
    } catch (error) {
      console.error(error);
    }
  } else if (interaction.isContextMenuCommand()) {
    const { commands } = client;
    const { commandName } = interaction;
    const contextCommand = commands.get(commandName);
    if (!contextCommand) return;

    try {
      await contextCommand.execute(interaction, client);
    } catch (error) {
      console.error(error);
    }
  } else if (interaction.isAutocomplete()) {
    const { commands } = client;
    const { commandName } = interaction;
    const command = commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = handleInteraction;