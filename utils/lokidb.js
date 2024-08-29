const loki = require("lokijs");

// Initialize Loki database
const db = new loki("walletconnect.db", {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000,
});

let dataCollection;

db.defaultTTL = 24 * 60 * 60 * 1000; // 1 day

// Implement the autoloadback referenced above
function databaseInitialize() {
  // If the database did not exist it will be empty so I will intitialize here
  dataCollection = db.getCollection("entries");
  if (dataCollection === null) {
    dataCollection = db.addCollection("entries");
  }

  // // Reconnect to any stored sessions
  // dataCollection.find({ type: 'wc@2:client:0.3//session' }).forEach(storedSession => {
  //     reconnectToSession(storedSession.data); // Assuming reconnectToSession is a function you defined elsewhere
  //   });

  // console.log("Database initialized.");
}

function getDataCollection() {
  return dataCollection;
}

function storeData(type, discordId, data) {
  dataCollection.insert({ type, discordId, data });
}

function fetchData(type, discordId) {
  return dataCollection.find({ type, discordId });
}

function updateData(type, discordId, newData) {
  dataCollection.findAndUpdate({ type, discordId }, (record) => {
    record.data = newData;
  });
}

function deleteData(type, discordId) {
  dataCollection.findAndRemove({ type, discordId });
}

// Predefined data insertions
function storeProposalData(discordId, data) {
  storeData("wc@2:client:0.3//proposal", discordId, data);
}

function storeSubscriptionData(discordId, data) {
  storeData("wc@2:core:0.3//subscription", discordId, data);
}

function storeKeychainData(discordId, data) {
  storeData("wc@2:core:0.3//keychain", discordId, data);
}

function storeMessagesData(discordId, data) {
  storeData("wc@2:core:0.3//messages", discordId, data);
}

function storeHistoryData(discordId, data) {
  storeData("wc@2:core:0.3//history", discordId, data);
}

// module.exports = function storeSessionData(discordId, data) {
//   storeData('wc@2:client:0.3//session', discordId, data);
// }

function storeSessionData(discordId, data) {
  const ttl = 1000 * 60 * 60 * 24; // 1 day

  db.dataCollection.insert({
    type: "session",
    discordId,
    data,
    ttl,
  });
}

function storeExpirerData(discordId, data) {
  storeData("wc@2:core:0.3//expirer", discordId, data);
}

function storePairingData(discordId, data) {
  storeData("wc@2:core:0.3//pairing", discordId, data);
}

// Predefined data fetch functions
function fetchProposalData(discordId) {
  return fetchData("wc@2:client:0.3//proposal", discordId);
}

function fetchSubscriptionData(discordId) {
  return fetchData("wc@2:core:0.3//subscription", discordId);
}

function fetchKeychainData(discordId) {
  return fetchData("wc@2:core:0.3//keychain", discordId);
}

function fetchMessagesData(discordId) {
  return fetchData("wc@2:core:0.3//messages", discordId);
}

function fetchHistoryData(discordId) {
  return fetchData("wc@2:core:0.3//history", discordId);
}

function fetchSessionData(discordId) {
  return fetchData("wc@2:client:0.3//session", discordId);
}

function fetchExpirerData(discordId) {
  return fetchData("wc@2:core:0.3//expirer", discordId);
}

function fetchPairingData(discordId) {
  return fetchData("wc@2:core:0.3//pairing", discordId);
}

// Predefined data update functions
function updateProposalData(discordId, updatedData) {
  updateData("wc@2:client:0.3//proposal", discordId, updatedData);
}

function updateSubscriptionData(discordId, updatedData) {
  updateData("wc@2:core:0.3//subscription", discordId, updatedData);
}

function updateKeychainData(discordId, updatedData) {
  updateData("wc@2:core:0.3//keychain", discordId, updatedData);
}

function updateMessagesData(discordId, updatedData) {
  updateData("wc@2:core:0.3//messages", discordId, updatedData);
}

function updateHistoryData(discordId, updatedData) {
  updateData("wc@2:core:0.3//history", discordId, updatedData);
}

function updateSessionData(discordId, updatedData) {
  updateData("wc@2:client:0.3//session", discordId, updatedData);
}

function updateExpirerData(discordId, updatedData) {
  updateData("wc@2:core:0.3//expirer", discordId, updatedData);
}

function updatePairingData(discordId, updatedData) {
  updateData("wc@2:core:0.3//pairing", discordId, updatedData);
}

// Predefined data delete functions
function deleteProposalData(discordId) {
  deleteData("wc@2:client:0.3//proposal", discordId);
}

function deleteSubscriptionData(discordId) {
  deleteData("wc@2:core:0.3//subscription", discordId);
}

function deleteKeychainData(discordId) {
  deleteData("wc@2:core:0.3//keychain", discordId);
}

function deleteMessagesData(discordId) {
  deleteData("wc@2:core:0.3//messages", discordId);
}

function deleteHistoryData(discordId) {
  deleteData("wc@2:core:0.3//history", discordId);
}

function deleteSessionData(discordId) {
  deleteData("wc@2:client:0.3//session", discordId);
}

function deleteExpirerData(discordId) {
  deleteData("wc@2:core:0.3//expirer", discordId);
}

function deletePairingData(discordId) {
  deleteData("wc@2:core:0.3//pairing", discordId);
}

module.exports = {
  db,
  databaseInitialize,
  getDataCollection,
  storeData,
  fetchData,
  updateData,
  deleteData,
  storeProposalData,
  storeSubscriptionData,
  storeKeychainData,
  storeMessagesData,
  storeHistoryData,
  storeSessionData,
  storeExpirerData,
  storePairingData,
  fetchProposalData,
  fetchSubscriptionData,
  fetchKeychainData,
  fetchMessagesData,
  fetchHistoryData,
  fetchSessionData,
  fetchExpirerData,
  fetchPairingData,
  updateProposalData,
  updateSubscriptionData,
  updateKeychainData,
  updateMessagesData,
  updateHistoryData,
  updateSessionData,
  updateExpirerData,
  updatePairingData,
  deleteProposalData,
  deleteSubscriptionData,
  deleteKeychainData,
  deleteMessagesData,
  deleteHistoryData,
  deleteSessionData,
  deleteExpirerData,
  deletePairingData,
};
