var MyContract = artifacts.require("./MyContract.sol");
var Oracle = artifacts.require("./Oracle.sol");
var LinkToken = artifacts.require("./LinkToken.sol");

module.exports = function(deployer, network) {
  if (network == "ropsten") {
    deployer.deploy(MyContract, "0x20fE562d797A42Dcb3399062AE9546cd06f63280", "0x5be84B6381d45579Ed04A887B8473F76699E0389", "0x3236363037363337303734333466333562623538613964623333656531383033");
  } else {
    deployer.deploy(MyContract, LinkToken.address, Oracle.address, "0x3463376237666662363662333434666261613634393935616638316533353561");
  }
};
