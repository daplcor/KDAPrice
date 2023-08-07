const { Collection, REST, Routes } = require("discord.js");
const { readdirSync, existsSync } = require("fs");
const { green, yellow, red } = require("chalk");
const path = require("path");

/**
 * @param {string} folderPath - Path to commands folder.
 * @param {Client} client - Discord Client.
 * @param {string} guildId - The ID of the guild the commands will work in.
 * @param {string} token - Discord Client's token.
 */

async function handleGuildCommands(
  folderPath,
  client,
  clientId,
  guildId,
  token
) {
  if (!existsSync(folderPath))
    throw new Error(
      red(
        `{Guild Command Handler} - Path provided doesn't exist.\n'${folderPath}'`
      )
    );

  const pathArray = folderPath.split("/");
  const commandFolders = readdirSync(folderPath);
  client.commands = new Collection();
  client.commandArray = [];

  for (const folder of commandFolders) {
    const commandFiles = readdirSync(`${folderPath}/${folder}`);
    for (const file of commandFiles) {
      const command = require(path.join(
        require.main.path,
        pathArray[pathArray.length - 1],
        folder,
        file
      ));

      if (command == {} || !command.data)
        throw new Error(
          red(
            `{Guild Command Handler} - Command is missing data.\n'${folderPath}/${folder}/${file}'`
          )
        );

      client.commands.set(command.data.name, command);
      client.commandArray.push(command.data.toJSON());
      console.log(
        green(`{Guild Command Handler} - "${command.data.name}" command registered.`)
      );
    }
  }

  try {
    console.log(yellow("Started refreshing application (/) commands."));
    const rest = new REST({ version: "9" }).setToken(token);

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: client.commandArray,
    });

    console.log(
      green(
        "Successfully reloaded application (/) commands. They're ready to use!"
      )
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports = handleGuildCommands;