pragma solidity ^0.4.24;

import "chainlink/solidity/contracts/Chainlinked.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract MyContract is Chainlinked, Ownable {

  using SafeMath for uint256;

  uint256 public averagePrice;
  uint256 internal createdRequestCount = 1;
  uint256 internal responseCount = 1;
  uint256 internal pendingRequestCount = 0;
  uint256 internal activeRequestCount = 0;

  struct Request{
    bytes32 jobId;
    bool fulfilled;
    address oracle;
    uint256 data;
  }

  mapping(bytes32 => Request) internal requests;

  event RequestFulfilled(
    bytes32 indexed requestId,
    uint256 indexed price
  );

  constructor(address _link) public {
    setLinkToken(_link);
  }

  function addRequest(string _jobId, address _oracle)
    public
    onlyOwner
  {
    requests[bytes32(createdRequestCount)] = Request(stringToBytes32(_jobId), false, _oracle, 0);
    createdRequestCount = createdRequestCount.add(1);
    pendingRequestCount = pendingRequestCount.add(1);
  }

  function createRequests()
    public
    onlyOwner
  {
    uint i = 1;
    for(; i <= pendingRequestCount; i++) {
      requestPrice(requests[bytes32(i)].jobId, requests[bytes32(i)].oracle);
    }
    activeRequestCount = i.sub(1);
  }

  function requestPrice(bytes32 _jobId, address _oracle)
    internal
  {
    setOracle(_oracle);
    ChainlinkLib.Run memory run = newRun(_jobId, this, "fulfill(bytes32,uint256)");
    chainlinkRequest(run, LINK(1));
  }

  function fulfill(bytes32 _requestId, uint256 _data)
    public
    checkChainlinkFulfillment(_requestId)
  {
    emit RequestFulfilled(_requestId, _data);
    requests[_requestId].fulfilled = true;
    requests[_requestId].data = _data;
    responseCount = responseCount.add(1);
    pendingRequestCount = pendingRequestCount.sub(1);
    aggregateAnswer();
  }

  function aggregateAnswer()
    internal
  {
    if (pendingRequestCount == 0) {
      uint256 tempData = 0;
      for(uint i = 1; i <= activeRequestCount; i++) {
        tempData = tempData.add(requests[bytes32(i)].data);
        delete requests[bytes32(i)];
      }
      averagePrice = tempData.div(activeRequestCount);
      activeRequestCount = 0;
      pendingRequestCount = 0;
    }
  }

  function manualAggregateAnswer()
    public
    onlyOwner
  {
    if (activeRequestCount != pendingRequestCount) {
      uint256 start = createdRequestCount.sub(activeRequestCount);
      for (; start < createdRequestCount; start++) {
        if (requests[bytes32(start)].fulfilled == false) {
          delete requests[bytes32(start)];
          activeRequestCount = activeRequestCount.sub(1);
          pendingRequestCount = pendingRequestCount.sub(1);
        }
      }
      aggregateAnswer();
    } else {
      aggregateAnswer();
    }
  }

  function cancelRequest(bytes32 _requestId)
    public
    onlyOwner
  {
    cancelChainlinkRequest(_requestId);
  }

  function withdrawLink()
    public
    onlyOwner
  {
    LinkTokenInterface link = LinkTokenInterface(chainlinkToken());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  }

  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      result := mload(add(source, 32))
    }
  }
}