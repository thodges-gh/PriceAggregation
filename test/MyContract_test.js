'use strict';

require('./support/helpers.js')

contract('MyContract', () => {
  let Link = artifacts.require("LinkToken.sol");
  let Oracle = artifacts.require("Oracle.sol");
  let MyContract = artifacts.require("MyContract.sol");
  let jobId = "4c7b7ffb66b344fbaa64995af81e355a";
  let coin = "ETH";
  let market = "USD";
  let link, oc, cc, newOc;

  beforeEach(async () => {
    link = await Link.new();
    oc = await Oracle.new(link.address, {from: oracleNode});
    newOc = await Oracle.new(link.address, {from: oracleNode});
    cc = await MyContract.new(link.address, oc.address, {from: consumer});
  });

  describe("#setJobId", () => {
    context("when called by a non-owner", () => {
      it("does not set", async () => {
        await assertActionThrows(async () => {
          await cc.setJobId(jobId, {from: stranger});
        });
      });
    });

    context("when called by the owner", () => {
      it("sets the job id", async () => {
        await cc.setJobId(jobId, {from: consumer});
      });
    });
  });

  describe("#requestEthereumPrice", () => {
    context("without a JobID", () => {
      it("reverts", async () => {
        await assertActionThrows(async () => {
          await cc.requestEthereumPrice(market, {from: consumer});
        });
      });
    });

    context("with a JobID", () => {
      beforeEach(async () => {
        await cc.setJobId(jobId, {from: consumer});
      });

      context("without LINK", () => {
        it("reverts", async () => {
          await assertActionThrows(async () => {
            await cc.requestEthereumPrice(market, {from: consumer});
          });
        });
      });

      context("with LINK", () => {
        beforeEach(async () => {
          await link.transfer(cc.address, web3.toWei('1', 'ether'));
        });

        it("triggers a log event in the Oracle contract", async () => {
          let tx = await cc.requestEthereumPrice(market, {from: consumer});
          let log = tx.receipt.logs[2];
          assert.equal(log.address, oc.address);

          let [id, jId, wei, ver, cborData] = decodeRunRequest(log);
          let params = await cbor.decodeFirst(cborData);
          let expected = {
            "path":["USD"],
            "times": 100,
            "url":"https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY"
          };

          assert.equal(`0x${toHex(rPad(jobId))}`, jId);
          assert.equal(web3.toWei('1', 'ether'), hexToInt(wei));
          assert.equal(1, ver);
          assert.deepEqual(expected, params);
        });

        it("has a reasonable gas cost", async () => {
          let tx = await cc.requestEthereumPrice(market, {from: consumer});
          assert.isBelow(tx.receipt.gasUsed, 210000);
        });
      });
    });
  });

  describe("#dynamicPriceRequest", () => {
    context("without LINK", () => {
      it("reverts", async () => {
        await assertActionThrows(async () => {
          await cc.dynamicPriceRequest(newOc.address, jobId, coin, market, {from: consumer});
        });
      });
    });

    context("with LINK", () => {
      beforeEach(async () => {
        await link.transfer(cc.address, web3.toWei('1', 'ether'));
      });

      it("reverts if either oracle or jobId are not supplied", async () => {
        await assertActionThrows(async () => {
          await cc.dynamicPriceRequest("", jobId, coin, market, {from: consumer});
        });
        await assertActionThrows(async () => {
          await cc.dynamicPriceRequest(newOc.address, "", coin, market, {from: consumer});
        });
      });

      it("triggers a log event in the Oracle contract", async () => {
        let tx = await cc.dynamicPriceRequest(newOc.address, jobId, coin, market, {from: consumer});
        let log = tx.receipt.logs[2];
        assert.equal(log.address, newOc.address);

        let [id, jId, wei, ver, cborData] = decodeRunRequest(log);
        let params = await cbor.decodeFirst(cborData);
        let expected = {
          "market":"USD",
          "coin": "ETH"
        };

        assert.equal(`0x${toHex(rPad(jobId))}`, jId);
        assert.equal(web3.toWei('1', 'ether'), hexToInt(wei));
        assert.equal(1, ver);
        assert.deepEqual(expected, params);
      });

      it("has a reasonable gas cost", async () => {
        let tx = await cc.dynamicPriceRequest(newOc.address, jobId, coin, market, {from: consumer});
        assert.isBelow(tx.receipt.gasUsed, 220000);
      });
    });
    

  });

  describe("#fulfillData", () => {
    let response = "1,000,000.00";
    let internalId;

    beforeEach(async () => {
      await link.transfer(cc.address, web3.toWei('1', 'ether'));
      await cc.setJobId(jobId, {from: consumer});
      await cc.requestEthereumPrice(market, {from: consumer});
      let event = await getLatestEvent(oc);
      internalId = event.args.internalId;
    });

    it("records the data given to it by the oracle", async () => {
      await oc.fulfillData(internalId, response, {from: oracleNode});
      let currentPrice = await cc.currentPrice.call();
      assert.equal(web3.toUtf8(currentPrice), response);
    });

    it("logs the data given to it by the oracle", async () => {
      let tx = await oc.fulfillData(internalId, response, {from: oracleNode});
      assert.equal(2, tx.receipt.logs.length);
      let log = tx.receipt.logs[0];

      assert.equal(web3.toUtf8(log.topics[2]), response);
    });

    context("when my contract does not recognize the request ID", () => {
      let otherId;

      beforeEach(async () => {
        let funcSig = functionSelector("fulfill(bytes32,bytes32)");
        let args = requestDataBytes(jobId, cc.address, funcSig, 42, "");
        await requestDataFrom(oc, link, 0, args);
        let event = await getLatestEvent(oc);
        otherId = event.args.internalId;
      });

      it("does not accept the data provided", async () => {
        await oc.fulfillData(otherId, response, {from: oracleNode});
        let received = await cc.currentPrice.call();
        assert.equal(web3.toUtf8(received), "");
      });
    });

    context("when called by anyone other than the oracle contract", () => {
      it("does not accept the data provided", async () => {
        await assertActionThrows(async () => {
          await cc.fulfill(internalId, response, {from: oracleNode})
        });

        let received = await cc.currentPrice.call();
        assert.equal(web3.toUtf8(received), "");
      });
    });
  });

  describe("#cancelRequest", () => {
    let requestId;

    beforeEach(async () => {
      await link.transfer(cc.address, web3.toWei('1', 'ether'));
      await cc.setJobId(jobId, {from: consumer});
      await cc.requestEthereumPrice(market, {from: consumer});
      let event = await getLatestEvent(oc);
      requestId = event.args.internalId;
    });

    context("when called by a non-owner", () => {
      it("cannot cancel a request", async () => {
        await assertActionThrows(async () => {
          await cc.cancelRequest({from: stranger});
        });
      });
    });

    context("when called by the owner", () => {
      it("can cancel the request", async () => {
        await cc.cancelRequest({from: consumer});
      });
    });
  });

  describe("#withdrawLink", () => {
    beforeEach(async () => {
      await link.transfer(cc.address, web3.toWei('1', 'ether'));
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
        assert.equal(afterBalance.toString(), web3.toWei('1', 'ether'));
      });
    });
  });
});
