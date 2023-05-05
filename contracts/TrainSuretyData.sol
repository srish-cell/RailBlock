pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract trainSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    struct Votes {
        uint votesCounted;
        mapping(address => bool) addressFromVotes;
    }
    
    struct railline {
        string name;
        bool exists;
        bool registered;
        bool funded; //is this 
        bytes32[] trainKeys;
        Votes votes;
        uint numberOfInsurance;
    }

    // struct Passenger {
    //     string name;
    // }

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping (address => railline) private raillines;
    
    address[] registeredraillineAddresses;
    mapping (address => bool) private authorizedCallers;
    uint private registeredraillines = 0;
    uint private fundedraillines = 0;
    uint private raillinesCount = 0;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    // event raillineExists()
    event AuthorizeCaller(address caller);
    event raillineFunded(address raillineAddress, bool exists, bool registered, bool funded, uint fundedCount);
    event OperationalChange(bool change);
    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                ( address firstrailline
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        raillines[firstrailline] =  railline("Instantiator", true, true, false, new bytes32[](0), Votes(0), 0);
        registeredraillineAddresses.push(firstrailline);
        registeredraillines.add(1);
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
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner(){
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireraillineRegistration(address raillineCompanyAddress) {
        require(raillines[raillineCompanyAddress].registered, "railline is not registered and not part of the program");
        _;
    } 

    modifier requireraillineExists(address _address) {
        require (raillines[_address].exists, "railline does not exist");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) {
        return operational;
    }

   function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
        emit OperationalChange(mode);
    }
    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    


    function authorizeCaller(address _address) public requireContractOwner requireIsOperational {
        authorizedCallers[_address] = true;
        emit AuthorizeCaller(_address);
    }
    function isAuthorized(address _address) public returns(bool) {
        return authorizedCallers[_address];
    }
    function isFunded(address _address) public returns(bool) {
        return raillines[_address].funded;
    }
    function getRegisteredraillines() public view returns(uint) {
        return registeredraillines;
    }
    function raillineRegistered(address _address) public view returns(bool) {
        return raillines[_address].exists;
    }
    function getraillineVotes(address raillineAddress) public requireIsOperational returns(uint) {
        return raillines[raillineAddress].votes.votesCounted;
    }
    function raillineExists(address raillineAddress) public view returns(bool) {
        return raillines[raillineAddress].exists;
    } 
    function numberOfFundedraillines() public view requireIsOperational returns(uint) {
        return fundedraillines;
    }
    function getRegisteredraillinesAddresses() public view requireIsOperational returns(address[] memory) {
        return registeredraillineAddresses;
    }
    function gettrainNumber() public view requireIsOperational returns(bytes32[] memory) {
        return raillines[msg.sender].trainKeys;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an railline to the registration queue
    *      Can only be called from trainSuretyApp contract
    *
    */   
    function registerrailline
                            (   
                                address raillineAddress, 
                                bool registered,
                                string raillineName
                            )
                            external
                            requireIsOperational

    {
        
        raillines[raillineAddress] = railline(raillineName, true, registered, false, new bytes32[](0), Votes(0), 0);
        raillinesCount.add(1);
        if (registered) {
            registeredraillineAddresses.push(raillineAddress);
            registeredraillines.add(1);
        }
    }

    function setraillineRegistered(address _address) public requireIsOperational requireraillineExists(_address) {
        require(!raillines[_address].registered, "railline already registered");
        raillines[_address].registered = true;
        registeredraillineAddresses.push(_address);
        registeredraillines.add(1);

    }

   

    function addtrainCode(bytes32 code) external {
        raillines[msg.sender].trainKeys.push(code);
    }


   /**
    * @dev Buy insurance for a train
    *
    */   

    function buy(address raillineAddress)
                            external
                            payable
                            requireIsOperational
    {
        
        raillines[raillineAddress].numberOfInsurance = raillines[raillineAddress].numberOfInsurance + 1;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed trains
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                                address raillineAddress
                            )
                            public
                            payable
                            requireIsOperational requireraillineRegistration(raillineAddress) 
    {
        // revert("This is the value");
        require(msg.value >= 10 ether, "The railline did not pay the minimum requirements to be funded");
        raillines[raillineAddress].funded = true;
        fundedraillines = fundedraillines.add(1);
        emit raillineFunded(raillineAddress, raillines[raillineAddress].exists, raillines[raillineAddress].registered, raillines[raillineAddress].funded, fundedraillines);
    }

    function gettrainKey
                        (
                            address railline,
                            string memory train,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(railline, train, timestamp));
    }

    function vote (address votingFor, address voter) public requireIsOperational {
        //They can't vote for themselves
        require(!raillines[votingFor].votes.addressFromVotes[voter], "railline already voted");
        raillines[votingFor].votes.addressFromVotes[voter] = true;
        raillines[votingFor].votes.votesCounted++;
    }
    
    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund(msg.sender);
    }


}

