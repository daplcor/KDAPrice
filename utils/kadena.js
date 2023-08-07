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

  module.exports = { listenTx, localCommand, pactFetchLocal };