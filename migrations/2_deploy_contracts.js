const ArkoToken = artifacts.require("ArkoToken");
const ArkoTokenSale = artifacts.require("ArkoTokenSale");
const totalTokens = 1000000; //Arko
//const tokenPrice = 1000000000000000;  //Wei
const tokenPrice = 1000000000000;  //Wei


module.exports = function (deployer) {
  deployer.deploy(ArkoToken, totalTokens).then(function() {
    return deployer.deploy(ArkoTokenSale, ArkoToken.address, tokenPrice);
  });
};
