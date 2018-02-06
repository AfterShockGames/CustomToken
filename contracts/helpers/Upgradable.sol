pragma solidity ^0.4.4;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Upgradable {
    
    mapping(bytes4 => uint32) public functionSizes;
    address public currentContract;

    /**
     * @dev this function is called during the upgrade and is used to set the functionSizes.
     */
    function initialize() public;

    /**
     * @dev Get a function return size, required for parent contracts to access functionSizes.
     *
     * @param _sig The bytes4 signature
     */
    function getFunctionSize(
        bytes4 _sig
    ) public view returns (uint32)
    {
        return functionSizes[_sig];
    }

    /**
     * @dev Replaces the current contract and calls initialize
     * 
     * @param _target The new target contract
     */
    function replace(
        address _target
    ) internal 
    {
        currentContract = _target;

        currentContract.delegatecall(
            bytes4(
                    keccak256("initialize()")
                )
            );
    }
}