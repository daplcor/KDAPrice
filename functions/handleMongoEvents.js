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