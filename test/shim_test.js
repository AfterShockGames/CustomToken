let GameTokenExtension = artifacts.require("./GameTokenExtension.sol");
let GameToken          = artifacts.require("./GameToken.sol");

let requiredHostBalance = 1*1000*1000*1000;
let gameTokenMarketCap  = 1*1000*1000*1000*1000;
let amountToMint        = 1*1000*1000;

contract('Shim', (accounts) => {
    let extensionContract = null;
    let tokenContract     = null;
    let owner             = accounts[0];

     /**
     * Initial setup. 
     * Create contracts and mint tokens to addresses
     */
    before(() => {
        return GameTokenExtension.new().then((instance) => {
            return GameToken.new(gameTokenMarketCap, requiredHostBalance, instance.address)
        }).then((instance) => {
            tokenContract = instance;

            return GameTokenExtension.at(instance.address);
        }).then((instance) => {
            extensionContract = instance;

            return tokenContract.mint(owner, amountToMint);
        });
    });

    //Test a predefined basic Shimmed function
    describe('Basic Shim tests', () => {
        it('Should return 1', async () => {
           assert.equal(await extensionContract.test.call(), 1);
        });
    });
});