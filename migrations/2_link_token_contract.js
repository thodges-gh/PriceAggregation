var LinkToken = artifacts.require("linktoken/contracts/LinkToken.sol");

module.exports = function(deployer, network) {
  if (network == "test" || network == "development") {
    deployer.deploy(LinkToken);
  }
};

