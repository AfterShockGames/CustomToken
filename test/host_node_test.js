let GameToken = artifacts.require("./GameToken.sol");
let HostNodes = artifacts.require("./HostNodes.sol");

let requiredHostBalance = 1*1000*1000*1000;
let gameTokenMarketCap  = 1*1000*1000*1000*1000;
let amountToMint        = 1*1000*1000;
let ipAddresses         = ["192.168.178.17", "192.168.178.18"];

contract('HostNode', (accounts) => {
    let hosterWithoutBalance = accounts[2];
    let hostNodeContract  = null;
    let tokenContract     = null;
    let hoster            = accounts[1];
    let hoster2           = accounts[3];
    let owner             = accounts[0];

     /**
     * Initial setup. 
     * Create contracts and mint tokens to addresses
     */
    before(() => {
        return GameToken.new(gameTokenMarketCap, requiredHostBalance).then((instance) => {
            tokenContract = instance;

            return tokenContract.mint(owner, amountToMint);
        }).then(() => {
            return tokenContract.mint(hoster, requiredHostBalance);
        }).then(() => {
            return tokenContract.mint(hoster2, requiredHostBalance);
        }).then(() => {
            return tokenContract.mint(hosterWithoutBalance, amountToMint);
        }).then(async () => {
            return HostNodes.at(await tokenContract.hostNodes());
        }).then((instance) => {
            hostNodeContract = instance;
            
            return instance;
        });
    });

    describe('HostNode registering and removal', () => {
        //Default node registering
        it('Should allow a user to register a hostnode', () => {
            return hostNodeContract.registerHostNode.call(ipAddresses[0], {from: hoster}).then((success) => {
                assert.isOk(success, "Node should've been added!");

                return success;
            });
        });

        //Test without balance
        it('Should not allow a user to register a hostnode without the required balance', async () => {
            try {
                await hostNodeContract.registerHostNode.call(ipAddresses[0], {from: hosterWithoutBalance});
            } catch (error) {
                assert.notEqual(error, true, "HostNode should not have been registered");

                return error;
            }

            assert.isOk(false, "HostNode should not have been registered");
        });

        //Test removal
        it('Should allow a hoster to remove his node', async () => {
            await hostNodeContract.registerHostNode(ipAddresses[0], {from: hoster});

            return hostNodeContract.removeHostNode.call({from: hoster}).then((result) => {
                assert.isOk(result, "Hoster should be able to remove node!");

                return hostNodeContract.removeHostNode({from: hoster});
            })
        });

        //Test removal without node
        it('Should not allow a non-hoster to remove his node', async () => {
            try {
                await hostNodeContract.removeHostNode.call({from: hoster});
            } catch (error) {
                assert.notEqual(error, true, "non-hoster should not be able to remove his node.");

                return error;
            }

            assert.isOk(false, "non-hoster should not be able to remove his node.");
        });
    });

    describe('Retrieving hostnodes', () => {

        it('Should allow a user to retrieve all Nodes', async () => {
            await hostNodeContract.registerHostNode(ipAddresses[0], {from: hoster});
            await hostNodeContract.registerHostNode(ipAddresses[1], {from: hoster2});

            let amountOfNodes = await hostNodeContract.getHostNodeSize.call();

            let nodes = [];

            for (let i = 0; i < amountOfNodes; i++) {
                let node = await hostNodeContract.getNodeAddress.call(i);

                assert.oneOf(node, ipAddresses, "Hostnode Address should match registered nodes!")

                nodes.push(node);
            }

            assert.equal(nodes.length, amountOfNodes, "All nodes should've been discovered!");
        });
    });
});