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