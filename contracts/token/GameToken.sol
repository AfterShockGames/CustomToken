pragma solidity ^0.4.4;

import '../../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract GameToken is MintableToken {
    string public constant NAME   = "GameToken";
    string public constant SYMBOL = "GAM";
    uint256 public constant DECIMALS = 18;

    uint256 public maxCap;
    bool public capLocked = false;

    bool private transfersAllowed = false;

    event Burned(address indexed burner, uint256 value);

    /**
     * @dev Check if transfers are allowed.
     *      Contract owner can always transfer.
     */
    modifier canTransfer(
        address _sender, 
        uint256 _value
    ) 
    {
        require(transfersAllowed || _sender == owner);
        _;
    }

    /**
     * @dev Construct
     */
    function GameToken(
        uint256 _maxCap
    ) public
    {
        maxCap = _maxCap;
    }

    /**
     * @dev Locks the market cap stopping any new minting
     *      This will never allow the cap to edited again!
     */
    function lockCap() public onlyOwner {
        capLocked = true;
    }

    /**
     * @dev Add override for set maxCap
     */
    function mint(
        address _to,
        uint256 _value
    ) public onlyOwner canMint returns (bool)
    {
        require(totalSupply_.add(_value) <= maxCap);

        return super.mint(_to, _value);
    }

    /**
     * @dev Sets the maxCap
     */
    function setMaxCap(
        uint256 _maxCap
    ) public onlyOwner
    {
        require(!capLocked);
        
        maxCap = _maxCap;
    }

    /**
     * @dev Override base transfer with modifier
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
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public canTransfer(_from, _value) returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Enables transfers
     */
    function enableTransfers() public onlyOwner {
        transfersAllowed = true;
    }

    /**
     * @dev Disables transfers
     */
    function disableTransfers() public onlyOwner {
        transfersAllowed = false;
    }

    /**
    * @dev Burns a specific number of tokens.
    * @param _value — The number of tokens to be burned.
    */
    function burn(uint256 _value) public onlyOwner {
        require(_value > 0);

        address burner = msg.sender;

        balances[burner] = balances[burner].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);

        Burned(burner, _value);
    }
}