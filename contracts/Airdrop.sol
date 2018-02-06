pragma solidity ^0.4.4;

import "./token/GameToken.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract AirDrop is Ownable {
    using SafeMath for uint256;

    /**
    * @dev The AirdropCampaign struct used for airdrops
    */
    struct AirDropCampaign {
        bool created;
        address tokenHolder;
        uint participantCount;
        uint256 maxParticipants;
        uint256 amount;
        mapping(uint => address) participants;
    }

    /**
     * @dev TokenDrop event which is fired after x tokens have been sent to receiver
     */
    event TokenDrop(address initiator, address receiver, uint256 amount);
    /**
     * @dev AddParticipant event which is fired after added a participant to an airdrop
     */
    event AddParticipant(uint participantID, address participant);

    uint public airDropCounter = 0;
    GameToken private token;
    mapping(uint256 => AirDropCampaign) airDrops;

    /**
    * @dev Airdrop Constructor
    *
    * @param _token The Custom token address
    */
    function AirDrop(
        GameToken _token
    ) public 
    {
        token = _token;
    }

    /**
    * @dev Create a new airdrop
    *
    * @param _tokenHolder The token holder
    * @param _maxParticipants The max amount of airDrop participants
    * @param _amount The amount to distribute
    *
    * @return uint The created airdropID
    */
    function createAirDrop(
        address _tokenHolder,
        uint256 _maxParticipants,
        uint256 _amount
    ) public onlyOwner returns (uint airDropID)
    {
        airDropID = airDropCounter;

        airDrops[airDropID] = AirDropCampaign({
            created: true,
            tokenHolder: _tokenHolder,
            maxParticipants: _maxParticipants,
            amount: _amount,
            participantCount: 0
        });

        airDropCounter++;
    }

    /**
    * @dev Add an address to the airdrop
    * 
    * @param _airDropID The airDrop
    * @param _participant The participants address to add.
    *
    * @return uint The new participantID
    */
    function addParticipantToAirDrop(
        uint _airDropID,
        address _participant
    ) public onlyOwner returns (uint participantID)
    {
        require(airDrops[_airDropID].created);

        participantID = airDrops[_airDropID].participantCount;

        airDrops[_airDropID].participants[participantID] = _participant;

        AddParticipant(airDrops[_airDropID].participantCount, _participant);

        airDrops[_airDropID].participantCount++;
    }

    /**
    * @dev Distribute tokens
    *
    * @param _airDropID The AirDrop to distribute
    */
    function distribute(
        uint _airDropID
    ) public
    {
        //Loop through specified airdrop participants
        for (uint i = 0; i < airDrops[_airDropID].participantCount; i++) {
            TokenDrop(msg.sender, airDrops[_airDropID].participants[i], airDrops[_airDropID].amount);

            token.transferFrom(airDrops[_airDropID].tokenHolder, airDrops[_airDropID].participants[i], airDrops[_airDropID].amount);
        }
    }
}