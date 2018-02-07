pragma solidity ^0.4.4;

import "../helpers/Upgradable.sol";

contract GameTokenExtension is Upgradable {
    
    /**
     * @dev Test placeholder function
     */
    function test() public returns (uint) {
        return 1231232112312132;
    }

    function initialize() public {
            functionSizes[bytes4(keccak256("test()"))] = 32;
    }

}