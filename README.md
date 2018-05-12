# Chainlinked

Implementation of [How to make a Chainlinked contract](https://github.com/smartcontractkit/chainlink/wiki/How-to-make-a-Chainlinked-contract).

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
$ truffle test
```

## Deploy

Local development

```bash
$ truffle migrate --network development
```

Ropsten (requires unlocked & synced Ropsten node)

```bash
$ truffle migrate -f 4 --network ropsten --compile-all
```