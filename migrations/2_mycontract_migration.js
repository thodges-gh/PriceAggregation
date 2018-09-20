var MyContract = artifacts.require("./MyContract.sol");
var Oracle = artifacts.require("./Oracle.sol");
var LinkToken = artifacts.require("./LinkToken.sol");

module.exports = function(deployer, network) {
  switch (network) {
  case "ropsten":
    deployer.deploy(MyContract, "0x20fE562d797A42Dcb3399062AE9546cd06f63280", "0x18170370BceC331F31d41B9b83DE772F5Bd47D82");  
    break;
  case "rinkeby":
    deployer.deploy(MyContract, "0x01BE23585060835E02B77ef475b0Cc51aA1e0709", "0xd1639233c9604904b4D8b5C8a2927986066D3789");
    break;
  default:
    deployer.deploy(LinkToken).then( function() {
      deployer.deploy(Oracle, LinkToken.address).then( function() {
        deployer.deploy(MyContract, LinkToken.address, Oracle.address);
      });
    });
    break;
  }
};