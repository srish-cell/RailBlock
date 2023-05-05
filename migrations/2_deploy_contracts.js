const trainSuretyApp = artifacts.require("trainSuretyApp");
const trainSuretyData = artifacts.require("trainSuretyData");
const fs = require('fs');

module.exports = async function(deployer) {
    
    let firstrailline = '0xC484B3207CBd0C0dCb3Ec5e5839CE61e60EC1c56';
    
    await deployer.deploy(trainSuretyApp, firstrailline)
    await deployer.deploy(trainSuretyData, firstrailline)
    
    /**
     *  Note that `trainSuretyData.address` is the contract address for trainSuretyData.
     *  This is being input to trainAddress for trainSurety 
     */   
    let config = {
        localhost: {
            url: 'http://localhost:8545',
            dataAddress: trainSuretyData.address,
            appAddress: trainSuretyApp.address,
            firstrailline: firstrailline
        }
    }
    // This writes to the config files in server and dapp of the various properties obtained here
    fs.writeFileSync(__dirname + '/../src/dapp/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
    fs.writeFileSync(__dirname + '/../src/server/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
    console.log("deployment successful")
}