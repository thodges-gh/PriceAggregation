var MyContract = artifacts.require("./MyContract.sol");
var Oracle = artifacts.require("./Oracle.sol");
var LinkToken = artifacts.require("./LinkToken.sol");

module.exports = function(deployer, network) {
  if (network == "ropsten") {
    deployer.deploy(MyContract, "0x20fE562d797A42Dcb3399062AE9546cd06f63280", "0xB68145133973411b7B3F2726A625FE3f3808240D");
  } else {
    deployer.deploy(MyContract, LinkToken.address, Oracle.address);
  }
};
