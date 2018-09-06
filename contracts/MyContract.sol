pragma solidity ^0.4.24;

import "chainlink/solidity/contracts/Chainlinked.sol";

contract MyContract is Chainlinked, Ownable {
  bytes32 internal requestId;
  bytes32 internal jobId;
  bytes32 public currentPrice;

  event RequestFulfilled(
    bytes32 indexed requestId,
    bytes32 indexed price
  );

  constructor(address _link, address _oracle) public {
    setLinkToken(_link);
    setOracle(_oracle);
  }

  function setJobId(bytes32 _jobId) public onlyOwner {
    jobId = _jobId;
  }

  function requestEthereumPrice(string _currency)
    public
    onlyOwner
    withJobId
  {
    ChainlinkLib.Run memory run = newRun(jobId, this, "fulfill(bytes32,bytes32)");
    run.add("url", "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY");
    string[] memory path = new string[](1);
    path[0] = _currency;
    run.addStringArray("path", path);
    run.addInt("times", 100);
    requestId = chainlinkRequest(run, LINK(1));
  }

  function dynamicPriceRequest(address _oracle, bytes32 _jobId, string _coin, string _market)
    public
    onlyOwner
  {
    require(_oracle != address(0), "Oracle address must be present");
    require(_jobId != 0x0, "Job ID must be present");
    setOracle(_oracle);
    ChainlinkLib.Run memory run = newRun(_jobId, this, "fulfill(bytes32,bytes32)");
    run.add("coin", _coin);
    run.add("market", _market);
    requestId = chainlinkRequest(run, LINK(1));
  }

  function cancelRequest()
    public
    onlyOwner
  {
    oracle.cancel(requestId);
  }

  function fulfill(bytes32 _requestId, bytes32 _price)
    public
    checkChainlinkFulfillment(_requestId)
  {
    emit RequestFulfilled(_requestId, _price);
    currentPrice = _price;
  }

  function withdrawLink() onlyOwner public {
    require(link.transfer(owner, link.balanceOf(address(this))), "Unable to transfer");
  }

  modifier withJobId() {
    require(jobId != 0x00, "No JobID present");
    _;
  }
}