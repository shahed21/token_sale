pragma solidity >=0.4.22 <0.9.0;

contract ArkoToken {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    string public name = 'Arko Token';
    string public symbol = 'ARKO';
    string public standard = 'Arko Token v1.0';

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    //Transfer Function
    function transfer(address _to, uint256 _value) public returns (bool success) {
        //Exception if account doesn't have enough tokens
        require(balanceOf[msg.sender]>=_value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
}