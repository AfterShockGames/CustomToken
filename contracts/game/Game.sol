pragma solidity ^0.4.4;

import "../token/GameToken.sol";
import "../token/HostNodes.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Basic Game contract
 * 
 * @author Stijn Bernards
 */
contract Game is Ownable {

    /**
     * @dev node struct.
     */
    struct Node {
        uint256 ID;
        string ipAddress;
        address hoster;
        uint256 levy;
        bool active;
    }

    /**
     * @dev The gameName
     */
    string public gameName;
    /**
     * @dev Reference to the gameToken contract
     */
    GameToken private gameToken;
    /**
     * @dev The current node amount
     */
    uint private nodeAmount;
    /**
     * @dev The required nodes by this game
     */
    uint256 private requiredNodes;
    /**
     * @dev Checks if the hostnodes are auto scaleable on demand
     */
    bool private scaleAbleNodes = false;
    /**
     * @dev Reference to Hostnodes contract
     */
    HostNodes private hostNodes;
    /**
     * @dev A list of this games banned players
     */
    mapping(address => bool) private bannedPlayers;
    /**
     * @dev Mapping containing all nodes
     */
    mapping(uint => Node) private nodes;
    /**
     * @dev Host node addresses
     */
    mapping(address => bool) private hosters;

    /**
     * @dev Modifier which allows the gameOwner or any of the token/HostNodes contracts to execute a function.
     */
    modifier onlyOwnerOrContract() {
        require(
            msg.sender == address(gameToken) || msg.sender == owner || msg.sender == address(hostNodes),
            "Sender is not allowed to perform this action. Should be contract owner or contract."
        );
        _;
    }

    /**
     * @dev Modifier which allows the gameOwner or a hostNode to send the transaction
     */
    modifier onlyOwnerOrNode() {
        require(
            msg.sender == owner || hosters[msg.sender],
            "Sender is not allowed to perform this action. Should be gameOwner or hostNode"
        );
        _;
    }

    /**
     * @dev Event fired after assigning a node to a game
     *
     * @param _address Hoster address
     */
    event NodeAssigned(address _address);

    /**
     * @dev Game constructor
     *
     * @param _gameToken The gameToken address
     * @param _hostNodes HostNodes Contract
     * @param _gameName The game Name
     * @param _owner The Game Owner
     */
    constructor(
        GameToken _gameToken,
        HostNodes _hostNodes,
        string _gameName,
        address _owner
    ) public
    {
        gameToken = _gameToken;
        gameName = _gameName;
        hostNodes = _hostNodes;

        transferOwnership(_owner);
    }

    /**
     * @dev Allows the owner to remove the max nodes constraint
     *
     * @param _value true/false
     */
    function setScaleAbleNodes(
        bool _value
    ) public onlyOwner returns (bool)
    {
        scaleAbleNodes = _value;

        return true;
    }

    /**
     * @dev Sets the amount of nodes this game requires to run
     * 
     * @param _requiredNodes Amount of nodes
     */
    function setNodesRequired(
        uint256 _requiredNodes
    ) public onlyOwner returns (bool)
    {
        requiredNodes = _requiredNodes;

        return true;
    }

    /**
     * @dev Assigns a node to this game
     * 
     * @param _ipAddress The nodes IPAddress
     * @param _hoster The node hoster address
     * @param _levy The configured node levy
     * @param _nodeID The node unique ID
     * 
     * @return uint256 The node unique ID
     */
    function assignNode(
        string _ipAddress,
        address _hoster,
        uint256 _levy,
        uint256 _nodeID
    ) public onlyOwnerOrContract returns (uint)
    {
        require(
            requiredNodes < nodeAmount || scaleAbleNodes,
            "There is no more space for nodes in this game"
        );

        nodes[_nodeID] = Node({
            ID: _nodeID,
            ipAddress: _ipAddress,
            hoster: _hoster,
            levy: _levy,
            active: true
        });

        hosters[_hoster] = true;

        nodeAmount++;

        emit NodeAssigned(_hoster);

        return _nodeID;
    }

    /**
     * @dev Used for ingame transactions
     * 
     * @param _to The address to transfer to
     * @param _value The amount to transfer
     * @param _nodeID The node which is used for the game
     * 
     * @return bool Transfer success
     */
    function transferTo(
        address _to,
        uint256 _value,
        uint256 _nodeID
    ) public returns (bool)
    {
        uint256 levyAmount = _value / nodes[_nodeID].levy;
            
        gameToken.transferFrom(msg.sender, _to, _value - levyAmount);
        gameToken.transferFrom(msg.sender, nodes[_nodeID].hoster, levyAmount);

        return true;
    }

    /**
     * @dev Used for hostNodes and GameOwners to ban specific addresses
     *
     * @param _address The address to ban
     *
     * @return bool Success
     */
    function banAddress(
        address _address
    ) public onlyOwnerOrNode returns (bool) 
    {
        bannedPlayers[_address] = true;

        return true;
    }

    /**
     * @dev Used for hostNodes and GameOwner to ban specific addresses
     * 
     * @param _address The address to pardon
     *
     * @return bool Success
     */
    function pardonAddress(
        address _address
    ) public onlyOwnerOrNode returns (bool)
    {
        delete bannedPlayers[_address];

        return true;
    }

    /**
     * @dev Checks if a certain address is banned for this Game
     *
     * @param _address The address to check
     *
     * @return bool Banned yes/no
     */
    function isBanned(
        address _address
    ) public view returns (bool)
    {
        return bannedPlayers[_address];
    }

    /**
     * @dev Removes a host node from the game
     *
     * @param _hoster The host node to remove
     *
     * @return bool Success
     */
    function removeNode(
        address _hoster,
        uint _nodeID
    ) public onlyOwnerOrContract returns (bool)
    {
        require(
            isHostNode(_nodeID),
            "Node is not a hostnode"
        );

        delete hosters[_hoster];
        delete nodes[_nodeID];

        nodeAmount--;

        return true;
    }

    /**
     * @dev Checks if id is a hostNode
     *
     * @param _nodeID Hostnode ID
     *
     * @return bool isNode
     */
    function isHostNode(
        uint _nodeID
    ) public view onlyOwnerOrContract returns (bool)
    {
        if (nodes[_nodeID].active) {
            return true;
        }

        return false;
    }

}