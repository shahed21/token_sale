const ArkoToken = artifacts.require("ArkoToken");

module.exports = function (deployer) {
  deployer.deploy(ArkoToken, 1000000);
};
