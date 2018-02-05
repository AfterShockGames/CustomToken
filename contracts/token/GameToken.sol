pragma solidity ^0.4.4;

import '../../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract GameToken is MintableToken {

    uint256 public constant DECIMALS = 18;
    string public constant NAME   = "GameToken";
    string public constant SYMBOL = "GAM";

    uint256 public coinCap;
    /** The Buyable coin price */
    uint256 public coinPrice;
    bool public capLocked = false;

    bool private transfersAllowed = false;

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
        require(transfersAllowed || _sender == owner);
        _;
    }

    /**
     * @dev Construct.
     * 
     * @param _coinCap The coin cap.
     */
    function GameToken(
        uint256 _coinCap
    ) public
    {
        coinCap = _coinCap;
    }

    /**
     * @dev unlock the token for free transfers.
     */
    function unlockTransfers() public onlyOwner returns (bool) {
        transfersAllowed = true;

        return true;
    }

    /**
     * @dev Lock the token from any transfers. 
     */
    function lockTransfers() public onlyOwner returns (bool) {
        transfersAllowed = false;

        return true;
    }

    /**
     * @dev Locks the market cap stopping any new minting.
     *      This will never allow the cap to edited again!
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
     */
    function getCoinPrice() public view returns (uint256) {
        return coinPrice;
    }

    /**
     * @dev Add override for set coinCap.
     * 
     * @param _to Address to send the minted coins to.
     * @param _value The amount of coins to mint.
     */
    function mint(
        address _to,
        uint256 _value
    ) public onlyOwner canMint returns (bool)
    {
        require(totalSupply_.add(_value) <= coinCap);

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
        require(!capLocked);
        
        coinCap = _coinCap;
    }

    /**
     * @dev Gets the coinCap
     */
    function getCoinCap() public view returns (uint256) {
        return coinCap;
    }

    /**
     * @dev Override base transfer with modifier.
     * 
     * @param _to The address to transfer to.
     * @param _value The value to transfer.
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
    * @dev Burns a specific number of tokens.
    * 
    * @param _value — The number of tokens to be burned.
    */
    function burn(uint256 _value) public onlyOwner {
        require(_value > 0);

        address burner = msg.sender;

        balances[burner] = balances[burner].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);

        Burned(burner, _value);
    }

    /**
     * @dev BuyTokens function which allows users to buy tokens
     */
    function buyTokens() public payable returns (uint256 _amount) {
        //To be further specified
    }
}