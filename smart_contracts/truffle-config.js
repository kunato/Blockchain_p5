/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic =
    'venue make visual bargain cry hurry coyote arrive clip eager talent near';

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*' // Match any network id
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(
                    mnemonic,
                    'https://rinkeby.infura.io/v3/bdcb64d9fbfc49d093f21c59e5612794'
                );
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: 10000000000
        }
    }
};
