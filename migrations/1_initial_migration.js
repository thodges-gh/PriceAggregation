var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  if (network == "test" || network == "development") {
    deployer.deploy(Migrations);
  }
};
