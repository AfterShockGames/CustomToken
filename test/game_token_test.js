let AirDrop = artifacts.require("./AirDrop.sol");
let GameToken = artifacts.require("./GameToken.sol");

//TestData
let gameTokenMarketCap = 1*1000*1000*1000;
let amountToMint = 1*1000*1000;
let amountToApprove = 1*1000*1000*1000*1000;
let amountToDrop = 1000;
let airDropParticipants = 2;

//Expected Test Results
let expectedAirDropID = 0;

contract('Airdrop', function(accounts) {
    let tokenContract;
    let airDropContract;
    let participantID;
    let dropper = accounts[0];
    let receiver = accounts[1];

    /**
     * Initial setup. 
     * Mint tokens to dropper address and check it.
     */
    before(async () => {
        tokenContract = await GameToken.new(gameTokenMarketCap, {from: dropper});
        airDropContract = await AirDrop.new(tokenContract.address, {from: dropper});
        await tokenContract.approve(dropper, 1*1000*1000*1000*1000, {from: dropper});

        tokenContract.mint(dropper, amountToMint).then(() => {
            return tokenContract.balanceOf.call(dropper);
        }).then((balance) => {
            assert.equal(balance.valueOf(), amountToMint, "Token dropper balance should equal minted balance!");
        });
    });

    describe('Creation and Execution', () => {
        let airDropID;

        it('Allows creating an airDrop and increments the ID', async () => {
            //Firstly test with .call
            airDropContract.createAirDrop.call(dropper, airDropParticipants, amountToDrop).then((airDrop) => {
                airDropID = airDrop;
                
                assert.equal(airDropID.valueOf(), expectedAirDropID, "AirDrop ID not correctly created!");
            });

            //Execute on blockchain
            await airDropContract.createAirDrop(dropper, airDropParticipants, amountToDrop);
        });

        //Add an participant to the created airDrop
        it('Allows adding a participant to the AirDrop', async () => {
            airDropContract.addParticipantToAirDrop.call(airDropID, receiver).then(participantID => {
                assert.equal(participantID.valueOf(), expectedAirDropID, "Participant ID not correctly created!");
            });
            
            return airDropContract.addParticipantToAirDrop(airDropID, receiver);
        });

        it('Allows distributing an airDrop and sends the right amount of credits', async () => {
            //Distribute and check the airDrop
            return airDropContract.distribute(airDropID, {from: dropper}).then(success => {
                return tokenContract.balanceOf.call(receiver);
            }).then(balance => {
                assert.equal(balance.valueOf(), amountToDrop, "airDrop was not executed correctly.");

                return tokenContract.balanceOf.call(dropper);
            });
        });
    });
});
