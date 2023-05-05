pragma solidity >=0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./trainSuretyData.sol";

/************************************************** */
/* trainSurety Smart Contract                      */
/************************************************** */
contract trainSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // train status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_railline = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
    address private contractOwner;          // Account used to deploy contract
    bool private operational = true;
    mapping(bytes32 => train) private trains;
    trainSuretyData data;


    event trainStatusInfo(address railline, string train, uint256 timestamp, uint8 status);
    event OracleReport(address railline, string train, uint256 timestamp, uint8 status);
    event OracleRequest(uint8 index, address railline, string train, uint256 timestamp);
    event OperationalChange(bool change);
    event Registeredrailline(bool threshold, uint votes);
    event Registeredtrain(bytes32 trainNumber, uint256 date);

    struct train {
        address raillineAddress;
        uint256 arrivalTime;  
        uint256 trainStatus;
        uint256 maxIndividualInsuredAmount; 
        uint256 maxTotalInsuredAmount;
        mapping(address => uint256) accountInsuredAmount;
        
    }
    
  
    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
         // Modify to call data contract's status
        require(operational, "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }
    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    modifier requireraillineIsFunded(address raillineAddress) 
    {
        require(data.isFunded(raillineAddress), "railline is not funded");
        _;
    }
    modifier requireAddressIsrailline(address _address) {
        require(data.raillineExists(_address), "Address doesn't belong with an existing railline");
        _;
    }
    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor
                                (
                                    address trainAddress
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        data = new trainSuretyData(trainAddress);
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperationalApp() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;  // Modify to call data contract's status
    }

    function setOperationalApp
                            (
                                bool mode
                            ) 
                            public
                            requireContractOwner 
                            returns(bool)
    {
        operational = mode;
        emit OperationalChange(mode);
    }

    function isOperationalData()
                                public
                                view
                                returns(bool)
    {
        return data.isOperational();
    }

    function setOperationalData(
                                    bool mode
                                )
                                external
                                requireContractOwner
                                returns(bool)
    {
        data.setOperatingStatus(mode);
        emit OperationalChange(mode);
    }

    function getRegisteredraillinesArray() public view requireIsOperational returns(address[] memory) {
        return data.getRegisteredraillinesAddresses();
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/
//    View allows you to see the return value from the async/await code in the contract.js file
    function gettrainNumberFromData(bytes32 trainCode) public view requireIsOperational 
        returns(
        uint256 arrivalT,
        uint256 status,
        uint256 totalIndividualInsuredAmount,
        uint256 individualtrainInsurees,
        address raillineCompanyAddress
        )
    {
        return (
            trains[trainCode].arrivalTime,
            trains[trainCode].trainStatus,
            trains[trainCode].maxIndividualInsuredAmount,
            trains[trainCode].accountInsuredAmount[msg.sender],
            trains[trainCode].raillineAddress
        );
    }

    function buyInsurance(bytes32 trainCode, address raillineAddress, uint256 amountBought) public payable requireIsOperational requireAddressIsrailline(raillineAddress) {
        trains[trainCode].accountInsuredAmount[msg.sender] = trains[trainCode].accountInsuredAmount[msg.sender] + amountBought;
        data.buy.value(msg.value)(raillineAddress);
    }

    
   
   /**
    * @dev Add an railline to the registration queue
    *
    */   
    function registerrailline
                            (   
                            address raillineToRegister,
                            string raillineName
                            )
                            external
                            requireIsOperational
                            // returns(address[] memory)
    {
        //First check whether the number of registered raillines is less than 5 or greater
        uint registeredraillines = data.getRegisteredraillines();
        uint totalVotes = data.getraillineVotes(raillineToRegister);
        require(data.raillineRegistered(msg.sender), "The railline currently attempting to register another railline is not registered");

        if (registeredraillines >= 4) {
            data.registerrailline(raillineToRegister, false, raillineName);
            emit Registeredrailline(true, totalVotes);
            // return data.getRegisteredraillinesAddresses();
        } else { 
            data.registerrailline(raillineToRegister, true, raillineName);
            emit Registeredrailline(true, totalVotes);
            // return data.getRegisteredraillinesAddresses();
        }    
    }
   /**
    * @dev Register a future train for insuring.
    * struct train {
        uint256 arrivalTime;  
        uint256 trainStatus;
        uint256 maxIndividualInsuredAmount; 
        uint256 maxTotalInsuredAmount;
        mapping(address => uint256) accountInsuredAmount;
        
    }
    */  
    


    function registertrain
                                (
                                    bytes32 trainNumber,
                                    uint256 date,
                                    uint256 trainStatus,
                                    uint256 maxIndividualInsuredAmount,
                                    uint256 maxTotalInsuredAmount
                                )
                                external
                                requireAddressIsrailline(msg.sender)
                                requireIsOperational
    {  
 
        require(data.raillineRegistered(msg.sender), "This address is not registered, it can not log trains");
        trains[trainNumber] =  train(msg.sender, date, trainStatus, maxIndividualInsuredAmount, maxTotalInsuredAmount);
        data.addtrainCode(trainNumber);
        emit Registeredtrain(trainNumber, date);
    }
    
    function voterailline (address votingFor) public requireIsOperational requireraillineIsFunded(msg.sender) requireAddressIsrailline(votingFor) {
        data.vote(msg.sender, votingFor);
        bool isRegistered = data.raillineRegistered(votingFor);
        uint voteCount = data.getraillineVotes(votingFor);
        uint minimumVotes = data.getRegisteredraillines().div(2);
        
        if ( voteCount > minimumVotes && !isRegistered){
            data.setraillineRegistered(votingFor);
        }
    }
   /**
    * @dev Called after oracle has updated train status
    *
    */  
    function processtrainStatus
                                (
                                    address raillineAddress,
                                    string memory train,
                                    uint256 timestamp,
                                    uint8 statusCode
                                )
                                internal
                                pure
    {
    }
    
    function fundrailline(address _address) public payable requireIsOperational requireAddressIsrailline(_address) {
        require(msg.sender == _address, "Only the railline can fund itself");
        data.fund.value(msg.value)(_address);
    }

    // Generate a request for oracles to fetch train information
    function fetchtrainStatus
                        (   
                            address railline,
                            string train,
                            uint256 timestamp                        
                        )
                        external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, railline, train, timestamp));

        
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, railline, train, timestamp);
    } 
    
// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    
    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;
    mapping(address => Oracle) private oracles;
    mapping(bytes32 => ResponseInfo) private oracleResponses;
    
    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }
    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, train, timestamp)


    // Register an oracle with the contract.
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");
        uint8[3] memory indexes = generateIndexes(msg.sender);
        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");
        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)

     /** 
        First the oracles list has to contain a address that is the same as msg.sender.
        Second the oracle must have an index (it has 3 in total) that is the same as the index provided.
     */
    modifier oracleResponseCriteria(uint8 index) {
        require((oracles[msg.sender].indexes[0] == index) 
        || (oracles[msg.sender].indexes[1] == index) 
        || (oracles[msg.sender].indexes[2] == index),
         "Index does not match oracle request");
         _;
    }
   

    function submitOracleResponse
                        (
                            uint8 index,
                            address railline,
                            string train,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
                        oracleResponseCriteria(index)
    {
        


        bytes32 key = keccak256(abi.encodePacked(index, railline, train, timestamp)); 
        require(oracleResponses[key].isOpen, "Oracle request already resolved");
        
        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(railline, train, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit trainStatusInfo(railline, train, timestamp, statusCode);

            // Handle train status as appropriate
            processtrainStatus(railline, train, timestamp, statusCode);
        }
    }


    function gettrainKey
                        (
                            address railline,
                            string train,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(railline, train, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }
}   
