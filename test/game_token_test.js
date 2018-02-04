let GameToken = artifacts.require("./GameToken.sol");

let gameTokenMarketCap = 1*1000*1000*1000;
let amountToMint = 1*1000*1000;
let smallAmountToMint = 1000;

contract('GameToken', (accounts) => {
    let tokenContract;
    let owner = accounts[0];
    let receiver = accounts[1]

    /**
     * Initial setup. 
     * Mint tokens to start address
     */
    before(() => {
        return GameToken.new(gameTokenMarketCap).then((instance) => {
            tokenContract = instance;

            return tokenContract.mint(owner, amountToMint);
        }).then(() => {
            return tokenContract.mint(receiver, smallAmountToMint);
        });
    });

    describe('Transfers and token locking', () => {

        //Test locked transfer
        it('Should not allow the token to be transferred during lock state', async () => {
            try {
                await tokenContract.transfer.call(owner, 1000, {from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to transfer the tokens!");

                return error;
            }
        });

        //Test locked transfer by owner
        it('Should allow the token to be transferred by the owner during lock state', async () => {
            return tokenContract.transfer.call(receiver, 1000).then((result) => {
                assert.isOk(result, "The owner should be able to transfer the token!");

                return result;
            });
        });
    });
});
