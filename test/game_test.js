let GameToken = artifacts.require("./GameToken.sol");
let Game = artifacts.require("./Game.sol");

let requiredHostBalance   = 1000;
let gameTokenMarketCap    = 1*1000*1000*1000;
let amountToMint          = 1*1000*1000;
let gameName              = "AfterShock";

contract('Game', (accounts) => {
    let tokenContract = null;
    let testGameOwner = accounts[1];
    let gameContract  = null;
    let gameOwner     = accounts[2];
    let owner         = accounts[0];

    /**
     * Initial setup. 
     * Mint tokens to start addresses
     */
    before(() => {
        return GameToken.new(gameTokenMarketCap, requiredHostBalance).then((instance) => {
            tokenContract = instance;

            return tokenContract.mint(owner, amountToMint);
        }).then(() => {
            return tokenContract.mint(testGameOwner, amountToMint);
        }).then(() => {
            return tokenContract.mint(gameOwner, amountToMint);
        }).then(() => {
            return tokenContract.createNewGame(gameName, gameOwner);
        }).then(async (instance) => {
            gameContract = instance;

            return instance;
        });
    });

    describe('Game creation', () => {
        //Owner game creation test
        it('Should allow the owner to create a game and return an address', async () => {
            let address;

            try { 
                address = await tokenContract.createNewGame.call(gameName, testGameOwner);
            } catch (error) {
                assert.isOk(false, "Contract should have been created correctly!")

                return error;
            }

            assert.isString(address, "Created Game address should be a string");
            assert.isOk(true); //Finish it with placeholder assertion
        });

        //User game creation test
        it('Should not allow anyone to create a game', async () => {
            try {
                await tokenContract.createNewGame.call(gameName, testGameOwner, {from: testGameOwner});
            } catch (error) {
                assert.notEqual(error, true, "Sender should not be able to create a game");

                return error;
            }   

            assert.isOk(false, "Sender should not be able to create a game");
        });
    });
});
