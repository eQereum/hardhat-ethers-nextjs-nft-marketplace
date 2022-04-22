const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFTMarketplace & NFT Contract -----------------------------------------------------', () => {
  let owner, seller1, seller2, seller3, attacker, buyer, hardhatNFTMarketplace, hardhatNFT, NFTMarketplaceAddress, NFTAddress;

  before('deploying NFTMarketplace & NFT', async () => {
    [owner, seller1, seller2, seller3, attacker, buyer] = await ethers.getSigners();

    const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace');
    hardhatNFTMarketplace = await NFTMarketplace.deploy();
    NFTMarketplaceAddress = hardhatNFTMarketplace.address;

    const NFT = await ethers.getContractFactory('NFT');
    hardhatNFT = await NFT.deploy(NFTMarketplaceAddress);
    NFTAddress = hardhatNFT.address;
  });

  let receipt1, receipt2;

  describe('NFT', () => {
    describe('createToken()', () => {
      it('should emit CreateTokenLog(1,string)', async () => {
        const tx1 = await hardhatNFT.connect(seller1).createToken('https://test-script1.io');
        receipt1 = await tx1.wait();
        expect(tx1).to.emit(hardhatNFT, 'CreateTokenLog').withArgs(1, 'https://test-script1.io');
      });

      it('should emit CreateTokenLog(1,string)', async () => {
        const tx1 = await hardhatNFT.connect(seller1).createToken('https://test-script11.io');
        receipt1 = await tx1.wait();
        expect(tx1).to.emit(hardhatNFT, 'CreateTokenLog').withArgs(2, 'https://test-script1.io');
      });

      it('should emit CreateTokenLog(2,string)', async () => {
        const tx2 = await hardhatNFT.connect(seller2).createToken('https://test-script2.io');
        receipt2 = await tx2.wait();
        expect(tx2).to.emit(hardhatNFT, 'CreateTokenLog').withArgs(3, 'https://test-script2.io');
      });
    });
  });

  describe('NFTMarketplace', () => {
    describe('createMarketItem()', () => {
      it('should revert when minimum price <=0 ', async () => {
        await expect(hardhatNFTMarketplace.connect(seller1).createMarketItem(NFTAddress, 1, 0, { value: ethers.utils.parseEther('0.1') })).to.be.revertedWith('item price must be at least 1 wei');
      });

      it('should revert when msg.value < 0.1 ether ', async () => {
        await expect(hardhatNFTMarketplace.connect(seller1).createMarketItem(NFTAddress, 1, ethers.utils.parseEther('0.2'), { value: ethers.utils.parseEther('0.01') })).to.be.revertedWith(
          'listing price is 0.1 ether'
        );
      });

      it('should revert when item creator is not owner of tokenId', async () => {
        await expect(hardhatNFTMarketplace.connect(seller3).createMarketItem(NFTAddress, 1, ethers.utils.parseEther('0.2'), { value: ethers.utils.parseEther('0.1') })).to.be.revertedWith(
          'only owner of tokenId can create corresponding item'
        );
      });

      it('should emit CreateMarketItemLog', async () => {
        await expect(hardhatNFTMarketplace.connect(seller1).createMarketItem(NFTAddress, 1, ethers.utils.parseEther('0.2'), { value: ethers.utils.parseEther('0.1') }))
          .to.emit(hardhatNFTMarketplace, 'CreateMarketItemLog')
          .withArgs(1, NFTAddress, 1, await seller1.getAddress(), '0x0000000000000000000000000000000000000000', ethers.utils.parseEther('0.2'));

        await expect(hardhatNFTMarketplace.connect(seller1).createMarketItem(NFTAddress, 2, ethers.utils.parseEther('0.5'), { value: ethers.utils.parseEther('0.1') }))
          .to.emit(hardhatNFTMarketplace, 'CreateMarketItemLog')
          .withArgs(2, NFTAddress, 2, await seller1.getAddress(), '0x0000000000000000000000000000000000000000', ethers.utils.parseEther('0.5'));

        await expect(hardhatNFTMarketplace.connect(seller2).createMarketItem(NFTAddress, 3, ethers.utils.parseEther('0.3'), { value: ethers.utils.parseEther('0.1') }))
          .to.emit(hardhatNFTMarketplace, 'CreateMarketItemLog')
          .withArgs(3, NFTAddress, 3, await seller2.getAddress(), '0x0000000000000000000000000000000000000000', ethers.utils.parseEther('0.3'));

        expect((await hardhatNFTMarketplace.connect(attacker).idToMarketItem(1)).nftContract).to.be.equal(NFTAddress);
        expect((await hardhatNFTMarketplace.connect(attacker).idToMarketItem(2)).nftContract).to.be.equal(NFTAddress);
      });
    });

    describe('buyItem()', () => {
      it('should revert when msg.value != price', async () => {
        await expect(hardhatNFTMarketplace.connect(buyer).buyItem(NFTAddress, 1, { value: ethers.utils.parseEther('0.1') })).to.be.revertedWith('submitted price differs from item price');
        await expect(hardhatNFTMarketplace.connect(buyer).buyItem(NFTAddress, 2, { value: ethers.utils.parseEther('0.2') })).to.be.revertedWith('submitted price differs from item price');
        await expect(hardhatNFTMarketplace.connect(buyer).buyItem(NFTAddress, 3, { value: ethers.utils.parseEther('0.5') })).to.be.revertedWith('submitted price differs from item price');
      });

      it('should emit ItemSoldLog', async () => {
        await expect(hardhatNFTMarketplace.connect(buyer).buyItem(NFTAddress, 1, { value: ethers.utils.parseEther('0.2') }))
          .to.emit(hardhatNFTMarketplace, 'ItemSoldLog')
          .withArgs(1, NFTAddress, 1, await seller1.getAddress(), await buyer.getAddress());

        await expect(hardhatNFTMarketplace.connect(buyer).buyItem(NFTAddress, 3, { value: ethers.utils.parseEther('0.3') }))
          .to.emit(hardhatNFTMarketplace, 'ItemSoldLog')
          .withArgs(3, NFTAddress, 3, await seller2.getAddress(), await buyer.getAddress());
      });
    });

    describe('fetchUnsoldMarketItems()', () => {
      it('should return unsold market items (item2)', async () => {
        expect((await hardhatNFTMarketplace.connect(owner).fetchUnsoldMarketItems())[0].seller).to.be.equal(`${await seller1.getAddress()}`);
      });
    });

    describe('fetchMyNFTsBoughtFromMarketplace()', () => {
      it('should return unsold market items of seller1 => []', async () => {
        expect(await hardhatNFTMarketplace.connect(seller1).fetchMyNFTsBoughtFromMarketplace()).to.be.empty;
      });

      it('should return bought market items of buyer', async () => {
        const tx = await hardhatNFTMarketplace.connect(buyer).fetchMyNFTsBoughtFromMarketplace();
        expect(tx[0].seller).to.be.equal(`${await seller1.getAddress()}`);
        expect(tx[0].owner).to.be.equal(`${await buyer.getAddress()}`);

        expect(tx[1].seller).to.be.equal(`${await seller2.getAddress()}`);
        expect(tx[1].owner).to.be.equal(`${await buyer.getAddress()}`);
      });
    });
  });
});
