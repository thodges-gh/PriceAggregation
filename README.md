# Chainlink Price Aggregation Example

Example contract that creates 3 separate Chainlink requests and averages the responses.

## Requirements

- NPM
- Truffle
- GCC (for testing)

## Installation

```bash
$ npm install
```

## Test

```bash
$ npm test
```

## Deploy

If needed, edit the truffle.js config file to set the desired network to a different port. It assumes any network is running the RPC port on 8545.

### Local development

```bash
$ npm run deploy:dev
```

### Public chains

Requires unlocked & synced Ethereum node. Accepts `--network ropsten` and `--network rinkeby` currently.

```bash
$ truffle migrate --network ropsten --compile-all
```

There is also a flattened contract at the root directory available for importing directly into [Remix](https://remix.ethereum.org).

#### Ropsten

BraveNewCoin: "f1896c9b0b2647fbb2e56671b1470ba5", "0x89736523dE51baf4914cc57721651Df72E4F1b4B"
CoinMarketCap:"d606caef371d4d91a7afad7a8c30f02f", "0xCda5773a68dC7E18fdC600E68c3FdC414f29e7eC"
CryptoCompare: "05b53e906a7c49b1be9023a3002e3c8a", "0xC58b672f829B0f7b64339685Afb3522E7f978A00"

#### Rinkeby

BraveNewCoin: "78ffc47fef894b68af7c6f1f13767388", "0xa65DA24C87016Ba2367dB823c01b48B696F6229a"
CoinMarketCap:"e097b47bde20434a8af49b4c9f827811", "0x72eF200e2ab1A2f6dCa17a02fF05b72A9aEFeEF5"
CryptoCompare: "6315daee46ca4a5b87b448583951751e", "0xdaDd840F240c134624C430509CcFA0B04903018D"