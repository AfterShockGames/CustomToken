let GameTokenExtension = artifacts.require("./GameTokenExtension.sol");
let GameToken          = artifacts.require("./GameToken.sol");
let HostNodes          = artifacts.require("./HostNodes.sol");
let AirDrop            = artifacts.require("./AirDrop.sol");
let Game               = artifacts.require("./Game.sol"); 

let requiredHostBalance   = 1000;
let gameTokenMarketCap    = 1*1000*1000*1000;
let gameName              = "Aftershock";

module.exports = function(deployer, network, accounts) {
    deployer.deploy(GameTokenExtension).then(() => {
        deployer.deploy(GameToken, gameTokenMarketCap, requiredHostBalance, GameTokenExtension.address).then(() => {
            return GameToken.at(GameToken.address).createNewGame(gameName, accounts[0]);
        }).then((result) => {
            console.log("GameContract Address: " + result.logs[0].address);
        });
    }); 
};
