# Chainlinked

Implementation of [how to make a Chainlinked contract](https://docs.chain.link/docs/getting-started).

## Requirements

- NPM
- Truffle
- Yarn
- GCC (for testing)

## Installation

```bash
$ yarn install
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