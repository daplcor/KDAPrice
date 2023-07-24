const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_CONNECTION_STRING;
const mongoCon = new MongoClient(uri);

async function connect() {
  await mongoCon.connect();

  const coll = mongoCon.db('dao').collection('dtest');

  const changeStream = coll.watch();
  console.log("from mongo.js");

  changeStream.on('change', async change => {
    console.log(change);
    // Emit event with change 
    mongoCon.emit('mongoChange', change);
  });
} 

module.exports = { mongoCon, connect };