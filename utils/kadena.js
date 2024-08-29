const Pact = require('pact-lang-api');

const network = process.env.KDA_NETWORK;
const networkId = process.env.KDA_NETWORKID;
const chainId = process.env.KDA_CHAINID;

const NETWORK = `https://api.chainweb.com/chainweb/0.0/${networkId}/chain/${chainId}/pact`;

const buildUrl = (network, networkId, chainId) => {
  return `${network}/chainweb/0.0/${networkId}/chain/${chainId}/pact`;
}

const listenTx = async function (chainId, txId) {
    // return await listen({ listen: txId }, networkUrl);
    return await Pact.fetch.listen({ listen: txId }, NETWORK);
  }

const localCommand = async function (cmd) {
    // console.log(cmd)
    let networkUrl = buildUrl(network, networkId, chainId);
    let res = await fetch(`${networkUrl}/api/v1/local`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(cmd)
    });
    let data = parseRes(res);
    // console.log("zzzz", JSON.stringify(data))

    return data;
  }
  
  
const parseRes = async function (raw) {
    // console.log("raw", raw)
    const rawRes = await raw;
    const res = await rawRes;
    if (res.ok) {
      const resJSON = await rawRes.json();
      return resJSON;
    } else {
      const resTEXT = await rawRes.text();
      return resTEXT;
    }
  };

   const handleError = (error) => {
	const errorMessage = error?.result?.error?.message
		? JSON.stringify(error?.result?.error?.message)
		: JSON.stringify(error);

	console.error(` ERROR: ${errorMessage}`);

	return errorMessage || 'Unhandled Exception';
};

const creationTime = () => (Math.round(new Date().getTime() / 1000) - 10);


const pactFetchLocal = async (pactCode, options) => {
	// console.log('Pact code:', pactCode);

	const data = await Pact.fetch.local(
		{
			pactCode,
			envData: {},
			meta: Pact.lang.mkMeta('', '1', 1e-5, 90000, creationTime(), 600),
			networkId: networkId,
			...options,
		},
		NETWORK,
	);
	// console.log('Pact response data:', data);
	if (data.result.status === 'success') {
		return data.result.data;
	}
	else {
		const errorMessage = handleError(data);
		return { errorMessage };
	}
};


const endpoint = 'api';
// const endpoint = 'api'; // Use this for mainnet


const apiHost = "http://localhost:3000";
const bridge = 'https://bridge.walletconnect.org';

 const createTransactionKadena = async (account, receiver, transferAmount, session, client, sessionTopic ) => {
  // console.log("createTransactionKadena called", account, receiver, transferAmount, session, client, sessionTopic);


	// const amount = transferAmount;
	const chainId = "1";
 
	try {
	  // Show loading spinner
	//   transactionStore.setState({ isLoading: true });
  
	  const pactCode = `(coin.transfer "${account}"  "${receiver}" (read-decimal 'amt))`;
	  const caps = [
		createCap("Gas", "Allows paying for gas", "coin.GAS", []),
		createCap("Transfer", "Allows sending KDA to the specified address", "coin.TRANSFER", [account, receiver, transferAmount]),
	  ]
	  const envData = {"amt": transferAmount };
	  // console.log('got here?');
	  const result = await localAndSend(account, chainId, pactCode, envData, caps, session, client, sessionTopic);
	  // console.log('result', result);
  
	  // Return the status of polling and the reqKey
	  return { reqKey: result.reqKey };
	} catch (e) {
	  console.error("Error in createTransactionKadena:", e);
	  return false;
	}
  };

 const PRECISION = 2;
// export const buildUrl = (network, networkId, chainId) => {
//   return `${network}/chainweb/0.0/${networkId}/chain/${chainId}/pact`;
// }

 const kadenaTip = async (account, receiver, tip, session, client, sessionTopic ) => {
  // console.log("createTransactionKadena called", account, receiver, tip, session, client, sessionTopic);
	// const amount = transferAmount;
	const chainId = "1";
 console.log("tip log #1")
	try {
	   
	  const pactCode = `(coin.transfer "${account}"  "${receiver}" (read-decimal 'amt))`;
	  const caps = [
		createCap("Gas", "Allows paying for gas", "coin.GAS", []),
		createCap("Transfer", "Allows sending KDA to the specified address", "coin.TRANSFER", [account, receiver, tip]),
	  ]
	  const envData = {"amt": tip };
	  console.log('got here?');
	  const result = await localAndSend(account, chainId, pactCode, envData, caps, session, client, sessionTopic);
	  console.log('result', result);
  
	  // Return the status of polling and the reqKey
	  return { reqKey: result.reqKey };
	} catch (e) {
	  console.error("Error in createTransactionKadena:", e);
	  return false;
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

function stripKFromAddress(address) {
  if (address.startsWith('k:')) {
    return address.slice(2);
  }
  return address;
}



 const createSigningCommand = (account, chainId, pactCode, envData, caps=[], gasLimit, gasPrice) => {
  let pubKey = stripKFromAddress(account);
  return {  
    pactCode: pactCode,
    envData: envData,
    sender: account,
    networkId: networkId,
    chainId: chainId,
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    signingPubKey: pubKey,
    ttl: 600,
    caps: caps,
     }
}

 const localAndSend = async (account, chainId, pactCode, envData, caps, session, client, sessionTopic) => {
console.log("localandsend")
 let gasLimit=10000;
 let gasPrice=1e-8;
 let b1=false;
 let b2=false;
//  console.log('whe here');
    try {
      let signingCmd = createSigningCommand(
        account,
        chainId, 
        pactCode, 
        envData,
        caps,
        gasLimit, 
        gasPrice
      );
    //   let signedCmd = await provider.sign(signingCmd);
// console.log('signingCmd', signingCmd);
		let	signedCmd = await signFunction(signingCmd, session, client, sessionTopic);
			// console.log('signedCmdprovider', signedCmd);
       
      let localRes = await localCommand(signedCmd, chainId);
      // console.log("localRes", localRes);
      if (localRes.result.status === 'success') {

        let sendRes = await sendCommand(signedCmd, chainId);
          // console.log("sendRes", sendRes);

        let reqKey = sendRes.requestKeys[0];
        // console.log("reqKey", reqKey);

        let reqListen = listenTx(chainId, reqKey);
        let txData = {
          ...localRes,
          listenPromise: reqListen,
        };
        // console.log("tx", txData);
        
        // const e = new CustomEvent(EVENT_NEW_TX, { detail: txData });
        // document.dispatchEvent(e);

        return txData;
        
      }
      else {
        // console.log("break", localRes);
        
        const msg = {
          type: 'error',
          data: `Command failed to execute: ${localRes.result.error.message}`,
        };
      
      console.log({messages: msg});
      }
    }
    catch (e) {
      const msg = {
        type: 'error',
        data: `Failed to sign command: ${e}`,
      };
     
      console.log("README", e.message, e.stack, e.name );
    }
  
};




 const wait = async (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

 const sendCommand = async function(signedCmd, chainId) {
  let networkUrl = buildUrl(network, networkId, chainId);
  // console.log("nt", networkUrl);

  let res = await fetch(`${networkUrl}/api/v1/send`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({ cmds: [signedCmd] })
  });

  let data = parseRes(res)
  return data;
}

 const createPactCommand = (account, chainId, pactCode, envData={}, gasLimit=15000, gasPrice=1e-5, includeSigner=false, caps=[]) => {

  let pubKey = account.split(":").slice(2).join(":");

  let signers = [];

  if (includeSigner) {
    let signer = {
      pubKey: pubKey
    };
    if (caps.length > 0) {
      signer.caps = caps;
    }
    signers.push(signer);
  }

  let cmd = {
    networkId: networkId,
    payload: {
      exec: {
        data: envData,
        code: pactCode,
      }
    },
    signers: [], // [signer]
    meta: {
      chainId: chainId,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      sender: account,
      ttl: 600,
      creationTime: creationTime(),
    },
    nonce: Date.now().toString(),
  };
  let cmdString = JSON.stringify(cmd);
  let h = hash(cmdString);
  
  return {
    cmd: cmdString,
    hash: h,
    sigs: [],
  }
}

// export const listenTx = async function (chainId, txId) {
//   let networkUrl = buildUrl(network, networkId, chainId);
//   // return await listen({ listen: txId }, networkUrl);
//   return await Pact.fetch.listen({ listen: txId }, networkUrl);
// }

async function signFunction(signingCommand, session, client, sessionTopic) {

//   const activePairings = client.pairing.values;
// console.log("Active pairings:", activePairings);

// const activeSessions = client.session.values;
// console.log("Active sessions:", activeSessions);
console.log("did I get here?")



if (session) {
    const request = {
      topic: sessionTopic,
      chainId: `kadena:mainnet01`,
      request: {
        method: "kadena_sign_v1",
        params: signingCommand,
      },
    };
try {
  console.log("Sending request...");
  const response = await client.request(request);
  console.log("Received response:", response);

  const result = {
    cmd: response.body.cmd,
    hash: response.body.hash,
    sigs: response.body.sigs
  };

  console.log("Processed result:", result);

  return result;
} catch (error) {
  console.error("Error during signing:", error);
  console.error("Request causing error:", request);
  throw error;
}
} else {
console.error("Client is not initialized or session is not connected");
throw new Error("Client is not initialized or session is not connected");
}
}








  module.exports = { listenTx, localCommand, pactFetchLocal, signFunction, createTransactionKadena,
    kadenaTip, localAndSend };