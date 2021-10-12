const ArkoToken = artifacts.require("ArkoToken");

contract ('ArkoToken', function(accounts) {
    var tokenInstance;
    it('initializes the contract with the correct values', function() {
        return ArkoToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, 'Arko Token', 'has the correct name');
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'ARKO', 'has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'Arko Token v1.0', 'has the correct standard');
        });
    });

    it('allocates the total supply upon deployment', function() {
        return ArkoToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, 'allocates initial supply to admin account');
        });
    });

    it('transfers token ownership', function() {
        return ArkoToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 99999999999999999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message, "error message must contain revert");
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0] });
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length,1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'it is a "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'event logs the from account');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'event logs the to account');
            assert.equal(receipt.logs[0].args._value, 250000, 'event logs the amount of transfer');

            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), (1000000-250000), 'account 0 has released ownership of the transferred amount')
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'account 1 has received ownership of the transferred amount')
        });
    });
});