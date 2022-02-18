/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

/*
 Class includes code from:
                    --- https://classroom.udacity.com/nanodegrees/nd1309/parts/cd0596/modules/461cfbe7-0fb3-465e-8cf5-12d39e301a2d/lessons/60e4f4a1-cb48-4ad7-b564-aece78c802ef/concepts/0467aeeb-a507-4480-871a-cad8cfd52a41
                    --- https://www.w3schools.com/js/js_promise.asp


*/
class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            // sets current block height
            block.height = self.chain.length; 
            // sets  current block time
            block.time = new Date().getTime().toString().slice(0,-3);
            // checks for the height to assign the previousBlockHash
            if(self.chain.length > 0 ){
                block.previousBlockHash = self.chain[self.chain.length-1].hash; 
            }
            // Calculates block hash
            block.hash = SHA256(JSON.stringify(block)).toString(); 
               //pushes new block
                self.chain.push(block);
                //increases height
                self.height++; 
                //resolve the new block
                resolve(block); 
                console.log(block)
        });
}

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            // message variable gets resolved with the message to be signed
            const message = `${address}:${new Date().getTime().toString().slice(0, -3)}:starRegistry`; 
            resolve(message);    
        });
    }


    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
             // Step 1. Sets the time of the message sent 
            let time = parseInt(message.split(':') [1] ); 
             // Step 2. Sets the current time                            
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3)); 
             // Step 3. Checks if the time elapsed is less than 5 minutes 
            if (currentTime - time < 300 ) {  
            // Step 4. Verifies the message with wallet address and signature                                         
            if (bitcoinMessage.verify(message, address, signature)) {  
             // Step 5. Creates the new block with the owner and the star and adds it to the chain                    
                   // let block = new BlockClass.Block({address: address, star:star});  
                  //  self._addBlock(block); 
                  const data = {address: address, star: star }   
                  const block = new BlockClass.Block(data) 
                  await self._addBlock(block)
            // Step 6.Resolve with the new block                                             
                    resolve(block);         
                } else {
                    reject(Error('Message is not verified'))                         
                }
            } else {
                reject(Error('Time elapsed'))  
            }
            
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            // Searches on chain array for block hash with filter method
            let block = self.chain.filter(p => p.hash === hash);
            if (block !== 'undefined') {
                resolve(block); 
            }else{
                reject(Error("Invalid Block"))
            }          
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress (address) {
        let self = this; 
        // creates an array of stars 
        let stars = [];                            
        return new Promise((resolve, reject) => { 
             self.chain.forEach(async(b)=> {        
              let data = await b.getBData();        
              if(data){
                   //checks if owner of the star is address passed in as parameter
                  if(data.address === address) { 
                   // if address owns the star push star's data   
                    stars.push(data);              
                  }
              }
          })
         //  will always return an array  
         resolve(stars);                     
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve) => {
            // Go through each block and make sure stored hash of
            // previous block matches actual hash of previous block
            let Promises = [];
            self.chain.forEach((block, index) => {
                if (block.height > 0) {
                    const previousBlock = self.chain[index - 1];
                    if (block.previousBlockHash !== previousBlock.hash) {
                        const errorMessage = `Block ${index} previousBlockHash is ${block.previousBlockHash}, not ${previousBlock.hash}`;
                        errorLog.push(errorMessage);
                    }
                }

                // Store promise to validate each block
                Promises.push(block.validate());
            });

            // Collect results of each block's validate call
            Promise.all(Promises)
                .then(validatedBlocks => {
                    validatedBlocks.forEach((valid, index) => {
                        if (!valid) {
                            const invalidBlock = self.chain[index];
                            const errorMessage = `Block ${index} hash (${invalidBlock.hash}) is invalid`;
                            errorLog.push(errorMessage);
                        }
                    });

                    resolve(errorLog);
                });
        });
    }

}

module.exports.Blockchain = Blockchain;   