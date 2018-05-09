module.exports = {
  network: "test",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 18545,
      network_id: "*",
      gas: 4700000
    },
    ropsten: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 4700000
    }
  }
};
