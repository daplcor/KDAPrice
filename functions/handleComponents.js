const { Collection, Client } = require("discord.js");
const { readdirSync, existsSync } = require("fs");
const { green, yellow, red } = require("chalk");
const path = require("path");

/**
 * @param {string} folderPath - Path to component folder.
 * @param {Client} client - Discord Client.
 */

async function handleComponents(folderPath, client) {
  if (!existsSync(folderPath))
    throw new Error(
      red(`{Component Handler} - Path provided doesn't exist.\n'${folderPath}'`)
    );

  const pathArray = folderPath.split("/");
  const componentFolders = readdirSync(folderPath);
  client.modals = new Collection();
  client.buttons = new Collection();
  client.selectMenus = new Collection();
  client.contextMenus = new Collection();

  for (const folder of componentFolders) {
    const componentFiles = readdirSync(`${folderPath}/${folder}`).filter(
      (file) => file.endsWith(".js")
    );

    switch (folder) {
      case "modals":
        for (const file of componentFiles) {
          const modal = require(path.join(
            require.main.path,
            pathArray[pathArray.length - 1],
            "modals",
            file
          ));

          if (modal == {} || !modal.data)
            throw new Error(
              red(
                `{Modal Handler} - Modal is missing data.\n'${folderPath}/${folder}/${file}'`
              )
            );

          client.modals.set(modal.data.name, modal);
          console.log(green(`{Modal Handler} - "${modal.data.name}" modal registered.`));
        }
        break;

      case "buttons":
        for (const file of componentFiles) {
          const button = require(path.join(
            require.main.path,
            pathArray[pathArray.length - 1],
            "buttons",
            file
          ));

          if (button == {} || !button.data)
            throw new Error(
              red(
                `{Button Handler} - Button is missing data.\n'${folderPath}/${folder}/${file}'`
              )
            );

          client.buttons.set(button.data.name, button);
          console.log(green(`{Button Handler} - "${button.data.name}" button registered.`));
        }
        break;

      case "selectMenus":
        for (const file of componentFiles) {
          const selectMenu = require(path.join(
            require.main.path,
            pathArray[pathArray.length - 1],
            "selectMenus",
            file
          ));

          if (selectMenu == {} || !selectMenu.data)
            throw new Error(
              red(
                `{Select Menu Handler} - Select Menu is missing data.\n'${folderPath}/${folder}/${file}'`
              )
            );

          client.selectMenus.set(selectMenu.data.name, selectMenu);
          console.log(
            green(`{Select Menu Handler} - "${selectMenu.data.name}" select menu registered.`)
          );
        }
        break;

      case "contextMenus":
        for (const file of componentFiles) {
          const contextMenu = require(path.join(
            require.main.path,
            pathArray[pathArray.length - 1],
            "contextMenus",
            file
          ));

          if (contextMenu == {} || !contextMenu.data)
            throw new Error(
              red(
                `{Select Menu Handler} - Select Menu is missing data.\n'${folderPath}/${folder}/${file}'`
              )
            );

          client.contextMenus.set(contextMenu.data.name, contextMenu);
          console.log(
            green(`{Context Menu Handler} - "${contextMenu.data.name}" context menu registered.`)
          );
        }
        break;

      default:
        console.log(
          yellow(
            `{!} Folder "${folderPath}/${folder}" isn't a valid component folder.`
          )
        );
        break;
    }
  }
}

module.exports = handleComponents;