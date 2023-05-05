
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('train Surety Tests ------------------------------------------------------------------------------------------------', async (accounts) => {

  var config;

  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.trainSuretyData.authorizeCaller(config.trainSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.trainSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.trainSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.trainSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.trainSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.trainSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.trainSuretyData.setOperatingStatus(true);

  });

  it('(railline) cannot register an railline using registerrailline() if it is not funded', async function() {
    
    // ARRANGE
    let newrailline = accounts[3];
        
    try {
        // await config.trainSuretyApp.fundrailline(config.firstrailline, {from: config.firstrailline, value: web3.utils.toWei('10', "ether")});
        const result = await config.trainSuretyApp.registerrailline(newrailline, {from: config.firstrailline});
        console.log(result, "line 83");
    } catch(e) {
        console.log(e);
        console.log(e.logs[0]);
        // assert.equal(false, true, "Error when registering the railline");
    }

    let result = await config.trainSuretyData.raillineRegistered.call(newrailline); 

    // ASSERT
    assert.equal(result, false, "railline should not be able to register another railline if it hasn't provided funding");

  });
  
  it('the railline can fund itself', async function() {

    await config.trainSuretyData.raillineFunded({}, (error, res)=> {
        console.log(res,error, "railline funded or not, line 98");
    });

    let startingFundedCount = await config.trainSuretyData.numberOfFundedraillines.call();    
    
    try {
        await config.trainSuretyApp.fundrailline(config.firstrailline, {from: config.firstrailline});
    }
    catch(e) {
        console.log(e.message, "ERROR");
    }
    console.log(accounts[0], `first railline ${config.firstrailline}`, `balance: ${web3.eth.getBalance(config.firstrailline).then(console.log)}`);
    
    let endingFundedCount = await config.trainSuretyData.numberOfFundedraillines.call();
    
    assert.equal(endingFundedCount.toNumber(), startingFundedCount.toNumber() + 1 , "funded count did not increase");


    let result = await config.trainSuretyData.isFunded.call(config.firstAirlinse); 

    assert.equal(result, true, "railline funding is not successful");
  })
  
//   it('(railline) can vote for an railline  voteForrailline() if it is funded', async () => {


//     // ARRANGE
//     let newrailline = accounts[4];
//     console.log(newrailline);
//     let startVoteCount = 0;
//     // ACT
//     try {
//       await config.trainSuretyApp.fundrailline(config.firstrailline, {from: config.firstrailline,value: web3.utils.toWei('10', "ether")});
//       await config.trainSuretyApp.registerrailline(newrailline, {from: config.firstrailline});
//       startVoteCount = await config.trainSuretyData.getraillineVotesCount.call(newrailline, {from: config.firstrailline});
//       console.log(startVoteCount.toNumber());
//       await config.trainSuretyApp.voteForrailline(newrailline, {from: config.firstrailline});
//     }
//     catch(e) {
//       assert.equal(e, true, "Error in try");
//     }
//     let endVoteCount = await config.trainSuretyData.getraillineVotesCount.call(newrailline, {from: config.firstrailline});
//     console.log(endVoteCount.toNumber());

//     // ASSERT
//     assert.equal(endVoteCount.toNumber(), startVoteCount.toNumber() + 1, "Funded railline was not able to vote for a registered railline");

//   });

//   it('5th (railline) will be added but not registered', async () => {


//     // ARRANGE
//     let startingRegistereraillineCount = await config.trainSuretyData.getRegisteredraillinesCount.call( {from: config.firstrailline});
//     let startingExistraillineCount = await config.trainSuretyData.getExistraillinesCount.call({from: config.firstrailline});

//     // ACT
//     try {
//       await config.trainSuretyApp.fundrailline(config.firstrailline, {from: config.firstrailline,value: web3.utils.toWei('10', "ether")});
//       await config.trainSuretyApp.registerrailline(accounts[4], {from: config.firstrailline});
//       await config.trainSuretyApp.registerrailline(accounts[5], {from: config.firstrailline});
//       await config.trainSuretyApp.registerrailline(accounts[6], {from: config.firstrailline});
//       await config.trainSuretyApp.registerrailline(accounts[7], {from: config.firstrailline});
//     }
//     catch(e) {
//       assert.equal(e, true, "Error in try");
//     }
//     let endingRegistereraillineCount = await config.trainSuretyData.getRegisteredraillinesCount.call( {from: config.firstrailline});
//     let endingExistraillineCount = await config.trainSuretyData.getExistraillinesCount.call({from: config.firstrailline});

//     // console.log(startingRegistereraillineCount.toNumber(), existraillineCount.toNumber());

//     // ASSERT
//     assert.equal(startingExistraillineCount.toNumber(), endingExistraillineCount.toNumber() - 1 , "Funded railline was not able to vote for a registered railline");

//   });


});
