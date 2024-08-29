const {db, getDataCollection} = require('./lokidb.js');


const coreStorage = {
          async getKeys() {
            const entriesCollection = getDataCollection();
            return entriesCollection.find().map(entry => entry.key);
          },
          async getEntries() {
            const entriesCollection = getDataCollection();
            return entriesCollection.find().map(entry => [entry.key, entry.value]);
          },
          async getItem(key) {
            const entriesCollection = getDataCollection();
            const userKey = `${this.userId}:${key}`;
            const entry = entriesCollection.findOne({ key: userKey });
            return entry ? entry.value : undefined;
          },
          
          async setItem(key, value) {
            const entriesCollection = getDataCollection();
            const userKey = `${this.userId}:${key}`;
            let entry = entriesCollection.findOne({ key: userKey });
            if (entry) {
              entry.value = value;
              entriesCollection.update(entry);
            } else {
              entriesCollection.insert({ key: userKey, value });
            }
          },
          
          async removeItem(key) {
            const entriesCollection = getDataCollection();
            const userKey = `${this.userId}:${key}`;
            let entry = entriesCollection.findOne({ key: userKey });
            if (entry) {
              entriesCollection.remove(entry);
            }
          },
       };


       module.exports = {
        coreStorage,
      };

   