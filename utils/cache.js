const {redisClient} = require('./redis'); 

async function cachePrice(name, price) {
    try{
    await redisClient.set(`price:${name}`, price); 
    await redisClient.expire(`price:${name}`, 1800); 
    }catch(err){
        console.log(err);
    }
}

module.exports = {
  cachePrice  
}

