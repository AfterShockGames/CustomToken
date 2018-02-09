let GameTokenExtension = artifacts.require("./GameTokenExtension.sol");
let GameToken          = artifacts.require("./GameToken.sol");
let HostNodes          = artifacts.require("./HostNodes.sol");
let Game               = artifacts.require("./Game.sol");

let amountToReceiveHoster = 20;
let requiredHostBalance   = 1000;
let gameTokenMarketCap    = 1*1000*1000*1000;
let amountToTransfer      = 100;
let amountToReceive       = 80;
let requiredNodes         = 10;
let amountToMint          = 1*1000*1000;
let ipAddress1            = "192.168.178.10";
let ipAddress             = "192.168.178.20";
let gameName              = "AfterShock";

contract('Game', (accounts) => {
    let hostNodeContract = null;
    let tokenContract    = null;
    let testGameOwner    = accounts[1];
    let gameContract     = null;
    let gameAddress      = null;
    let gameOwner        = accounts[2];
    let receiver         = accounts[4];
    let hoster           = accounts[3];
    let hoster2          = accounts[5];
    let nodeID3          = 2;
    let nodeID2          = 1;
    let nodeID           = 0;
    let owner            = accounts[0];

    /**
     * Initial setup. 
     * Mint tokens to start addresses
     */
    before(() => {

        return GameTokenExtension.new().then((instance) => {
            return GameToken.new(gameTokenMarketCap, requiredHostBalance, instance.address)
        }).then((instance) => {
            tokenContract = instance;

            return tokenContract.mint(owner, amountToMint);
        }).then(() => {
            return tokenContract.mint(testGameOwner, amountToMint);
        }).then(() => {
            return tokenContract.mint(gameOwner, amountToMint);
        }).then(() => {
            return tokenContract.mint(hoster, amountToMint);
        }).then(() => {
            return tokenContract.mint(hoster2, amountToMint);
        }).then(() => {
            return tokenContract.createNewGame(gameName, gameOwner);
        }).then(async (instance) => {
            gameAddress  = instance.logs[0].address;

            gameContract = await Game.at(gameAddress);

            return HostNodes.at(await tokenContract.hostNodes());
        }).then((instance) => {
            hostNodeContract = instance;

            return hostNodeContract.registerHostNode(ipAddress, {from: hoster});
        });
    });

    describe('Creation', () => {
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

    describe('Host node assigning', () => {

        it('Should not allow the game owner to assign more hostNodes then the configured cap', async () => {
            try{
                await hostNodeContract.assignHostNodeToGame.call(gameContract.address, nodeID, {from: gameOwner})
            } catch (error) {
                assert.notEqual(error, true, "Owner should not be able to assign a hostNode");

                return error;
            }

            assert.isOk(false, "Owner should not be able to assign a hostNode");
        });

        it('Should allow the game owner to set the maxNodesRequired', async () => {
            return gameContract.setNodesRequired.call(requiredNodes, {from: gameOwner}).then((result) => {
                assert.isOk(result);

                return result;
            });
        });

        //First allow scaleAbleNodes so we can continue testing
        it('Should allow the game owner to set the node scale ability', async () => {
            return gameContract.setScaleAbleNodes.call(true, {from: gameOwner}).then((success) => {
                assert.isOk(success, "Scaleability should've been updated!");

                return gameContract.setScaleAbleNodes(true, {from: gameOwner});
            }).then((result) => {
                return result;
            });
        });

        it('Should allow the game owner to assign a hostNode', async () => {

            //Try assigning a hostNode
            return hostNodeContract.assignHostNodeToGame.call(gameContract.address, nodeID, {from: gameOwner}).then(async (result) => {
                assert.isOk(result, "Hostnode should've been assigned to the game");

                return await hostNodeContract.assignHostNodeToGame(gameContract.address, nodeID, {from: gameOwner});
            });
        });

        it('Should not be a HostNode', async () => {
            return gameContract.isHostNode.call(nodeID3, {from: gameOwner}).then((result) => {
                assert.isNotOk(result, "Hostnode should not be a hostnode");

                return result;
            });
        });

        it('Should be a HostNode', async () => {
            return hostNodeContract.assignHostNodeToGame(gameContract.address, nodeID2, {from: gameOwner}).then((result) => {
                return gameContract.isHostNode.call(nodeID2, {from: gameOwner});
            }).then((result) => {
                assert.isOk(result, "Hostnode should be a hostnode");

                return result;
            });
        });
    });

    describe('HostNode removal', () => {
        it('Should allow a hostNode to remove another hostNode', async () => {
            return hostNodeContract.registerHostNode(ipAddress1, {from: hoster2}).then(() => {
                return hostNodeContract.assignHostNodeToGame(gameContract.address, nodeID2, {from: hoster});
            }).then(() => {
                return hostNodeContract.removeHostNodeFromGame.call(gameContract.address, nodeID2, {from: hoster});
            }).then((result) => {
                assert.isOk(result, "Hostnode should've been removed!");

                return result;
            });
        });

        it('Should not allow anyone to remove another hostNode', async () => {
            try {
                await hostNodeContract.removeHostNodeFromGame.call(gameContract.address, nodeID2, {from: receiver});
            } catch (error) {
                assert.notEqual(error, true);

                return error;
            }

            assert.isOk(false, "Removal should've failed!");

            return true
        });
    });

    describe('Transfers', () => {
        it('Should allow anyone to transfer via the game and it should give the hostNode x amount of levy', async () => {

            await tokenContract.approve(gameAddress, amountToTransfer, {from: testGameOwner});

            return gameContract.transferTo(receiver, amountToTransfer, nodeID, {from: testGameOwner}).then((result) => {
                return tokenContract.balanceOf.call(receiver);
            }).then((balance) => {
                assert.equal(balance, amountToReceive, "Amount should've been sent to the receiver minus host levy");

                return tokenContract.balanceOf.call(hoster);
            }).then((balance) => {
                assert.equal(balance, amountToReceiveHoster + amountToMint, "Levy should've been sent to the hoster");

                return balance;
            });
        });
    });

    //Default player management functions, banning, pardonning etc...
    describe('Player management', () => {
        it('Should allow the Game owner to ban any address', async () => {
            return gameContract.banAddress(receiver, {from: gameOwner}).then(() => {
                return gameContract.isBanned.call(receiver);
            }).then((isBanned) => {
                assert.isOk(isBanned, "Player should've been banned");

                return isBanned;
            });
        });

        it('Should allow the Game owner to pardon any address', async () => {
            return gameContract.banAddress(receiver, {from: gameOwner}).then(() => {
                return gameContract.pardonAddress(receiver, {from: gameOwner});
            }).then(() => {
                return gameContract.isBanned.call(receiver);
            }).then((isBanned) => {
                assert.isNotOk(isBanned, "Player should've been pardonned");

                return isBanned;
            });
        });

        it('Should allow the HostNode to ban any address', async () => {
            return gameContract.banAddress(receiver, {from: hoster}).then(() => {
                return gameContract.isBanned.call(receiver);
            }).then((isBanned) => {
                assert.isOk(isBanned, "Address should've been banned");

                return isBanned;
            });
        });

        it('Should allow the HostNode to pardon any address', async () => {
            return gameContract.banAddress(receiver, {from: hoster}).then(() => {
                return gameContract.pardonAddress(receiver, {from: hoster});
            }).then(() => {
                return gameContract.isBanned.call(receiver);
            }).then((isBanned) => {
                assert.isNotOk(isBanned, "Player should've been pardonned");

                return isBanned;
            });
        });
    });
});
