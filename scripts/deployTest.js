const { deployContract, contractAt, sendTxn, callWithRetries } = require("../helpers/helper");

async function main() {
    console.log("in main")
    const [deployer] = await ethers.getSigners();
    console.log("deployer :: ", deployer.address)
    const igai = await contractAt("NSFWAI", "0xCd81FDa67eb7D9d23f98b81224CAEd25888b1233")
    console.log("NSFWAI Address :: ", igai.address)

    let txn;

    // txn = await igai.unlockUser("ashishmishra", {value: 1, gasLimit: 3e7});
    // console.log(txn);
    txn = await igai.postLaunch({gasLimit: 3e7});
    console.log(txn);

    txn = await igai.taxForLiquidity();
    console.log(txn);
    txn = await igai.taxForMarketing();
    console.log(txn);

    // const uniRouter = await contractAt("UniswapV2Router02", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    // console.log("uniRouter Address :: ", uniRouter.address)
    // uniRouter.addLiquidityETH{value: ethAmount}(
    //     address(this),
    //         tokenAmount,
    //         0,
    //         0,
    //         marketingWallet,
    //         block.timestamp
    // );


    //console.log("ImgnAI Token address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });