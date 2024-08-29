const { localCommand, pactFetchLocal, localAndSend } = require("./kadena");

const networkId = "mainnet01";
const chainId = "1";
const networkUrl = `https://api.chainweb.com/chainweb/0.0/${networkId}/chain/${chainId}/pact`;

// Amir to change this to dynamically read from mongo for DAO value mapped to GUILD ID but I didn't see the need
// Pact code to get pending votes
const pactCode = `(n_7763cd0330f59f3c66e431dcd63a2c5c5e2e0b70.dao-hive-factory.get-dao-propositions "KoaJuMV5_0uR3u8HCyWwQnAGHLy3MZmbLLjfTr8e8xQ")`;
// KoaJuMV5_0uR3u8HCyWwQnAGHLy3MZmbLLjfTr8e8xQ SWARMS ID
// WdQXk3W_Ivdj14zpyJXa1c3aIGn3Fd93hywopaoi6Ug DISCORD TEST ID
// FXmVqzWLIU0nA8GQf5ANVQYbZAz7rnkxx9gjtIqrQXg RONDAO
// Make local Pact call
const getPendingVotes = async () => {
  console.log("getpendingvotes");
// ADD SOME LOGIC TO NOT DISPLAY if proposal_end_time
  try {
    const localRes = await pactFetchLocal(pactCode);
    // console.log("after localres", localRes[0].voting_options)
    // Handle success
    if (localRes != null) {
      return localRes;
    }

    // Handle error
    else {
      throw new Error(localRes);
    }
  } catch (err) {
    console.error("Error getting pending votes: ", err);
    throw err;
  }
};

const daoVoteClick = async (interaction, action, proposalId, account, voteClick, session, client, sessionTopic) => {
  // console.log("daoVoteClick");
  // console.log("action", action);
  // console.log("proposal", proposalId);
  // console.log("account", account);
  // console.log("voteClick", voteClick);
  const discordDao = "KoaJuMV5_0uR3u8HCyWwQnAGHLy3MZmbLLjfTr8e8xQ";
  const daoClickCode = `(n_7763cd0330f59f3c66e431dcd63a2c5c5e2e0b70.dao-hive-factory.create-proposal-vote "${account}" "${discordDao}" "${proposalId}" ${voteClick})`;
  const daoClickCaps = [
    createCap("Gas", "Allows paying for gas", "coin.GAS", []),
    createCap("ACCOUNT_GUARD", "Dao Accont Guard", "n_7763cd0330f59f3c66e431dcd63a2c5c5e2e0b70.dao-hive-factory.ACCOUNT_GUARD", [account]),
    createCap("Prove DAO Membership", "Prove DAO Membership", "n_7763cd0330f59f3c66e431dcd63a2c5c5e2e0b70.dao-hive-factory.MEMBERS_GUARD", [discordDao, account]),
  ];
  const envData = {};
  const chainId = "1"; // chain ID for the transaction
console.log("BEFORE LOCAL TRY BLOCK")
  try {
    // Use localAndSend to send the transaction
    const result = await localAndSend(account, chainId, daoClickCode, envData, daoClickCaps, session, client, sessionTopic);
    console.log('result', result);

    // Handle success
    if (result != null) {
      return result;
    }
    // Handle error
    else {
      throw new Error(result);
    }
  } catch (err) {
    console.error("Error submitting DAO vote: ", err);
    throw err;
  }
};

const createCap = (role, description, name, args) => {
  return {
    role: role,
    description: description,
    cap: {
      name: name,
      args: args,
    }
  }
  // return Pact.lang.mkCap(role, description, name, args);
}

module.exports = { getPendingVotes, daoVoteClick };

