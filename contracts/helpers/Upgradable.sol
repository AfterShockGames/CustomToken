pragma solidity ^0.4.4;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Upgradable {
    
    mapping(bytes4 => uint32) public functionSizes;
    address public currentContract;

    /**
     * @dev This function is called during the upgrade and is used to set the functionSizes.
     */
    function initialize() public;
    
    /**
     * @dev Gets a functionSize by signature
     * 
     * @param _signature The signature
     *
     * @return uint32 The function size
     */
    function getFunctionSize(
        bytes4 _signature
    ) public view returns (uint32)
    {
        return functionSizes[_signature];
    }

    /**
     * @dev Replaces the current contract and calls initialize
     * 
     * @param _target The new target contract
     */
    function replace(
        address _target
    ) internal returns (bool)
    {
        currentContract = _target;

        currentContract.delegatecall(
            bytes4(
                    keccak256("initialize()")
                )
            );

        return true;
    }
}