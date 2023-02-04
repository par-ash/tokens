
const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const GOERLI = 5;
const ARBITRUM = 42161;
const ARBITRUM_TESTNET = 421613;

const {
    GOERLI_URL,
    GOERLI_DEPLOY_KEY,
    ARBITRUM_URL,
    ARBITRUM_DEPLOY_KEY,
    ARBITRUM_TESTNET_DEPLOY_KEY,
    ARBITRUM_TESTNET_URL
} = require("../env.json");

const providers = {
    goerli: new ethers.providers.JsonRpcProvider(GOERLI_URL),
    arbitrum: new ethers.providers.JsonRpcProvider(ARBITRUM_URL),
    arbitrumTestnet: new ethers.providers.JsonRpcProvider(ARBITRUM_TESTNET_URL)
};

const signers = {
    goerli: new ethers.Wallet(GOERLI_DEPLOY_KEY).connect(providers.goerli),
    arbitrum: new ethers.Wallet(ARBITRUM_DEPLOY_KEY).connect(providers.arbitrum),
    arbitrumTestnet: new ethers.Wallet(ARBITRUM_TESTNET_DEPLOY_KEY).connect(providers.arbitrumTestnet)
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getChainId(network) {

    if (network === "goerli") {
        return 5
    }

    if (network === "arbitrum") {
        return 42161
    }

    if (network === "arbitrumTestnet") {
        return 421613
    }

    throw new Error("Unsupported network")
}

async function getFrameSigner() {
    try {
        console.log("Inside getFrameSigner()......");
        const frame = new ethers.providers.JsonRpcProvider(ARBITRUM_TESTNET_URL)
        //const frame = new ethers.providers.JsonRpcProvider("http://127.0.0.1:1248")
        const signer = new ethers.Wallet("e69680a36bbcbdc74ecc8afa4fc45ec74806a40b9e41dd2437812d8b5cffc456", frame);
        //const signer = frame.getSigner()
        //const signer = signers.arbitrumTestnet
        if (getChainId(network) !== await signer.getChainId()) {
            console.log("Error1");
            throw new Error("Incorrect frame network")
        }
        console.log(signer.address);
        return signer
    } catch (e) {
        console.log("Error2");
        throw new Error(`getFrameSigner error: ${e.toString()}`)
    }
}

async function sendTxn(txnPromise, label) {
    const txn = await txnPromise
    console.info(`Sending ${label}...`)
    await txn.wait()
    console.info(`... Sent! ${txn.hash}`)
    await sleep(2000)
    return txn
}

async function callWithRetries(func, args, retriesCount = 3) {
    let i = 0
    while (true) {
        i++
        try {
            return await func(...args)
        } catch (ex) {
            if (i === retriesCount) {
                console.error("call failed %s times. throwing error", retriesCount)
                throw ex
            }
            console.error("call i=%s failed. retrying....", i)
            console.error(ex.message)
        }
    }
}

async function deployContract(name, args, label, options) {
    if (!options && typeof label === "object") {
        label = null
        options = label
    }

    let info = name
    if (label) { info = name + ":" + label }
    const contractFactory = await ethers.getContractFactory(name)
    let contract
    if (options) {
        contract = await contractFactory.deploy(...args, options)
    } else {
        contract = await contractFactory.deploy(...args)
    }
    const argStr = args.map((i) => `"${i}"`).join(" ")
    console.info(`Deploying ${info} ${contract.address} ${argStr}`)
    await contract.deployTransaction.wait()
    console.info("... Completed!")
    return contract
}

async function contractAt(name, address, provider) {
    let contractFactory = await ethers.getContractFactory(name)
    if (provider) {
        contractFactory = contractFactory.connect(provider)
    }
    return await contractFactory.attach(address)
}

// batchLists is an array of lists
async function processBatch(batchLists, batchSize, handler) {
    let currentBatch = []
    const referenceList = batchLists[0]

    for (let i = 0; i < referenceList.length; i++) {
        const item = []

        for (let j = 0; j < batchLists.length; j++) {
            const list = batchLists[j]
            item.push(list[i])
        }

        currentBatch.push(item)

        if (currentBatch.length === batchSize) {
            console.log("handling currentBatch", i, currentBatch.length, referenceList.length)
            await handler(currentBatch)
            currentBatch = []
        }
    }

    if (currentBatch.length > 0) {
        console.log("handling final batch", currentBatch.length, referenceList.length)
        await handler(currentBatch)
    }
}

async function updateTokensPerInterval(distributor, tokensPerInterval, label) {
    const prevTokensPerInterval = await distributor.tokensPerInterval()
    if (prevTokensPerInterval.eq(0)) {
        // if the tokens per interval was zero, the distributor.lastDistributionTime may not have been updated for a while
        // so the lastDistributionTime should be manually updated here
        await sendTxn(distributor.updateLastDistributionTime({ gasLimit: 500000 }), `${label}.updateLastDistributionTime`)
    }
    await sendTxn(distributor.setTokensPerInterval(tokensPerInterval, { gasLimit: 500000 }), `${label}.setTokensPerInterval`)
}

module.exports = {
    ARBITRUM,
    ARBITRUM_TESTNET,
    GOERLI,
    providers,
    signers,
    getFrameSigner,
    sendTxn,
    deployContract,
    contractAt,
    callWithRetries,
    processBatch,
    updateTokensPerInterval,
    sleep
}
