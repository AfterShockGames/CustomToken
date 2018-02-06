pragma solidity ^0.4.4;

import "../helpers/Upgradable.sol";

contract GameTokenExtension is Upgradable {
    
    /**
     * @dev Test placeholder function
     */
    function test() public pure returns (uint) {
        return 1;
    }

    function initialize() {
        functionSizes[bytes4(keccak256("test()"))] = 32;
    }

}