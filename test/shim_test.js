let GameTokenExtension = artifacts.require("./GameTokenExtension.sol");
let GameToken          = artifacts.require("./GameToken.sol");
let Shim               = artifacts.require("./Shim.sol");

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

            return GameToken.new(gameTokenMarketCap, requiredHostBalance, instance.address);
        }).then((instance) => {
            extensionContract = GameTokenExtension.at(instance.address);
        });
    });

    //Test a predefined basic Shimmed function
    describe('Basic Shim tests', () => {
        it('Should return 1', async () => {
            return assert.equal(await extensionContract.test.call(), 1);
        });

        it('Should not allow a shim to be replaced', async () => {
            let shimContract = await Shim.new(extensionContract.address);

            try {                
                shimContract.replace.call(extensionContract.address)            
            } catch (error) {
                assert.notEqual(error, true, "Replace should've failed!");

                return error;
            }

            assert.isOk(false, "Replace should've failed!");
        });

        it('Should not allow a shim to be initialized', async () => {
            let shimContract = await Shim.new(extensionContract.address);

            try {                
                await shimContract.initialize.call();         
            } catch (error) {
                assert.notEqual(error, true, "Replace should've initialized!");

                return error;
            }

            assert.isOk(false, "Replace should've initialized!");
        });
    });
});