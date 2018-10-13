var MyContract = artifacts.require("MyContract");
var Oracle = artifacts.require("Oracle");
var LinkToken = artifacts.require("LinkToken");

module.exports = function(deployer, network) {
  switch (network) {
  case "ropsten":
    deployer.deploy(MyContract, "0x20fE562d797A42Dcb3399062AE9546cd06f63280", "0x261a3F70acdC85CfC2FFc8badE43b1D42bf75D69");  
    break;
  case "rinkeby":
    deployer.deploy(MyContract, "0x01BE23585060835E02B77ef475b0Cc51aA1e0709", "0xf18455e70984e8fda0ADbe2c8dD21509DBeFA218");
    break;
  default:
    deployer.deploy(LinkToken).then( function() {
      deployer.deploy(Oracle, LinkToken.address).then( function() {
        deployer.deploy(MyContract, LinkToken.address);
      });
    });
    break;
  }
};