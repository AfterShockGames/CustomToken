var Migrations = artifacts.require("./Migrations.sol");
var GameToken = artifacts.require("./token/GameToken.sol");
var AirDrop = artifacts.require("./AirDrop.sol");

var dropper = "0xcBAC9e86E0B7160F1a8E4835ad01Dd51c514afce";

module.exports = function(deployer) {
    deployer.deploy(Migrations).then(() => {
        return deployer.deploy(GameToken, 1*1000*1000*1000, 1*1000*1000).then(() => {
            console.log('Deploy')
            return deployer.deploy(AirDrop, GameToken.address);    
        });
    });
};