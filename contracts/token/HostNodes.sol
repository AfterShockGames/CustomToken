pragma solidity ^0.4.4;

import './GameToken.sol';
import '../game/Game.sol';

//Plural because this manages multiple Nodes/HostNodes
contract HostNodes {

    /**
     * @dev node struct.
     */
    struct Node {
        bool active;
        bool assigned;
        string ipAddress;
        address hoster;
        uint256 levy;
    }

    mapping(address => Node) public nodes;

    mapping(address => uint256) private addressArrayIndex;
    address[] private addressIndex;
    GameToken private gameToken;
    uint256 private requiredHostBalance;

    event NodeRegister(address indexed registeredNode, string ipAddress);
    event NodeRemoval(address indexed removedNode, string ipAddress);

    /**
     * @dev HostNode Initialization
     * 
     * @param _gameToken gameToken address
     * @param _requiredHostBalance Required hostNode balance
     */
    function HostNodes(
        GameToken _gameToken,
        uint256 _requiredHostBalance
    ) public
    {
        gameToken = _gameToken;
        requiredHostBalance = _requiredHostBalance;
    }

    /**
     * @dev registers a hostNode to the network
     * 
     * @param _ipAddress hostNode IP Address
     *
     * @return bool Success
     */
    function registerHostNode(
        string _ipAddress
    ) public returns (bool)
    {
        require(gameToken.balanceOf(msg.sender) >= requiredHostBalance);

        //Check if node exists, if it does only change ipAddress
        if (nodes[msg.sender].active) {
            nodes[msg.sender].ipAddress = _ipAddress;
        } else {
            addressIndex.push(msg.sender);

            nodes[msg.sender] = Node({
                active: true, 
                assigned: false, 
                ipAddress: _ipAddress, 
                hoster: msg.sender, 
                levy: 5
            });
        }

        NodeRegister(msg.sender, _ipAddress);

        return true;
    }

    /**
     * @dev assign a hostNode to the given Game
     * 
     * @param _game The game contract address
     * @param _hostNodeID The host node ID
     *
     * @return bool Success
     */
    function assignHostNodeToGame(
        address _game,
        uint256 _hostNodeID
    ) public returns (bool)
    {
        Node storage node = nodes[addressIndex[_hostNodeID]];

        require(node.active);
        require(!node.assigned);

        Game game = Game(_game);

        //Final check is being done in the Game contract
        game.assignNode(
            node.ipAddress,
            node.hoster,
            node.levy
        );

        node.assigned = true;

        return true;
    }

    /**
     * @dev Remove a HostNode from the mapping
     *
     * @return bool Success
     */
    function removeHostNode() public returns (bool) {
        require(nodes[msg.sender].active);
        
        //Do a value lookup in the address index
        for (uint i = 0; i < addressIndex.length; i++) {
            if (addressIndex[i] == msg.sender) {
                delete addressIndex[i];
                addressIndex.length--; //We have to manually decrease the array length

                break;
            }
        }

        NodeRemoval(msg.sender, nodes[msg.sender].ipAddress);
        
        delete nodes[msg.sender];

        return true;
    }

    /**
     * @dev Get the amount of registered nodes.
     *
     * @return uint The amount of nodes
     */
    function getHostNodeSize() public view returns (uint) {
        return addressIndex.length;
    }

    /**
     * @dev Retrieve a node from the nodes list
     *
     * @param _index Index of addressIndex generated by calling size and then looping over the number.
     *
     * @return string The node ipAddress
     */
    function getNodeAddress(
        uint _index
    ) public view returns (string) 
    {
        return nodes[addressIndex[_index]].ipAddress;
    }
}