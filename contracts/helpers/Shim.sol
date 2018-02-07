pragma solidity ^0.4.4;
 
import "./Upgradable.sol";
import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Shim is Upgradable {

    /**
     * @dev Shim constructor
     *
     * @param _target The target to replace/inject
     */
    function Shim(
        address _target
    ) public
    {
        replace(_target);
    }

    /**
     * @dev Override since initialize can't be called on Shim
     */
    function initialize() public {
        revert();
    }

    /**
     * @dev Catches al functions and forwards them to the current contract
     */
    function() public {
        bytes4 sig;

        assembly 
        { 
            sig := calldataload(0) 
        }

        uint length = functionSizes[sig];
        address target = currentContract;
        
        assembly 
        {
            calldatacopy(0x0, 0x0, calldatasize)
            
            switch delegatecall(gas, target, 0x0, calldatasize, 0, length)
                case 0 {
                    revert(0, 32)
                }
                default {
                    return(0, length)
                }
        }
    }
}