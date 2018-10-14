var MyContract = artifacts.require("MyContract");
var Oracle = artifacts.require("Oracle");
var LinkToken = artifacts.require("LinkToken");

module.exports = function(deployer, network) {
  switch (network) {
  case "ropsten":
    deployer.deploy(MyContract, "0x20fE562d797A42Dcb3399062AE9546cd06f63280");  
    break;
  case "rinkeby":
    deployer.deploy(MyContract, "0x01BE23585060835E02B77ef475b0Cc51aA1e0709");
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