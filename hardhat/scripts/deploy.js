// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  //deploy nft contract
  const nftContract = await hre.ethers.deployContract("CryptoDevsNFT");
  await nftContract.waitForDeployment();
  console.log("CryptoDevsNFT deployed to:", nftContract.target);

  //deploy fake nft marketplace
  const fakeNFTMarketplaceContract = await hre.ethers.deployContract("FakeNFTMarketplace");
  await fakeNFTMarketplaceContract.waitForDeployment();
  console.log("Fake NFT Marketplace deployed to: ",fakeNFTMarketplaceContract.target);

  //deploy dao contract
  const daoContract = await hre.ethers.deployContract("CryptoDevsDAO", [
    fakeNFTMarketplaceContract.target,
    nftContract.target,
  ]);
  await daoContract.waitForDeployment();
  console.log("CryptoDevs DAO deployed at :",daoContract.target);

  // Sleep for 30 seconds to let Etherscan catch up with the deployments
  await sleep(65 * 1000);

  //verify the nft contract
  await hre.run("verify:verify", {
    address: nftContract.target,
    constructorArguments: [],
  });

  //verify the fake nft marketplace contract
  await hre.run("verify:verify", {
    address: fakeNFTMarketplaceContract.target,
    constructorArguments: [],
  });

  //verify dao contract
  await hre.run("verify:verify", {
    address: daoContract.target,
    constructorArguments: [
      fakeNFTMarketplaceContract.target,
      nftContract.target,
    ],
  });


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
