let AirDrop = artifacts.require("./AirDrop.sol");
let GameToken = artifacts.require("./GameToken.sol");

//TestData
let airDropParticipants = 2;
let requiredHostBalance = 1000;
let gameTokenMarketCap  = 1*1000*1000*1000;
let amountToApprove     = 1*1000*1000*1000*1000;
let amountToMint        = 1*1000*1000;
let amountToDrop        = 1000;
let fakeAirdropId       = 211;

//Expected Test Results
let expectedAirDropID = 0;

contract('Airdrop', (accounts) => {
    let airDropContract = null;
    let participantID   = null;
    let tokenContract   = null;
    let receiver        = accounts[1];
    let receiver2       = accounts[2];
    let dropper         = accounts[0];

    /**
     * Initial setup. 
     * Mint tokens to dropper address and check it.
     */
    before(() => {
        return GameToken.new(gameTokenMarketCap, requiredHostBalance).then((instance) => {
            tokenContract = instance;

            return AirDrop.new(tokenContract.address);
        }).then((instance) => {
            airDropContract = instance;

            return tokenContract.mint(dropper, amountToMint).then(() => {
                return tokenContract.balanceOf.call(dropper);
            }).then((balance) => {
                assert.equal(balance.valueOf(), amountToMint, "Token dropper balance should equal minted balance!");
            });
        }).then(() => {
            tokenContract.approve(airDropContract.address, amountToApprove);
        });
    });

    describe('Creation and Execution', () => {
        let airDropID;

        it('Should allow creating an airDrop and increments the ID', async () => {
            //Firstly test with .call
            airDropContract.createAirDrop.call(dropper, airDropParticipants, amountToDrop).then((airDrop) => {
                airDropID = airDrop;
                
                assert.equal(airDropID.valueOf(), expectedAirDropID, "AirDrop ID not correctly created!");
            });

            //Execute on blockchain
            await airDropContract.createAirDrop(dropper, airDropParticipants, amountToDrop);

            return true;
        });

        //Add an participant to the created airDrop
        it('Should allow adding a participant to the AirDrop', () => {
            airDropContract.addParticipantToAirDrop.call(airDropID, receiver).then(participantID => {
                assert.equal(participantID.valueOf(), expectedAirDropID, "Participant ID not correctly created!");
            });

            airDropContract.addParticipantToAirDrop(airDropID, receiver);
            airDropContract.addParticipantToAirDrop(airDropID, receiver2);

            return true;
        });

        //Test adding random participant
        it('Should not allow adding participants to non existing airdrops', async () => {
            try{
                await airDropContract.addParticipantToAirDrop(fakeAirdropId, receiver);
            } catch (error) {
                assert.notEqual(error, true, "The participant should not have been added to the airdrop!");

                return error;
            }

            assert.isOk(false);
        })

        it('Should Allow distributing an airDrop and sends the right amount of credits to both participants', async () => {
            //Distribute and check the airDrop
            return airDropContract.distribute(airDropID).then(success => {
                return tokenContract.balanceOf.call(receiver);
            }).then(balance => {
                assert.equal(balance.valueOf(), amountToDrop, "AirDrop was not executed correctly.");

                return tokenContract.balanceOf.call(receiver2);
            }).then((balance) => {
                assert.equal(balance.valueOf(), amountToDrop, "AirDrop was not executed correctly.");

                return tokenContract.balanceOf.call(dropper);
            }).then((balance) => {
                assert.equal(balance.valueOf(), amountToMint - amountToDrop * 2, "Token Dropper should've lost the dropped coins!");

                return true;
            });
        });
    });
});
