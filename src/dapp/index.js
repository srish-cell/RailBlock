
// import DOM from './dom';
import DOM from './dom';
import Contract from './contract';
import './railsure.css';


(async() => {

    let result = null;
    
    // INITIALIZATION OF CONTRACT OBJECT
    let contract = new Contract('localhost', async () => {
        
        // document.addEventListener('click', async _ => {
        //     let raillines = await contract.getRegisteredraillines();
        //     console.log(window.ethereum.selectedAddress, await contract.getRegisteredraillines())    
            

        // })

        

        
       

        
        // NOTE: No error implementation yet
        // Note that everytime a new page is reloaded, admin functions, etc the functions below get reloaded.
        // If a document does not have a certain id, as not all pages from the site contain all the elementids listed here, the function will crash as well as all the subsequent functions.
        initializer(contract)
        addOracleEventListner(contract);
        addraillineEventListner(contract);
        addOperationalEventListners(contract);
        addSubmittrainEventListner(contract)
        addGettrainsEventListner(contract);
        addBuyInsuranceEventListner(contract);
    });
    

})();

async function initializer(contract) {
    let raillines = await contract.getRegisteredraillines();
    
    
    try {
        displayraillines("railline-submission-update", [{value: raillines}]);
        
    } catch {}
    
}

/**
 * Event Listners
 */ 

/**
 * 32ed
 * 0xC484B3207CBd0C0dCb3Ec5e5839CE61e60EC1c56
 * 1000000000000000000 (This is wei)
 * December 17, 1995 03:24:00
 */

function addBuyInsuranceEventListner(contract) {
    try {
        DOM.elid("buy-insurance").addEventListener('click', async _ => {
            await contract.buytrainInsurance(DOM.elid("insurance-amount").value, DOM.elid("train-number").value, window.ethereum.selectedAddress);            
        })
    } catch {}
    
}

function addGettrainsEventListner(contract) {
    try {
        DOM.elid("get-trains").addEventListener('click', async _ => {
            let trainInformations = await contract.gettrainInformation(window.ethereum.selectedAddress, DOM.elid("train-number").value);   
            displayBoughtInsurance("", [{value: trainInformations}]);
        })
    } catch {}
}

 
function addSubmittrainEventListner(contract) {
    // Format of train time: 'December 17, 1995 03:24:00'
    try {
        document.getElementById('submit-train-info').addEventListener('click', async _ => {
            let computerReadableDate = new Date(DOM.elid('train-time').value).valueOf()
            
            await contract.registertrain(DOM.elid('train-register').value, computerReadableDate, DOM.elid('train-status').value, DOM.elid('max-individual-insurance-amount').value, DOM.elid('max-total-insurance-amount').value, window.ethereum.selectedAddress)
        })
    } catch {}
}

function addOracleEventListner(contract) {
    // Handle clicking submite oracle
    try {
        DOM.elid('submit-oracle').addEventListener('click', async _ => {
            let train = DOM.elid('train-number').value;
            // Write transaction
            let result = await contract.fetchtrainStatus(train)
            displayOracleStatus("oracle-submission", [ {value: result.train + ' ' + result.timestamp} ]);
        })
    }catch {}
    
}

function addraillineEventListner(contract) {
    // Handle registering railline
    try {
        DOM.elid('submit-railline').addEventListener('click', async _ => {
            //Handle checking whether the current address is registered or not
            await contract.registerrailline(DOM.elid('train-register-address').value,  DOM.elid('train-register-name').value, window.ethereum.selectedAddress);
            location.reload();            
        })
     
        DOM.elid('submit-railline-funding').addEventListener('click', async _ => {
            
            // DOM.elid('railline-fund'.value)
            await contract.fundrailline(DOM.elid('railline-fund-address').value, window.ethereum.selectedAddress, DOM.elid('railline-fund').value * 1000000000000000000);
            
        })
    } catch {}
    
}








/**
 * Other HTML/CSS Functions
 */ 

function displayOracleStatus(idType, results) {
    let displayDiv = DOM.elid("display-wrapper-oracle-status");
    let section = DOM.section();
    let row = section.appendChild(DOM.div({className:'col-sm-8 field-value', id: idType}, results[0].value));
    section.appendChild(row);
    displayDiv.append(section);
}

function displayraillines(idType, results) {
    let displayDiv = DOM.elid("display-wrapper-registered-raillines");
    let section = DOM.section();
    results[0].value.map(result => {
        console.log(result, "raillines")
        let row = section.appendChild(DOM.div({className:'col-sm-8 field-value', id: idType}, result));
        section.appendChild(row);
    })
    displayDiv.append(section);
}


// Create a function that displays the passenger insurances bought
function displayBoughtInsurance(idType, results) {
    let displayDiv = DOM.elid("display-wrapper-bought-insurance");
    displayDiv.innerHTML = "";
    let section = DOM.section();
    // console.log(results[0].value)
    results.map(result => {
        console.log(result, "result")
        for (let key in result) {
            console.log(result[key], "results")
            let rowArrivalTime = new Date(result[key].arrivalTime);
            let rowtrainStatus = result[key].trainStatus;
            let rowTotalInsuredAmount = result[key].totalInsuredAmount;
            let rowIndividualtrainInsurees = result[key].individualtrainInsurees;
            

            let row = section.appendChild(DOM.div({className: 'col-sm-8 field-value', id: idType}, `Arrival Time: ${rowArrivalTime.toString()}, train Status: ${rowtrainStatus}, train Maximum Individual Insured Amount: ${rowTotalInsuredAmount} ETH, Your Bought Insured Amount: ${rowIndividualtrainInsurees} ETH`))

            section.appendChild(row);
        }
    })

    displayDiv.append(section)

}



/**
 * Operational Events: 
 * This is to stop the contract when necessary.
 */

function addOperationalEventListners(contract){

    // Read app operational status
    const appIsOperational = contract.isOperationalApp()
    console.log(`dapp app contract is ${appIsOperational ? "" : "not"} operational`)
    try {
        DOM.elid('app-operational-status-message').innerHTML = appIsOperational ? "Ready to deploy with all functions available" : "Not ready to deploy";

    // Read data operational status
    const dataIsOperational = contract.isOperationalData()
    console.log(`dapp data contract is ${dataIsOperational ? "" : "not"} operational`)
    DOM.elid('data-operational-status-message').innerHTML = dataIsOperational ? "Ready to deploy with all functions available" : "Not ready to deploy";

    // Handle turning on app operational status request
    DOM.elid('app-operational-status-on').addEventListener('click', async _ => {
        await contract.setOperationalApp(true);
        let setAppOperationalResultOn = await contract.isOperationalApp();
        console.log(setAppOperationalResultOn)
         // This result returns whatever the return value is in the contract for this function
        console.log(`dapp app contract is ${setAppOperationalResultOn ? "" : "not"} operational`)
        DOM.elid('app-operational-status-message').innerHTML = setAppOperationalResultOn ? "Ready to deploy with all functions available" : "Not ready to deploy";  
    })
    
    // Handle turning off app operational status request
    DOM.elid('app-operational-status-off').addEventListener('click', async _ => {
        
        let setAppOperationalResultOff = await contract.setOperationalApp(false);
        console.log(setAppOperationalResultOff)

        console.log(`dapp app contract is ${setAppOperationalResultOff ? "" : "not"} operational`)
        DOM.elid('app-operational-status-message').innerHTML = setAppOperationalResultOff ? "Ready to deploy with all functions available" : "Not ready to deploy";
    })

    //Handle turning on data operational status request
    DOM.elid('data-operational-status-on').addEventListener('click', async _ => {
        await contract.setOperationalData(true);
        let setDataOperationalResultOn = await contract.isOperationalData()
        console.log(`dapp data contract is ${setDataOperationalResultOn ? "" : "not"} operational`)
        DOM.elid('data-operational-status-message').innerHTML = setDataOperationalResultOn ? "Ready to deploy with all functions available" : "Not ready to deploy";
    })
    //Handle turning on data operational status request
    DOM.elid('data-operational-status-off').addEventListener('click', async _ => {
        let setDataOperationalResultOff = await contract.setOperationalData(false);
        console.log(`dapp data contract is ${setDataOperationalResultOff ? "" : "not"} operational`)
        DOM.elid('data-operational-status-message').innerHTML = setDataOperationalResultOff ? "Ready to deploy with all functions available" : "Not ready to deploy";
    })
    } catch {}
}