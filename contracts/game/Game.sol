pragma solidity ^0.4.4;

import '../token/GameToken.sol';
import '../token/HostNodes.sol';
import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Game is Ownable {

    /**
     * @dev node struct.
     */
    struct Node {
        string ipAddress;
        address hoster;
        uint256 levy;
    }

    string public gameName;

    GameToken private gameToken;
    Node[] private nodes;
    uint256 private requiredNodes;

    /**
     * @dev Game constructor
     *
     * @param _gameToken The gameToken address
     * @param _gameName The game Name
     * @param _owner The Game Owner
     */
    function Game(
        GameToken _gameToken,
        string _gameName,
        address _owner
    ) public
    {
        gameToken = _gameToken;
        gameName = _gameName;

        transferOwnership(_owner);
    }

    /**
     * @dev Sets the amount of nodes this game requires to run
     * 
     * @param _requiredNodes Amount of nodes
     */
    function setNodesRequired(
        uint256 _requiredNodes
    ) public onlyOwner 
    {
        requiredNodes = _requiredNodes;
    }

    /**
     * @dev Assigns a node to this game
     * 
     * @param _ipAddress The nodes IPAddress
     * @param _hoster The node hoster address
     * @param _levy The configured node levy
     */
    function assignNode(
        string _ipAddress,
        address _hoster,
        uint256 _levy
    ) public onlyOwner
    {
        require(requiredNodes < nodes.length);

        nodes.push(Node({
            ipAddress: _ipAddress, 
            hoster: _hoster, 
            levy: _levy
        }));
    }

    /**
     * @dev Used for ingame transactions
     * 
     * @param _to The address to transfer to
     * @param _value The amount to transfer
     * @param _nodeID The amount to transfer
     */
    function transferTo(
        address _to,
        uint256 _value,
        uint256 _nodeID
    ) public returns (bool)
    {
        uint256 levyAmount = _value / nodes[_nodeID].levy;
        
        gameToken.transfer(_to, _value - levyAmount);
        gameToken.transfer(nodes[_nodeID].hoster, levyAmount);

        return true;
    }
}