const { MongoClient } = require('mongodb');
const _ = require('lodash');
require('dotenv').config();

const uri = process.env.MONGODB_CONNECTION_STRING;
const mongoCon = new MongoClient(uri);

let changeStream;

// Connect and init stream 
async function initStream(dbName, collection, channel) {
  await mongoCon.connect();
  // const db = mongoCon.db(dbName);

  const coll = mongoCon.db(dbName).collection(collection);  

  changeStream = coll.watch();

  // changeStream.on('change', handleChange);
  changeStream.on('change', change => {

    if (change.operationType === 'insert') {

      const { account, nftid } = change.fullDocument;
      const updatedAccountPath = 'rowdata.$d.account';
  
  const updatedAccount = _.get(change.fullDocument, updatedAccountPath);

  console.log(`Updated account: ${updatedAccount}`);
      console.log(`Inserted: ${nftid} - ${updatedAccount}`);
    
      channel.send(`Just minted ${nftid} by ${updatedAccount}`);
    
    }
  
    if (change.operationType === 'update') {
  console.log(change)
      const { documentKey, updateDescription } = change;
    
      const id = documentKey._id; // get _id from documentKey, we need to strip after t:
    
      const updatedAccountPath = 'rowdata.$d.account';
  
  const updatedAccount = _.get(change.updateDescription.updatedFields, updatedAccountPath);

  console.log(`Updated account: ${updatedAccount}`);

      console.log(`Updated: ${id} - ${updatedAccount}`);  
    
      channel.send(`${updatedAccount} now owns ${id}`); 
    
    }

  });

  

  function handleChange(change) {
    channel.send(/* handle change */); 
  }

} 

// Close stream
async function closeStream() {
  // Will need to configure this.
}

module.exports = {
  initStream,
  closeStream
}