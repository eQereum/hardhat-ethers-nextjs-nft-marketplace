# NFT Marketplace with Hardhat/Ethers

This project represents deploying of NFT (ERC721) contract & NFT Marketplace for trading NFT tokens. You can also compare this project with **Truffle/Web3** version of it that published earlier in [**here**](https://github.com/0xhamedETH/hardhat-ethers-nextjs-nft-marketplace). This would be useful for learning both pack of tools.

### Clone the Repository

```shell
git clone --recursive https://github.com/0xhamedETH/hardhat-ethers-nextjs-nft-marketplace.git your-directory
```

### Install Packages

```shell
cd your-directory/ethereum
npm install
```

### Compile

compile first to create json artifacts in `artifacts` folder

```shell
npx hardhat compile
```

### Test

- Run `ganache-cli` in separate terminal

```shell
ganache-cli
```

- Run `npx hardhat test` in main terminal

```shell
npx hardhat test test/nft.test.js
```

### Deploy

For this step you first need to fill `.env` file with your api keys (`Alchemy`, ...)

You can deploy both contracts in any network you want (make sure `hardhat.config.js` contains that network)

**Note:** You can change `buildPath` of output json file containing abi, bytecode, ... .

**Note:** You first need to deploy NFTMarketplace contract and pass its contract address as an argument to NFT contract.

```shell
npx hardhat run scripts/NFTMarketplace.js --network maticMumbai
npx hardhat run scripts/NFT.js --network maticMumbai
```

After a while, you would see contract address in console.
