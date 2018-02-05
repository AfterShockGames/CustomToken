let GameToken = artifacts.require("./GameToken.sol");

let newGameTokenMarketCap = 1*1000*1000*1000*1000;
let gameTokenMarketCap    = 1*1000*1000*1000;
let smallAmountToMint     = 1*1000*1000;
let amountToTransfer      = 1000;
let amountToMint          = 1*1000*1000;
let amountToBurn          = 1000;
let coinPrice             = 100;

contract('GameToken', (accounts) => {
    let tokenContract = null;
    let mintReceiver  = accounts[2];
    let receiver      = accounts[1];
    let owner         = accounts[0];

    /**
     * Initial setup. 
     * Mint tokens to start addresses
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
                await tokenContract.transfer.call(owner, amountToTransfer, {from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to transfer the tokens!");

                return error;
            }
        });

        //Test locked transfer by owner
        it('Should allow the token to be transferred by the owner during lock state', async () => {
            return tokenContract.transfer.call(receiver, amountToTransfer).then((result) => {
                assert.isOk(result, "The owner should be able to transfer the token!");

                return result;
            });
        });

        //Test unlocking transfers
        it('Should allow the owner to unlock the token', async () => {
            return tokenContract.unlockTransfers.call().then((result) => {
                assert.isOk(result, "The owner should be able to unlock transfers");

                return tokenContract.unlockTransfers();
            }).then((result) => {
                return tokenContract.transfer.call(owner, amountToTransfer, {from: receiver});
            }).then((result) => {
                assert.isOk(result, "Account should be able to send the token!");

                return result;
            });
        });

        //Test unlock with different address
        it('Should not allow anyone else than the owner to unlock the tokens', async () => {
            try {
                await tokenContract.unlockTransfers.call({from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to unlock the tokens!");

                return error;
            }    
        });

        //Test locking transfers
        it('Should allow the owner to lock the token', async () => {
            await tokenContract.unlockTransfers();

            return tokenContract.lockTransfers.call().then((result) => {
                assert.isOk(result, "The owner should be able to lock transfers");

                return tokenContract.lockTransfers();
            }).then(async (result) => {
                try { 
                    await tokenContract.transfer.call(owner, amountToTransfer, {from: receiver});
                } catch (error) {
                    assert.notEqual(error, true, "The sender should not be able to transfer the tokens!");

                    return error;
                }
            })
        });

        //Test lock with different address
        it('Should not allow anyone else than the owner to lock the tokens', async () => {
            await tokenContract.unlockTransfers();

            try {
                await tokenContract.lock.call({from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to lock the tokens!");

                return error;
            }
        });
    });

    describe('Coin price and coin cap editing', ()  => {
        //Test changing the coin price
        it('Should allow the owner to change the coin price', async () => {
            return tokenContract.setCoinPrice(coinPrice).then((result) => {
                return tokenContract.getCoinPrice({from: receiver});
            }).then((result) => {
                assert.equal(result, coinPrice, "The coin price should've been changed!");

                return result;
            });
        });

        //Test changing the coin price
        it('Should not allow anyone else to change the coin price', async () => {
            try {
                await tokenContract.setCoinPrice(coinPrice, {from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to change the coin price!");

                return error;
            }
        });

        //Test changing the coin cap
        it('Should allow the owner to change the coin cap', async () => {
            return tokenContract.setCoinCap(newGameTokenMarketCap).then((result) => {
                return tokenContract.getCoinCap({from: receiver});
            }).then((result) => {
                assert.equal(result, newGameTokenMarketCap, "The coin cap should've been changed!");

                return result;
            });
        });

        //Test changing the coin cap
        it('Should not allow anyone else to change the coin cap', async () => {
            try {
                await tokenContract.setCoinCap({from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to change the coin cap!");

                return error;
            }
        });
    });

    describe('Minting and burning tokens', () => { 
        //Basic minting check by owner
        it('Should allow the owner to mint tokens', async () => {
            return tokenContract.mint(mintReceiver, amountToMint).then(() => {
                return tokenContract.balanceOf.call(mintReceiver);
            }).then((balance) => {
                assert.equal(balance, amountToMint, "The owner should've minted the amount to mint to the mintReceivers balance!");

                return balance;
            });
        });

        //Basic minting check by anyone
        it('Should not allow anyone else to mint tokens', async () => {
            try{
                await tokenContract.mint.call(mintReceiver, amountToMint, {from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to mint tokens!");

                return error;
            }
        });

        //Basic burning check by owner
        it('Should allow the owner to burn x amount of tokens', async () => {
            let startBalance = await tokenContract.balanceOf.call(owner);

            return tokenContract.burn(amountToBurn).then(() => {
                return tokenContract.balanceOf.call(owner);
            }).then((balance) => {
                assert.equal(startBalance - amountToBurn, balance, "The owner should've burned x amount of coins");

                return balance;
            });
        });

        //Basic burning check by anyone
        it('Should not allow anyone to burn tokens', async () => {
            try {
                await tokenContract.burn.call(amountToBurn, {from: receiver});
            } catch (error) {
                assert.notEqual(error, true, "The sender should not be able to burn tokens!");

                return error;
            }
        });
    });
});
