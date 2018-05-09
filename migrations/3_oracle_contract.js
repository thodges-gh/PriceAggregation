var Oracle = artifacts.require("chainlink/solidity/contracts/Oracle.sol");
var LinkToken = artifacts.require("linktoken/contracts/LinkToken.sol");

module.exports = function(deployer, network) {
  if (network == "test" || network == "development") {
    deployer.deploy(Oracle, LinkToken.address);
  }
};
