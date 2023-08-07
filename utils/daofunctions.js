const {localCommand, pactFetchLocal} = require('./kadena')


const networkId = 'mainnet01' 
const chainId = '1'
const networkUrl = `https://api.chainweb.com/chainweb/0.0/${networkId}/chain/${chainId}/pact` 

// Amir to change this to dynamically read from mongo for DAO value mapped to GUILD ID
// Pact code to get pending votes 
    const pactCode = `(n_7763cd0330f59f3c66e431dcd63a2c5c5e2e0b70.dao-hive-factory.get-dao-propositions "KoaJuMV5_0uR3u8HCyWwQnAGHLy3MZmbLLjfTr8e8xQ")`

// Make local Pact call
const getPendingVotes = async () => {
    console.log("getpendingvotes")
    // console.log("hiiiiii", networkUrl)

  try {
    const localRes = await pactFetchLocal(
      pactCode
    )
    // console.log("after localres", localRes)
    // Handle success
    if(localRes != null) {
      return localRes
    }
    
    // Handle error
    else {
      throw new Error(localRes)
    }

  } catch(err) {
    console.error('Error getting pending votes: ', err)
    throw err 
  }
}

module.exports = {getPendingVotes}