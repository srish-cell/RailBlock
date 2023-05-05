
const Test = require('../config/testConfig.js');
//var BigNumber = require('bignumber.js');

contract('Oracles ------------------------------------------------------------------------------------------------', async (accounts) => {

  const TEST_ORACLES_COUNT = 20;
  var config;
  var appInstance;
  var contractOwner;

  const STATUS_CODE_UNKNOWN = 0;
  const STATUS_CODE_ON_TIME = 10;
  const STATUS_CODE_LATE_railline = 20;
  const STATUS_CODE_LATE_WEATHER = 30;
  const STATUS_CODE_LATE_TECHNICAL = 40;
  const STATUS_CODE_LATE_OTHER = 50;

  before('setup contract', async () => {
    config = await Test.Config(accounts);
    appInstance = await config.trainSuretyApp;
    contractOwner = accounts[0]

  });
 
  /**
  * Remember each `it` function impacts the next `it` function.
  */
  
  it('can register oracles', async () => {
    let fee = await appInstance.REGISTRATION_FEE.call();

      
      /**
       * This `registerOracle` contract function requires a registration fee of 1 ether.
       * This for loop runs through the 20 test oracles and appends them onto the contract data object `mapping(address => Oracle) private oracles`.
       * Each one of the 20 oracles has 3 indexes.
       */

      await appInstance.registerOracle({ from: accounts[0], value: fee });
      let result = await appInstance.getMyIndexes.call({from: accounts[0]});
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
    
  });

  it('can request train status', async () => {
    
    let train = 'ND1309'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);

    console.log(appInstance.address, "events 51")
    /**
    * Since the index assigned to each test account is opaque by design
    * loop through all the accounts and for each account, all its Indexes (indices?)
    * and submit a response. The contract will reject a submission if it was
    * not requested so while sub-optimal, it's a good test of that feature
    */
    
    

      /**
       * This `getMyIndexes` contract function returns the 3 indexes from the specified account.
       * These 3 indexes were created above in the `registerOracle` function in the previous `it`.
       * @param `oracleIndexes` This gets the indexes from the account specified which was generated in the `registerOracle` function.
       */

      let oracleIndexes = await appInstance.getMyIndexes.call({ from: accounts[20] });
      await config.trainSuretyApp.fetchtrainStatus(accounts[0], train, timestamp, { from : accounts[20] });

      for(let idx=0;idx<3;idx++) {
        console.log("line 72")
        try {
          await appInstance.submitOracleResponse(accounts[0], train, timestamp, STATUS_CODE_ON_TIME, { from: accounts[20] });
          console.log("line 73")
          
        }
        catch(e) {
          
           console.log('\nError', ` error: ${e}, idx ${idx}`, `Oracle Index ${oracleIndexes[idx].toNumber()}`, train, timestamp);
        }

      }

  });


 
});
