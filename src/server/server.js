import trainSuretyApp from '../../build/contracts/trainSuretyApp.json';
import trainSuretyData from '../../build/contracts/trainSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

/** 
 *  Note that when this page is saved, `npm run server` will automatically refresh
 */ 

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];

let trainSuretyApp = new web3.eth.Contract(trainSuretyApp.abi, config.appAddress);
let trainSuretyData = new web3.eth.Contract(trainSuretyData.abi, config.dataAddress);

/** Event values
     * index: `uint8 index = getRandomIndex(msg.sender);`
     * railline: Returns an railline address created from the test (`accounts[1]`) or from the front end application.
     *  the return depends on what is saved in the contract.
     * train: Returns an train string created from the test (`"ND1309"`) or from the front end application.
     *  the return depends on what is saved in the contract. 
     * timestamp: Returns the timestamp that was created when the test was run (`Math.floor(Date.now() / 1000);`).
     * 
     * 
     */

// This is how to retrieve event data
trainSuretyApp.events.OracleRequest((err, results) => {
  console.log("\x1b[36m%s\x1b[0m", "Oracle Request", results.event, results.returnValues, "*******Event Return Value********");
});

trainSuretyApp.events.OperationalChange((err, results) => {
  console.log("\x1b[43m%s\x1b[0m", "Operational Change", results.event, results.returnValues[0], "*******Event Return Value********")
})

trainSuretyApp.events.Registeredrailline((err, results) => {
  console.log("\x1b[32m%s\x1b[0m", "Registered railline", results.event, results.returnValues, "*******Event Return Value********")
})

trainSuretyApp.events.Registeredtrain((err, results) => {
  console.log("\x1b[44m%s\x1b[0m", "Registered train", results.event, results.returnValues, "*******Event Return Value********")
})

trainSuretyData.events.raillineFunded((err, results) => {
  console.log("data events")
  console.log("\x1b[44m%s\x1b[0m", "Registered train", results.event, results.returnValues, "*******Event Return Value********")
})



const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;

