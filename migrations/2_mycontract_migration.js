var MyContract = artifacts.require("./MyContract.sol");
var Oracle = artifacts.require("./Oracle.sol");
var LinkToken = artifacts.require("./LinkToken.sol");

module.exports = function(deployer, network) {
  switch (network) {
    case "ropsten":
      deployer.deploy(MyContract, "0x20fE562d797A42Dcb3399062AE9546cd06f63280", "0xB68145133973411b7B3F2726A625FE3f3808240D");  
      break;
    case "rinkeby":
      deployer.deploy(MyContract, "0x01BE23585060835E02B77ef475b0Cc51aA1e0709", "0x1b12694E8651389c5BB3C094E8fb7e5609b663E7");
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