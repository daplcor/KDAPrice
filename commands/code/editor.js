// const { SlashCommandBuilder } = require('discord.js');
// const { ModalBuilder } = require('discord.js');
// const monaco = require('../../utils/monaco');

// module.exports = {

//   data: new SlashCommandBuilder()
//     .setName('code')
//     .setDescription('Opens a Pact code editor'),

//   async execute(interaction) {

//     const modal = new ModalBuilder()
//       .setCustomId('code-modal')
//       .setTitle('Pact Code Editor');

// // Load monaco scripts in modal
// const monacoPromise = initMonaco();
// modal.on('load', () => monacoPromise);

// // Add text input for code
// const codeInput = new TextInputComponent()
//   .setCustomId('code-input')
//   .setLabel('Code') 
//   .setStyle('paragraph');

// modal.addComponents(codeInput);

// // Handle submission  
// modal.on('submit', async (i) => {
//   const code = i.fields.getTextInputValue('code-input'); 
//   // TODO: Handle code save
// });
//     await interaction.showModal(modal);

//   }

// };