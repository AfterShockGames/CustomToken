var Airdrop = artifacts.require("./Airdrop.sol");
var GameToken = artifacts.require("./GameToken.sol");

var dropper = "0xcBAC9e86E0B7160F1a8E4835ad01Dd51c514afce";
var receiver = "0x0804a57bbd061f7946ce6c4a49f09d8114d2ecca";

contract('Airdrop', function(accounts) {
  let tokenContract;
  let airdropContract;
  let airDropID;
  let participantID;

  before(async () => {
    tokenContract = await GameToken.new(1*1000*1000*1000);

    tokenContract.mint(dropper, 1*1000);

    airdropContract = await Airdrop.new(dropper);

    let airdropBalance = await tokenContract.balanceOf.call(dropper);
    assert.equal(Number(airdropBalance), 1*1000);
  });

  it('Allows creating an airDrop', async () => {
    airDropID = await airdropContract.createAirdrop.call(dropper, 4, 100);

    console.log(airDropID);

    airDropID = await airdropContract.createAirdrop.call(dropper, 4, 100);

    console.log(airDropID);

    assert.equal(Number(airDropID), 1);

  });
});
