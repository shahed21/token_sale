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
            return tokenInstance.transfer.call(accounts[1], 9999999);
            //return tokenInstance.transfer(accounts[1], 99999999999999999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert')>=0, "error message for trying to transfer more than available");
            //assert(error.message.toString().indexOf('revert')>=0, error.message.toString());
            //assert(error.message, "error message must contain revert");
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

    it('approves tokens for delegated transfer', function() {
        return ArkoToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1],100);
        }).then(function(success) {
            assert.equal(success, true,'it returns true');
            return tokenInstance.approve(accounts[1], 100);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length,1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'it is an "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'event logs the account of the owner');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'event logs the account of the spender');
            assert.equal(receipt.logs[0].args._value, 100, 'event logs the amount to approve');

            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
        });
    });

    it('handles delegated transfers', function() {
        return ArkoToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spenderAccount = accounts[4];
            //  We need to setup some tokens in fromAccount by transfering some tokens there
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0] });
        }).then(function(receipt) {
            // Approve spendingAccount 30 tokens from fronAccount
            return tokenInstance.approve(spenderAccount, 30, {from: fromAccount});
        }).then(function(receipt) {
            // Test out the requirements
            // Try transfering larger amount than what fromAccount has which is 100
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spenderAccount});

        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert')>=0, "error message for trying to transfer more than from account has");
            // Try transfering larger amount than what spenderAccount has allowance for which is 30
            return tokenInstance.transferFrom(fromAccount, toAccount, 50, {from: spenderAccount});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert')>=0, "error message for trying to transfer more than spender account has allowance for");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spenderAccount});
        }).then(function(success) {
            assert.equal(success, true, 'it returns success bool');
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spenderAccount});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length,1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'it is a "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'event logs the from account');
            assert.equal(receipt.logs[0].args._to, toAccount, 'event logs the to account');
            assert.equal(receipt.logs[0].args._value, 10, 'event logs the amount of transfer');

            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, 'the to account has the ownership of the tokens transfered');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'the from account has lost ownership of the tokens transfered');
            return tokenInstance.allowance(fromAccount, spenderAccount);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 20, 'the allowance of the spender has been reduced by transfered amount');
        });
    });
});