const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const daovote = require("../commands/buttons/daovote");
const { daoVoteClick } = require("../utils/daofunctions");
const { loadWalletConnectSession } = require("../utils/wc3");
exports.handleCollectionModal = async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === "new-collection") {
    await interaction.reply({
      content: `New Collection is: ${interaction.fields.getTextInputValue(
        "collectionInput"
      )} with ${interaction.fields.getTextInputValue("collectionSize")} NFTs`,
    });
  }
  if (interaction.customId === "new-intakeform") {
    await interaction.reply({
      content: `Project: ${interaction.fields.getTextInputValue(
        "intakeName"
      )} Description: ${interaction.fields.getTextInputValue(
        "intakeDescription"
      )} 
			Contact: ${interaction.fields.getTextInputValue(
        "intakeContact"
      )} Whitelist: ${interaction.fields.getTextInputValue("intakeWl")} `,
    });
  }
};

const selectedValuesMap = new Map();

exports.handleDaoVoteModal = async (interaction) => {
  let votes;
  // let proposalId;
  if (interaction.commandName === "daovote") {
    const result = await daovote.execute(interaction);
    votes = result.votes;
    // console.log("Votes after daovote command:", votes);

    await interaction.reply({
      content: result.content,
      components: result.components,
    });
  } else if (interaction.isStringSelectMenu()) {
    const result = await daovote.execute(interaction);
    console.log("result", result.votes);
    votes = result.votes;
    // console.log("Votes after string select menu:", votes);
    const selected = interaction.values[0];
    selectedValuesMap.set(interaction.user.id, selected);

    // const selected = interaction.values[0]; // Define selected based on the interaction values
    const selectedVote = votes.find(
      (v) => v.proposition.proposal_title === selected
    );
    console.log("selected", selected);

    // proposalId = selectedVote.proposition.proposal_id;    // Find the selected vote options
    const voteOptions = votes.find(
      (v) => v.proposition.proposal_title === selected
    ).voting_options; // Define voteOptions based on the selected proposal
    // Build dynamic buttons
    const buttons = [];

    for (const [index, option] of voteOptions.entries()) {
      const proposalId = selectedVote.proposition.proposal_id;
      const incrementedIndex = index + 1; // Increment the index by 1
      const customId = `${option.vote_option.action}|${incrementedIndex}|${proposalId}`;
      console.log("Custom", customId)
      const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(option.vote_option.action)
        .setStyle("Primary");
      buttons.push(button);
    }

    const row = new ActionRowBuilder().addComponents(buttons);
    await interaction.reply({
      content: `Cast your vote for ${selected}`,
      components: [row],
    });
  } else if (interaction.isButton()) {
    await interaction.deferReply();
    const selected = selectedValuesMap.get(interaction.user.id);
    if (!selected) {
      console.error('Selected value not found for user:', interaction.user.id);
      return; 
    }
    const [action, voteClick, proposalId] =
      interaction.customId.split("|");
    
    if (voteClick === -1) {
      console.error(`Invalid action: ${action}`);
      return;
    }
    
    try {
      // Fetch the user's client and session data
      const { client, account, session, sessionTopic } =
        await loadWalletConnectSession(interaction.user, interaction);
      console.log("prop1", account);

      // Call the blockchain function to vote
      const response = await daoVoteClick(
        interaction,
        action,
        proposalId,
        account,
        voteClick,
        session,
        client,
        sessionTopic
      );

      // Check if response.reqKey is undefined
      if (typeof response.reqKey === "undefined") {
        throw new Error("Transaction key is undefined");
      }
      // Create an embed with the transaction details
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Vote Transaction Details")
        .addFields(
          { name: "Action", value: action },
          { name: "Proposal Title", value: selected },
          { name: "Transaction Key", value: response.reqKey }
        );

		// await interaction.deferReply(); 


      await interaction.followUp({ embeds: [embed] });

        // await interaction.reply(
        //   `You voted ${action} on proposal ${proposalTitle} with Transaction Key: ${response.reqKey}`
        // );
    } catch (error) {
		console.error('Detailed Error:', error);
      // If an error occurs, send a message to the user
      await interaction.editReply(`Vote Failed: ${error.message}`);
    }
  }
};

exports.handleCommandInputModal = async (interaction, client) => {
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
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
};
