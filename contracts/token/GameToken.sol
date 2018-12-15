pragma solidity ^0.4.4;

import "./HostNodes.sol";
import "../game/Game.sol";
import "../helpers/Shim.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

/**
 * @title Basic GameToke contract
 * 
 * @author Stijn Bernards
 */
contract GameToken is MintableToken {

    uint256 public constant DECIMALS = 18; //Amount of decimals this coin supports
    string public constant NAME   = "AfterShock"; //Coin name
    string public constant SYMBOL = "AFEC"; //Coin symbol

    uint256 public coinCap; //Coin cap
    uint256 public coinPrice; //Buyable coin price
    HostNodes public hostNodes; //HostNodes contract
    bool public capLocked = false; //Shows if the coincap is locked

    bool private transfersAllowed = false; //Determines if transfers are allowed
    Shim private shim;//The Shim contract for upgrades
    /**
     * @dev All Registered games
     */
    mapping(address => Game) private games;
    /**
     * @dev A mapping containing all gameOwner games
     */
    mapping(address => address[]) private gameOwnerGames;

    /**
     * @dev Burning event.
     */
    event Burned(address indexed burner, uint256 value);

    /**
     * @dev Check if transfers are allowed.
     *      Contract owner can always transfer.
     * 
     * @param _sender The sender.
     * @param _value The value.
     */
    modifier canTransfer(
        address _sender, 
        uint256 _value
    ) 
    {
        require(
            transfersAllowed || _sender == owner,
            "Token transfers are currently not allowed"
        );
        _;
    }

    /**
     * @dev Construct.
     * 
     * @param _coinCap The coin cap.
     * @param _requiredHostBalance The hostNode required balance
     * @param _shimContract Should be an Upgradable used to attach functions to the gameToken
     */
    constructor(
        uint256 _coinCap,
        uint256 _requiredHostBalance,
        address _shimContract
    ) public
    {
        coinCap = _coinCap;
        hostNodes = new HostNodes(this, _requiredHostBalance);

        shim = new Shim(_shimContract);
    }

    /**
     * @dev unlock the token for free transfers.
     *
     * @return bool Success
     */
    function unlockTransfers() public onlyOwner returns (bool) {
        transfersAllowed = true;

        return true;
    }

    /**
     * @dev Lock the token from any transfers. 
     *
     * @return bool Success
     */
    function lockTransfers() public onlyOwner returns (bool) {
        transfersAllowed = false;

        return true;
    }

    /**
     * @dev Locks the market cap stopping any new minting.
     *      This will never allow the cap to edited again!
     *
     * @return bool Success
     */
    function lockCap() public onlyOwner returns (bool) {
        capLocked = true;
    }

    /**
     * @dev Allows the owner to set the coinPrice
     * 
     * @param _coinPrice The price to pay per coin in ETH.
     *        Amount wil be Transferred amount / coinPrice
     */
    function setCoinPrice(
        uint256 _coinPrice
    ) public onlyOwner
    {
        coinPrice = _coinPrice;
    }

    /**
     * @dev Allows anyone to request the current coinPrice
     *
     * @return uint256 The coin price
     */
    function getCoinPrice() public view returns (uint256) {
        return coinPrice;
    }

    /**
     * @dev Add override for set coinCap.
     * 
     * @param _to Address to send the minted coins to.
     * @param _value The amount of coins to mint.
     *
     * @return bool Success
     */
    function mint(
        address _to,
        uint256 _value
    ) public onlyOwner canMint returns (bool) 
    {
        require(
            totalSupply_.add(_value) <= coinCap,
            "Unable to mint more than the specified coinCap"
        );

        return super.mint(_to, _value);
    }

    /**
     * @dev Sets the coinCap.
     *
     * @param _coinCap The coin cap to set.
     */
    function setCoinCap(
        uint256 _coinCap
    ) public onlyOwner
    {
        require(
            !capLocked,
            "The coin cap can no longer be changed!"
        );
        
        coinCap = _coinCap;
    }

    /**
     * @dev Gets the coinCap
     *
     * @return uint256 The coinCap
     */
    function getCoinCap() public view returns (uint256) {
        return coinCap;
    }

    /**
     * @dev Override base transfer with modifier.
     * 
     * @param _to The address to transfer to.
     * @param _value The value to transfer.
     *
     * @return bool Success
     */
    function transfer(
        address _to, 
        uint256 _value
    ) public canTransfer(msg.sender, _value) returns (bool)
    {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Override transferFrom with modifier
     *
     * @param _from The address to send from.
     * @param _to The address to send to.
     * @param _value The amount to send.
     *
     * @return bool Success
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    }

    /**
    * @dev Burns a specific number of tokens.
    * 
    * @param _value — The number of tokens to be burned.
    */
    function burn(uint256 _value) public onlyOwner {
        require(
            _value > 0,
            "You should burn more than 0 tokens"
        );

        address burner = msg.sender;

        balances[burner] = balances[burner].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);

        emit Burned(burner, _value);
    }

    /**
     * @dev Allows the owner to create games
     *
     * @param _gameName The game name
     * @param _gameOwner The game owner
     *
     * @return address The new Game contract address
     */
    function createNewGame(
        string memory _gameName,
        address _gameOwner
    ) public onlyOwner returns (Game)
    {
        Game game = new Game(this, hostNodes, _gameName, _gameOwner);
        games[address(game)] = game;
        gameOwnerGames[_gameOwner].push(address(game));

        return game;
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

        uint length = shim.getFunctionSize(sig);
        address target = shim.currentContract();
        
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