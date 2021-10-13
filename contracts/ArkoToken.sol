pragma solidity >=0.4.22 <0.9.0;

contract ArkoToken {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    string public name = 'Arko Token';
    string public symbol = 'ARKO';
    string public standard = 'Arko Token v1.0';
    mapping(address => mapping(address=>uint256)) public allowance;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    //Approve Event
    event Approval(
        address indexed _owner,
        address indexed _spender,
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
    
    //Approve
    function approve(address _spender, uint256 _value) public returns (bool success) {
        //handles allowance
        allowance[msg.sender][_spender] = _value;

        //emits approve event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    //TransferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        //require that the _from has enough tokens
        require(balanceOf[_from]>=_value);
        //require that the allowance is big enough
        require(allowance[_from][msg.sender]>=_value);
        //change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to]+= _value;
        //update the allowance
        allowance[_from][msg.sender]-=_value;
        //emit Transfer(_from, _to, _value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
}