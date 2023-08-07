const { readdirSync, existsSync } = require("fs");
const { green, red } = require("chalk");
const path = require("path");

/**
 * @param {string} folderPath - Path to client event folder.
 * @param {Client} client - Discord Client.
 */

async function handleClientEvents(folderPath, client) {
  if (!existsSync(folderPath))
    throw new Error(
      red(
        `{Client Event Handler} - Path provided doesn't exist.\n'${folderPath}'`
      )
    );

  const pathArray = folderPath.split("/");
  const eventFiles = readdirSync(folderPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of eventFiles) {
    const event = require(path.join(
      require.main.path,
      pathArray[pathArray.length - 2],
      pathArray[pathArray.length - 1],
      file
    ));

    if (event == {} || !event.name)
      throw new Error(
        red(
          `{Client Event Handler} - Event is missing data.\n'${folderPath}/${
            pathArray[pathArray.length - 1]
          }/${file}'`
        )
      );

    event.once
      ? client.once(event.name, (...args) => event.execute(...args, client))
      : client.on(event.name, (...args) => event.execute(...args, client));
    console.log(
      green(`{Client Event Handler} - "${event.name}" event registered.`)
    );
  }
}

module.exports = handleClientEvents;