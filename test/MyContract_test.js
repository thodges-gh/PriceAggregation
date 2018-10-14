"use strict";

require("./support/helpers.js");

contract("MyContract", () => {
  let Link = artifacts.require("LinkToken");
  let Oracle = artifacts.require("Oracle");
  let MyContract = artifacts.require("MyContract");
  // JobIDs can be made up in tests, but these are valid on Ropsten
  let jobId1 = "f1896c9b0b2647fbb2e56671b1470ba5"; // BraveNewCoin. Rinkeby: "78ffc47fef894b68af7c6f1f13767388", "0xa65DA24C87016Ba2367dB823c01b48B696F6229a"
  let jobId2 = "d606caef371d4d91a7afad7a8c30f02f"; // CoinMarketCap. Rinkeby:"e097b47bde20434a8af49b4c9f827811", "0x72eF200e2ab1A2f6dCa17a02fF05b72A9aEFeEF5"
  let jobId3 = "05b53e906a7c49b1be9023a3002e3c8a"; // CryptoCompare. Rinkeby: "6315daee46ca4a5b87b448583951751e", "0xdaDd840F240c134624C430509CcFA0B04903018D"
  let link, oc1, oc2, oc3, cc;

  beforeEach(async () => {
    link = await Link.new();
    oc1 = await Oracle.new(link.address, {from: oracleNode1});
    oc2 = await Oracle.new(link.address, {from: oracleNode2});
    oc3 = await Oracle.new(link.address, {from: oracleNode3});
    cc = await MyContract.new(link.address, {from: consumer});
  });

  describe("#addRequest", () => {
    context("when called by a non-owner", () => {
      it("does not set", async () => {
        await assertActionThrows(async () => {
          await cc.addRequest(jobId1, oc1.address, {from: stranger});
        });
      });
    });

    context("when called by the owner", () => {
      it("sets the job id", async () => {
        await cc.addRequest(jobId1, oc1.address, {from: consumer});
      });
    });
  });

  describe("#createRequests", () => {
    beforeEach(async () => {
      await cc.addRequest(jobId1, oc1.address, {from: consumer});
      await cc.addRequest(jobId2, oc2.address, {from: consumer});
      await cc.addRequest(jobId3, oc3.address, {from: consumer});
    });

    context("without LINK", () => {
      it("reverts", async () => {
        await assertActionThrows(async () => {
          await cc.createRequests({from: consumer});
        });
      });
    });

    context("with LINK", () => {
      beforeEach(async () => {
        await link.transfer(cc.address, web3.toWei("3", "ether"));
      });

      it("creates a log on each oracle contract", async () => {
        await cc.createRequests({from: consumer});
        let event1 = await getLatestEvent(oc1);
        assert.equal(cc.address, event1.args.requester);
        let event2 = await getLatestEvent(oc2);
        assert.equal(cc.address, event2.args.requester);
        let event3 = await getLatestEvent(oc3);
        assert.equal(cc.address, event3.args.requester);
      });

    });
  });

  describe("#fulfill", () => {
    let response1 = "0x" + encodeUint256(15000);
    let response2 = "0x" + encodeUint256(15500);
    let response3 = "0x" + encodeUint256(15200);
    let internalId1, internalId2, internalId3;

    beforeEach(async () => {
      await link.transfer(cc.address, web3.toWei("3", "ether"));
      await cc.addRequest(jobId1, oc1.address, {from: consumer});
      await cc.addRequest(jobId2, oc2.address, {from: consumer});
      await cc.addRequest(jobId3, oc3.address, {from: consumer});
      await cc.createRequests({from: consumer});
      let event1 = await getLatestEvent(oc1);
      let event2 = await getLatestEvent(oc2);
      let event3 = await getLatestEvent(oc3);
      internalId1 = event1.args.internalId;
      internalId2 = event2.args.internalId;
      internalId3 = event3.args.internalId;
    });

    it("records the data given to it by the oracle", async () => {
      let expected = 15233;
      await oc1.fulfillData(internalId1, response1, {from: oracleNode1});
      await oc2.fulfillData(internalId2, response2, {from: oracleNode2});
      await oc3.fulfillData(internalId3, response3, {from: oracleNode3});
      let averagePrice = await cc.averagePrice.call();
      assert.equal(averagePrice.toNumber(), expected);
    });

    context("when my contract does not recognize the request ID", () => {
      let otherId;

      beforeEach(async () => {
        let funcSig = functionSelector("fulfill(bytes32,uint256)");
        let args = requestDataBytes(jobId1, cc.address, funcSig, 42, "");
        await requestDataFrom(oc1, link, 0, args);
        let event = await getLatestEvent(oc1);
        otherId = event.args.internalId;
      });

      it("does not accept the data provided", async () => {
        await oc1.fulfillData(otherId, response1, {from: oracleNode1});
        let received = await cc.averagePrice.call();
        assert.equal(received, 0);
      });
    });

    context("when called by anyone other than the oracle contract", () => {
      it("does not accept the data provided", async () => {
        await assertActionThrows(async () => {
          await cc.fulfill(internalId1, response1, {from: oracleNode1});
        });

        let received = await cc.averagePrice.call();
        assert.equal(received, 0);
      });
    });
  });

  describe("#manualAggregateAnswer", () => {
    let response1 = "0x" + encodeUint256(15000);
    let response2 = "0x" + encodeUint256(15500);
    let expected = 15250;
    let internalId1, internalId2;

    beforeEach(async () => {
      await link.transfer(cc.address, web3.toWei("3", "ether"));
      await cc.addRequest(jobId1, oc1.address, {from: consumer});
      await cc.addRequest(jobId2, oc2.address, {from: consumer});
      await cc.addRequest(jobId3, oc3.address, {from: consumer});
      await cc.createRequests({from: consumer});
      let event1 = await getLatestEvent(oc1);
      let event2 = await getLatestEvent(oc2);
      internalId1 = event1.args.internalId;
      internalId2 = event2.args.internalId;
      await oc1.fulfillData(internalId1, response1, {from: oracleNode1});
      await oc2.fulfillData(internalId2, response2, {from: oracleNode2});
    });

    context("when an oracle did not respond", () => {
      it("only aggregates the responses", async () => {
        await cc.manualAggregateAnswer({from: consumer});
        let averagePrice = await cc.averagePrice.call();
        assert.equal(averagePrice.toNumber(), expected);
      });
    });
  });

  describe("#cancelRequest", () => {
    beforeEach(async () => {
      await link.transfer(cc.address, web3.toWei("1", "ether"));
      await cc.addRequest(jobId1, oc1.address, {from: consumer});
      await cc.createRequests({from: consumer});
    });

    context("when called by a non-owner", () => {
      it("cannot cancel a request", async () => {
        await assertActionThrows(async () => {
          await cc.cancelRequest(1, {from: stranger});
        });
      });
    });

    context("when called by the owner", () => {
      it("can cancel the request", async () => {
        await increaseTime5Minutes();
        await cc.cancelRequest("0x0000000000000000000000000000000000000000000000000000000000000001", {from: consumer});
      });
    });
  });

  describe("#withdrawLink", () => {
    beforeEach(async () => {
      await link.transfer(cc.address, web3.toWei("1", "ether"));
    });

    context("when called by a non-owner", () => {
      it("cannot withdraw", async () => {
        await assertActionThrows(async () => {
          await cc.withdrawLink({from: stranger});
        });
      });
    });

    context("when called by the owner", () => {
      it("transfers LINK to the owner", async () => {
        const beforeBalance = await link.balanceOf(consumer);
        assert.equal(beforeBalance.toString(), "0");
        await cc.withdrawLink({from: consumer});
        const afterBalance = await link.balanceOf(consumer);
        assert.equal(afterBalance.toString(), web3.toWei("1", "ether"));
      });
    });
  });
});
