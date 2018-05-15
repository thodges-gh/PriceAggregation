var Oracle = artifacts.require("./Oracle.sol");
var LinkToken = artifacts.require("./LinkToken.sol");

module.exports = function(deployer, network) {
  if (network == "test" || network == "development") {
    deployer.deploy(Oracle, LinkToken.address);
  }
};
