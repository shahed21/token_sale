pragma solidity >=0.4.22 <0.9.0;

import "./ArkoToken.sol";

contract ArkoTokenSale {
    address admin;
    ArkoToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    //multiply
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y==0 || (z=x*y)/y==x);
    }

    // Provision tokens for token sale
    // Buy Token
    function buyTokens(uint256 _numberOfTokens) public payable {
        //require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens,tokenPrice));
        
        //require that there are enough tokens
        require(_numberOfTokens <= tokenContract.balanceOf(address(this)));
        
        //require that transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        //Keep track of tokens sold
        tokensSold += _numberOfTokens;
        
        //emit sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    constructor (ArkoToken _tokenContract, uint256 _tokenPrice) public {
        //Assign an admin, who will be able to end Token Sale at the end
        admin = msg.sender;
        //Token Contract
        tokenContract = _tokenContract;

        //Token Price
        tokenPrice = _tokenPrice; //in wei
    }
}