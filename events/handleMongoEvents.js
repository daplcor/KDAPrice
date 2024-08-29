// const { connection } = require("mongoose");
// const { readdirSync, existsSync } = require("fs");
// const { green, red } = require("chalk");
// const path = require("path");

// /**
//  * @param {string} folderPath - Path to component folder.
//  * @param {Client} client - Discord Client.
//  */

// async function handleMongoEvents(folderPath, client) {
//   if (!existsSync(folderPath))
//     throw new Error(
//       red(
//         `{MongoDB Event Handler} - Path provided doesn't exist.\n'${folderPath}'`
//       )
//     );

//   const pathArray = folderPath.split("/");
//   const eventFiles = readdirSync(folderPath).filter((file) =>
//     file.endsWith(".js")
//   );

//   for (const file of eventFiles) {
//     const event = require(path.join(
//       require.main.path,
//       pathArray[pathArray.length - 2],
//       pathArray[pathArray.length - 1],
//       file
//     ));
//     event.once
//       ? connection.once(event.name, (...args) => event.execute(...args, client))
//       : connection.on(event.name, (...args) => event.execute(...args, client));
//     console.log(green(`{MongoDB Event Handler} - "${event.name}" event registered.`));
//   }
// }

// module.exports = handleMongoEvents;








// MORE THINGS 
// Example code to connect to MongoDB and stream events to specific channels
// I recommend using whatever streamer or method is easiest for your needs
// const uri = process.env.MONGODB_CONNECTION_STRING;
// const mongoCon = new MongoClient(uri);

// async function connect() {
//   await mongoCon.connect();
//   const channel = client.channels.cache.get(channelId);

//   const coll = mongoCon.db('dao').collection('swarmsmessages');

//   const changeStream = coll.watch();
//   console.log("from mongo.js");

//   changeStream.on('change', async change => {
//     console.log(change.fullDocument.message);
//     // Emit event with change 
// 	// If operationType: 'insert', 'update' or 'delete' 
// 	channel.send(change.fullDocument.message)
//   });
// } 



// async function connect() {
// 	await mongoCon.connect();
  
// 	const coll = mongoCon.db('dao').collection('dtest');
// 	const changeStream = coll.watch();
  
// 	console.log("from mongo.js");
  
// 	changeStream.on('change', async change => {
// 	  console.log(change.fullDocument.message);
  
// 	  // Loop over all channel IDs
// 	  for (const channelId of channelIds) {
// 		// Get the channel by its ID
// 		const channel = client.channels.cache.get(channelId);
  
// 		// Check if the channel exists
// 		if (!channel) {
// 		  console.error(`Channel with ID ${channelId} does not exist`);
// 		  continue;
// 		}
  
// 		// If operationType: 'insert', 'update' or 'delete' 
// 		channel.send(change.fullDocument.message);
// 	  }
// 	});
//   }