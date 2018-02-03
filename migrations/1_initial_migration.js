var Migrations = artifacts.require("./Migrations.sol");
var Gametoken = artifacts.require("./token/GameToken.sol");
var Airdrop = artifacts.require("./Airdrop.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);

  //deployer.deploy(Airdrop, dropper);
  //deployer.deploy(Gametoken, 1000000);
};
