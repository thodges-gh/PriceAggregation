module.exports = {
  network: "test",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    ropsten: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "3",
    },
    rinkeby: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "4",
    }
  }
};
