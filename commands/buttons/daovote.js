const { getPendingVotes } = require('../../utils/daofunctions');
const { ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

let votes;

module.exports = {
	data: new SlashCommandBuilder()
	  .setName('daovote')
	  .setDescription('Choose your Proposal'),
  
	async execute(interaction) {
	  try {
		 votes = await getPendingVotes();
  
		 const options = votes
			.filter(v => !v.proposition.proposal_completed && v.proposition.proposal_title !== undefined)
			.map(v => ({
			  label: v.proposition.proposal_title,
			  value: v.proposition.proposal_title 
			}));
  
		 const select = new StringSelectMenuBuilder()
		   .setCustomId('daovote')
		   .setPlaceholder('Make a selection!')
		   .addOptions(options.length ? options : [{
			 label: 'No Proposals to Vote on at this time',
			 value: 'No Proposals',
			 default: true
		   }]);
  
		 const row = new ActionRowBuilder()
		   .addComponents(select);
  
		 return {
		   content: 'Choose your Proposal',
		   components: [row],
		   votes
		 };
  
	  } catch (err) {
		console.error(err);
		return {
		  content: 'Error getting proposals',
		};
	  }
	}
  }


