const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const coins = require('../../utils/coins');
// Redis is being used to cache prices, feel free to remove it if you don't need it.
const {redisClient} = require('../../utils/redis'); 
const {cachePrice} = require('../../utils/cache'); 

module.exports = {

  data: new SlashCommandBuilder()
    .setName('price')
    .setDescription('Get the current price of a crypto asset')  
    .addStringOption(option => 
      option.setName('coin')
            .setDescription('The coin ticker')
            .setRequired(true)),

            async execute(interaction) {

              try {
          
                const coin = interaction.options.getString('coin').toLowerCase();
          
                const name = coins[coin];
          
                if(!name) {
                  return interaction.reply('Invalid coin!');  
                }
          
                const cacheKey = `price:${name}`;
                
                let price;
          
                try {
                  // Get cached price
                  price = await redisClient.get(cacheKey);
                } catch(err) {
                  console.error('Redis error', err);
                }
          
                if (!price) {
          
                  try {
                    // API call 
                    const resp = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=usd`);
                    price = resp.data[name].usd; 
          
                    // Cache price
                    await cachePrice(name, price);
          
                  } catch (err) {
                    console.error('API Error', err);
                    return interaction.reply('Error getting price!');
                  }
          
                }
          
                // Success
                await interaction.reply(`The price of ${name} (${coin}) is $${price}`);
          
              } catch (err) {
                console.error(err);
                await interaction.reply('Error getting price!'); 
              }
          
            }
};

           