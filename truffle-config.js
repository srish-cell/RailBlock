// Use HDWalletProvider to sign transactions
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "figure moon return eager carpet brother swing oven stone swarm cabbage enroll";


module.exports = {
  networks: {
    development: {
       provider: function() {
         return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/");
       },
      host:"127.0.0.1",
      port:"8545",
      network_id: '*',
      websockets: true
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};