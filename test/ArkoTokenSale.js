const ArkoToken = artifacts.require("ArkoToken");
const ArkoTokenSale = artifacts.require("ArkoTokenSale");

contract ('ArkoTokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var numberOfTokens;
    //var tokenPrice = 1000000000000000; //in wei
    var tokenPrice = 1000000000000; //in wei
    var tokensAvailableForSale = 750000; // in Arko

    it('intializes the contract with the correct values', function() {
        return ArkoTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has the token sale contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has the token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price.toNumber(), tokenPrice, 'tokenPrice set correctly');
        });
    });

    it('facilitates token buying', function() {
        return ArkoToken.deployed().then(function(instance) {
            
            //grab tokenInstance first
            tokenInstance = instance;
            return ArkoTokenSale.deployed();
        }).then(function(instance) {
            
            //then grab tokenSaleInstance
            tokenSaleInstance = instance;
            
            //provision 75% of all tokens for token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailableForSale, {from: admin});
        }).then(function(receipt) {

            //Try to make a valid purchase of tokens by buyer
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length,1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'it is a "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'event logs the buyer account');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'event logs the number of tokens sold');
            
            //check the number of tokens sold
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');

            //check the number of tokens buyer has after sale
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens, 'buyer balance matches tokens purchased');

            //check the number of tokens the contract has after sale
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailableForSale-numberOfTokens, 'contract balance lost tokens purchased');

            //try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value:  1});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert')>=0, 'msg.value must equal number of wei');
            
            //Try to buy more tokens than available
            //numberOfTokens = 750000;
            numberOfTokens = 750001;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert')>=0, 'must not try to purchase more tokens than available');
            //assert(error.message.toString().indexOf('revert')>=0, error.message.toString());
        });
    });

    it('ends token sale', function() {
        return ArkoToken.deployed().then(function(instance) {
            
            //grab tokenInstance first
            tokenInstance = instance;
            return ArkoTokenSale.deployed();
        }).then(function(instance) {
            
            //then grab tokenSaleInstance
            tokenSaleInstance = instance;

            //store the admin ether balance
            return web3.eth.getBalance(admin);
        }).then(function(balance) {
            adminEthBalance = parseInt(balance);
            
            //check if the contract has ether balance.  It should not be zero after some token sale
            return web3.eth.getBalance(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.notEqual(parseInt(balance), 0, 'contract should have ether proceeds');
            //assert.notEqual(parseInt(balance), 0, balance);
            //Store the ether balance in the contract
            contractEthBalance = parseInt(balance);

            //Try to end sale from account other than the admin
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.toString().indexOf('revert')>=0, error.message.toString());
            //assert(error.message.toString().indexOf('revert')>=0, 'must be admin to end sale');

            //check if the contract still has ether balance.  It should not be zero after failed end sale command
            return web3.eth.getBalance(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.notEqual(parseInt(balance), 0, 'contract should still have ether proceeds');
            //assert.notEqual(parseInt(balance), 0, balance);

            //end sale from admin
            return tokenSaleInstance.endSale({from: admin});
        }).then(function(receipt) {

            //Check the balance of Arko Tokens in admin
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold Arko tokens to admin');

            //check the balance of ether is zero for the contract
            return web3.eth.getBalance(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(parseInt(balance), 0, 'contract has returned all ether proceeds to admin');
            //assert.equal(parseInt(balance), 0, balance);
        });
    });
});