pragma solidity ^0.4.4;
 
import "./Upgradable.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Basic Shim contract
 * 
 * @author Stijn Bernards
 */
contract Shim is Upgradable {

    /**
     * @dev Shim constructor
     *
     * @param _target The target to replace/inject
     */
    constructor(
        address _target
    ) public
    {
        replace(_target);
    }

    /**
     * @dev Override since initialize can't be called on Shim
     */
    function initialize() public {
        revert("Initialize should'nt be called on the Shim");
    }
}