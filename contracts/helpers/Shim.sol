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
}