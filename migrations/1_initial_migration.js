var Migrations = artifacts.require("./Migrations.sol");
var GameToken = artifacts.require("./token/GameToken.sol");
var AirDrop = artifacts.require("./AirDrop.sol");

module.exports = function(deployer) {
    deployer.deploy(Migrations);

    //deployer.deploy(Airdrop, dropper);
    //deployer.deploy(Gametoken, 1000000);
};