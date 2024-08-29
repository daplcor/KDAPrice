const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { SignClient } = require("@walletconnect/sign-client");
const { pactFetchLocal } = require("./kadena.js");
const { Core } = require("@walletconnect/core");
const { coreStorage } = require("./core.js");
const {
  db,
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
} = require("./lokidb.js");
// ##### NOTE FOR AMIR DUH, remember to check out pm2 for handling app crashes
const apiHost = "https://kadenaiconnect.com";
// const apiHost = "http://localhost:3000";
const sqlApiKey = process.env.SQL_API_KEY;
const bridge = "https://bridge.walletconnect.org"; // WalletConnect bridge URL
const apicall = "discord";

const functionMap = {
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

// Define the state object to store the current session and account
 const state = {
  client: null,
  session: null,
  account: null,
  pairing: null,
  pubKey: null,
};

 async function showWalletHolderModal(interaction, uri) {
  try {
    // Retrieve the channel using the stored channel ID
    const channel = interaction.channel;
    if (!channel) {
      console.error(`Channel not found: ${client.walletChannelId}`);
      return;
    }
    console.log("uri", uri);
    // Generate the QR code image
    const qrCodeBuffer = await QRCode.toBuffer(uri);

    // Generate a unique file name for the QR code attachment
    const fileName = `qr_code_${uuidv4()}.png`;

    // Send the QR code as an attachment in Discord
    await channel.send({
      files: [
        {
          attachment: qrCodeBuffer,
          name: fileName,
        },
      ],
    });
  } catch (error) {
    console.error("Wallet Holder modal error:", error);
  }
}

// Create a map to store active client instances
const clients = new Map();

// Helper function to check if a client has an active pairing
async function hasActivePairing(client) {
  let allPairings = client.core.pairing.pairings.getAll({ active: true });
  // console.log("afterhasActivePairing", allPairings)
  return allPairings.length > 0;
}

// Helper function to resume a WalletConnect session
async function resumeSession(user, interaction, client) {
  let allPairings = client.core.pairing.pairings.getAll({ active: true });
  const { uri } = await client.connect({
    pairingTopic: allPairings[0].topic,
    metadata,
    requiredNamespaces: requiredNamespaces,
  });
  if (uri) {
    await showWalletHolderModal(interaction, uri);
  }

  // const bb = await approval();
  // console.log("bb", bb);
}

 async function loadWalletConnectSession(user, interaction) {
  let discordId = user.username;
  let client;
  console.log("loadWalletConnectSession", discordId);
  // console.log("loadWalletConnectSession", discordId);
  // console.log("clients", clients);

  // If client exists, use it; otherwise initialize a new client
  if (clients.has(discordId)) {
    console.log("Using existing client");
    client = clients.get(discordId);
  } else {
    console.log("Initializing new client");
    client = await initializeClient(discordId);
    clients.set(discordId, client);
  }

  // If the client has no active pairing, create a new session
  if (!(await hasActivePairing(client))) {
    console.log("has active pairing");
    const newSession = await createWalletConnectSession(user, interaction);
    clients.set(discordId, newSession.client);
    return newSession;
  }
  // If the client is not connected, resume the session
  else if (client.session && client.session.status !== "connected") {
    await resumeSession(user, interaction, client);
  }

  // Assuming that at this point, client should be connected
  // (either a session was resumed, or a new session was created)
  /* The above code is written in JavaScript and it performs the following tasks: */
  const session = client.session;
  let sessions = session.getAll({ acknowledged: true });

  // find the first session with a 'kadena' namespaced
  let ses = sessions.find((s) => s.namespaces && s.namespaces.kadena);

  // If a session was found, get the first account from the 'kadena' namespace
  if (ses) {
    let sessionTopic = ses.topic;
    let acc = ses.namespaces.kadena.accounts[0];
    let account = "k:" + acc.split(":")[2];
    console.log("CHECK ME", account)
    let pubKey = account.split(":").slice(2).join(":");
    return { client, account, session, sessionTopic, pubKey };
  } else {
    console.error("No session with a kadena namespace found");
    return null; 
  }
}

async function initializeClient(discordId) {
  /* The above code is creating a new object called `userCoreStorage` by spreading the properties of an
  existing object called `coreStorage`. It then adds a new property `userId` to the
  `userCoreStorage` object, with the alue being the `username` property of the `user` object. */
  const userCoreStorage = {
    ...coreStorage,
    userId: discordId,
  };

  // Helper function to initialize a WalletConnect client
  const core = new Core({
    projectId: "424f54bf8120b5a0734fc9fc0d2c7cb2",
    relayUrl: "wss://relay.walletconnect.com",
    storage: userCoreStorage,
  });

  const client = await SignClient.init({
    core,
    metadata,
    relayProvider: "wss://relay.walletconnect.org",
    logger: "trace",
  });

  // Log all events for debugging
  // client.on("*", (event, data) => console.log(`Event: ${event}`, data));

  // Subscribe to events
  client.on("session_update", handleSessionUpdate);
  client.on("session_delete", handleSessionDelete);

  return client;
}

async function handleSessionUpdate(user, { topic, params }) {
  const { namespaces } = params;
  const updatedSession = { ...client.session.get(topic), namespaces };

  // Store updated session data in LokiDB with the Discord user's ID
  await storeSessionData(user.username, topic, updatedSession);
}

// async function handleSessionDelete(user, { topic }) {
//   // Delete session data from LokiDB
//   await deleteSessionData(user.username, topic);
// }

async function handleSessionDelete(user, event) {
  // Check if the event object and topic property exist
  if (!event || !event.topic) {
    console.warn("handleSessionDelete was called with unexpected parameters:", event);
    return; // Return early to prevent further execution
  }

  const { topic } = event;

  // Delete session data from LokiDB
  await deleteSessionData(user.username, topic);
}

 async function createWalletConnectSession(user, interaction) {
  let discordId = user.username;
  let client = clients.get(discordId);
  // console.log("22222222222createWalletConnectSession", discordId);
  if (!client) {
    console.log("ooofodsfdsfuew8ru8", discordId);
    client = await initializeClient(discordId);

    // Adding the Discord user's ID to the event listeners
    client.on("session_update", (event) => handleSessionUpdate(user, event));
    client.on("session_delete", (event) => handleSessionDelete(user, event));

    clients.set(discordId, client);
  }

  const { uri, approval } = await client.connect({
    metadata,
    requiredNamespaces: requiredNamespaces,
  });

  await showWalletHolderModal(interaction, uri);
  const session = await approval();

  // Store data in LokiDB
  const keys = [
    "proposal",
    "subscription",
    "keychain",
    "messages",
    "history",
    "session",
    "expirer",
    "pairing",
  ];
  for (let key of keys) {
    const keyWithNamespace = `wc@2:${
      key.startsWith("session") ? "client" : "core"
    }:0.3//${key}`;
    const sessionData = await client.core.storage.getItem(keyWithNamespace);
    const storeFunctionName = `store${
      key.charAt(0).toUpperCase() + key.slice(1)
    }Data`;
    if (functionMap.hasOwnProperty(storeFunctionName)) {
      await functionMap[storeFunctionName](discordId, sessionData);
    }
  }

  // Check if account is already in the database and add if not
  let account =
    "k:" + session.namespaces.kadena.accounts[0].split(":").slice(2).join(":");
  const response = await fetch(`${apiHost}/sqlgrab/${account}`);
  if (!response.ok && response.status !== 404) {
    console.error(
      `Error fetching user data: ${response.status} ${response.statusText}`
    );
    return;
  }

  const accountData = await response.json();
  console.log("accountData", accountData);
  if (response.status === 404) {
    // If the account is not in the database, make a request to add it
    await fetch(`${apiHost}/sqlusers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletaccount: account,
        discord: user.username,
      }),
    });
    console.log("Added user to database");
  } else if (accountData.discord === null) {
    // If the account is in the database but the discord username is null, make a request to update it
    await fetch(`${apiHost}/sqlusers/${encodeURIComponent(account)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discord: user.username,
      }),
    });
    console.log("Updated user in database");
  }

  return { client, user, uri };
}

 async function getUserSession(user) {
  const discordId = user.username;
  if (clients.has(discordId)) {
    let client = clients.get(discordId);

    // Get session and list of acknowledged sessions
    const session = client.session;
    let sessions = session.getAll({ acknowledged: true });

    // Find the first session with a 'kadena' namespace
    let ses = sessions.find((s) => s.namespaces && s.namespaces.kadena);

    // If a session was found, get the first account from the 'kadena' namespace
    if (ses) {
      let acc = ses.namespaces.kadena.accounts[0];
      let account = "k:" + acc.split(":")[2];

      return account;
    } else {
      throw new Error("No session with a kadena namespace found");
    }
  } else {
    throw new Error(
      "No active session found for this user. Please connect a wallet with the /wallet command."
    );
  }
}

 async function getUserBalance(account) {
  const response = await pactFetchLocal(`(coin.get-balance "${account}")`);
  if (response) {
    return response;
  } else {
    throw new Error(`Unable to fetch balance for account: ${account}`);
  }
}

 async function tipFinder(discordId) {
  // const response = await fetch(`${apiHost}/disc/${discordId}`)
  const response = await fetch(`${apiHost}/disc/${discordId}`, {
    headers: {
      "x-api-key": sqlApiKey,
    },
  });
  // console.log("response", response)
  if (!response.ok && response.status !== 404) {
    console.error(
      `Error fetching user data: ${response.status} ${response.statusText}`
    );
    return null;
  }
  const data = await response.json();
  // console.log("data", data.walletaccount)
  return data.walletaccount;
}

// const response = await fetch(`${apiHost}/disc/${discordId}`, {
//   headers: {
//   'x-api-key': sqlApiKey,
// },
// });

/* The code below is defining an object called `requiredNamespaces` which contains information about
the Kadena blockchain. It specifies the available methods, chains, and events for the Kadena
namespace. Specifically, it lists three methods: `kadena_getAccounts_v1`, `kadena_sign_v1`, and
`kadena_quicksign_v1`, one chain: `kadena:mainnet01`, and an empty array for events. This object can
be used as a reference for developers who are building applications that interact with the Kadena
blockchain. */
const requiredNamespaces = {
  kadena: {
    methods: ["kadena_getAccounts_v1", "kadena_sign_v1", "kadena_quicksign_v1"],
    chains: ["kadena:mainnet01"],
    events: [],
  },
};

// Used for inititing new WalletConnect sessions
const metadata = {
  name: "Kadenai Discord Bot",
  description: "Full service NFT services designed for creators",
  url: "https://kadenai.com",
  icons: ["https://main--kadenai.netlify.app/images/md.png"],
};

const projectId = "424f54bf8120b5a0734fc9fc0d2c7cb2";
const relayUrl = "wss://relay.walletconnect.com";


module.exports = {
  state,
  showWalletHolderModal,
  loadWalletConnectSession,
  createWalletConnectSession,
  getUserSession,
  getUserBalance,
  tipFinder,
};