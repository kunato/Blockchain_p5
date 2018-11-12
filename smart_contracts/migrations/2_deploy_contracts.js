var StarNotary = artifacts.require('./StarNotary.sol');
module.exports = function(deployer) {
    deployer.deploy(StarNotary).then(() => console.log(StarNotary.address));
    // Additional contracts can be deployed here
};
