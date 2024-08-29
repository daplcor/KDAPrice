const { MongoClient } = require("mongodb");
const _ = require("lodash");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION_STRING;
const mongoCon = new MongoClient(uri);

let changeStream;

async function initStream(dbName, collection, channelIds, client) {
  console.log(channelIds)
  if (!Array.isArray(channelIds) || channelIds.length === 0) {
    console.error("No valid channel IDs provided.");
    return; // Exit if no valid channel IDs
  }
  try {
    await mongoCon.connect();
    const coll = mongoCon.db(dbName).collection(collection);

    changeStream = coll.watch();

    changeStream.on("change", (change) => {
      channelIds.forEach((channelId) => {
        const channel = client.channels.cache.get(channelId.trim()); // Trim to remove any extra whitespace
        if (!channel) {
          console.error(`Channel not found for ID: ${channelId}`);
          return; // Skip this iteration if the channel is not found
        }        if (change.operationType === "delete") {
          // If the operation is a delete, do nothing and return.
          return;
        }
        if (change.operationType === "insert") {
          const { account, nftid } = change.fullDocument;
          const updatedAccountPath = "rowdata.$d.account";
          const updatedAccount = _.get(change.fullDocument, updatedAccountPath);
          channel.send(`Just minted ${nftid} by ${updatedAccount}`);
        }

        if (change.operationType === "update") {
          const { documentKey, updateDescription } = change;
          const id = documentKey._id;
          const updatedAccountPath = "rowdata.$d.account";
          const updatedAccount = _.get(
            change.updateDescription.updatedFields,
            updatedAccountPath
          );
          channel.send(`${updatedAccount} now owns ${id}`);
        }
      });
    });

    changeStream.on("error", (error) => {
      console.error("Error in change stream:", error);
      // I think this is a good place to handle the error, doesn't need to be in channel
    });

    function handleChange(change) {
      channel.send(/* handle change */);
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function closeStream() {
  try {
    await changeStream.close();
  } catch (error) {
    console.error("Error closing change stream:", error);
  }
}

module.exports = {
  initStream,
  closeStream,
};
