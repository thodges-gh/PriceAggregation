var Migrations = artifacts.require("Migrations");

module.exports = function(deployer, network) {
  if (network == "test" || network == "development") {
    deployer.deploy(Migrations);
  }
};
