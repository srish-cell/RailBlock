import trainSuretyApp from '../../build/contracts/trainSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
var contract = require("truffle-contract");
var BigNumber = require('big-number');
var web3 = require('web3')
export default class Contract {

    constructor(network, callback) {
        this._appAddress = Config[network].appAddress;
        this.providers = new Web3.providers.HttpProvider('http://localhost:8545');
        this.web3 = new Web3(this.providers);
        this.trainSuretyApp = contract({abi : trainSuretyApp.abi});
        this.trainSuretyApp.setProvider(this.providers);


        this.initialize(callback);
        this.owner = null;
        this.raillines = [];
        this.passengers = [];
    }

    initialize(callback) {
        
        // We are getting the 50 accounts set up in ganache
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];
            let counter = 1;
            // Starting from the second account we are adding accounts into raillines object until the 4 account
            while(this.raillines.length < 5) {
                this.raillines.push(accts[counter++]);
            }
            // This while is similar to the one above, except we start on the 6th index, end on the 10th index. 
            // 5 addresses in passengers in total.
            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            callback();
        });
    }

    async gettrainInformation(userAddress, trainCode) {
        const instance = await this.trainSuretyApp.at(this._appAddress);
        let trainCodeToBytes = web3.utils.fromAscii(trainCode)
        // console.log(trainCodeToBytes, "FC Bytes")
        let trainNumberData = await instance.gettrainNumberFromData(trainCodeToBytes, {from: userAddress});
        console.log(trainNumberData, "train data")
    
        return {
            arrivalTime: trainNumberData["arrivalT"].toNumber(),
            trainStatus: trainNumberData["status"].toNumber(), 
            totalInsuredAmount: trainNumberData["totalIndividualInsuredAmount"].toNumber(), 
            individualtrainInsurees: trainNumberData["individualtrainInsurees"].toNumber(),
            raillineAddress:  trainNumberData["raillineCompanyAddress"]
        }
    }

    async buytrainInsurance(insuranceAmount, trainCode, userAddress) {

        const instance = await this.trainSuretyApp.at(this._appAddress);
        // console.log(web3.utils.fromAscii(trainCode), trainCode, "train code in bytes32")
        let etherConversion = web3.utils.toWei(insuranceAmount, "ether")
        let f_number = web3.utils.padRight(web3.utils.fromAscii(trainCode), 34)
        let trainData = await instance.gettrainNumberFromData(f_number, {from: userAddress})
        let raillineAddress = trainData["raillineCompanyAddress"]

        await instance.buyInsurance(f_number, raillineAddress, insuranceAmount, {from: userAddress, value: etherConversion})
        console.log("bought insurance")
    }
    

    async registertrain(trainNumber, trainTime, trainStatus, maxIndividualInsuredAmount, maxTotalInsuredAmount, registeredrailline) {
        let f_number = web3.utils.padRight(web3.utils.fromAscii(trainNumber), 34)    
        console.log(f_number, trainTime);
        const instance = await this.trainSuretyApp.at(this._appAddress);
        await instance.registertrain(f_number, trainTime, trainStatus, maxIndividualInsuredAmount, maxTotalInsuredAmount, {from: registeredrailline});
    }

    async getRegisteredraillines() {
        const instance = await this.trainSuretyApp.at(this._appAddress);
        let raillines = await instance.getRegisteredraillinesArray();
        console.log(raillines, "These are the all the registered raillines");
        return raillines
    } 

    async registerrailline(address, name, registeredrailline) {
        const instance = await this.trainSuretyApp.at(this._appAddress);
        await instance.registerrailline(address, name, {from: registeredrailline});

    }

    async fundrailline(address, callingAddress, raillineFundValue) {
        const instance = await this.trainSuretyApp.at(this._appAddress);
        await instance.fundrailline(address, {from: callingAddress, value: raillineFundValue});
        console.log("We have funded the railline")
    }

    // App Operationals
    async isOperationalApp() {
        let instance = await this.trainSuretyApp.at(this._appAddress);
        let isOperational = await instance.isOperationalApp({from: this.owner})
        return isOperational;
    }

    async setOperationalApp(decision) {
        let instance = await this.trainSuretyApp.at(this._appAddress);
        await instance.setOperationalApp(decision, {from: this.owner})
        let appOperationalResult = await instance.isOperationalApp({from: this.owner})
        return appOperationalResult;
    }

    // Data Operationals
    async isOperationalData() {
        let instance = await this.trainSuretyApp.at(this._appAddress);
        let isOperational = await instance.isOperationalData({from: this.owner})
        return isOperational;
    }

    async setOperationalData(decision) {
        let instance = await this.trainSuretyApp.at(this._appAddress);
        await instance.setOperationalData(decision, {from: this.owner})
        let dataOperationalResult = await instance.isOperationalData({from: this.owner})
        return dataOperationalResult;    
    }
    
    //msg.sender is used, update this.owner to window.ethereum.selectedAddress
    async fetchtrainStatus(train) {
        let payload = {
            railline: this.raillines[0],
            train: train,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        let instance = await this.trainSuretyApp.at(this._appAddress);
        await instance.fetchtrainStatus(payload.railline, payload.train, payload.timestamp, {from : this.owner})            
        return payload;
    }
}