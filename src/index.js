const regeneratorRuntime = require("regenerator-runtime"); //@dev Use this package or update babelrc with plugin-transform-runtime
const axios = require('axios').default;
const api = 'https://api.blockchair.com/';
const dashboard = '/dashboards/transaction/';
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".results");
const confirmed = document.querySelector(".confirmed");
const labelResults = document.querySelector(".labelResults");
const feeSpent = document.querySelector('.feeSpent'); // in USD
const sendAmount = document.querySelector('.sendAmount'); // in USD
let divider = document.querySelector(".extension__divider");


const form = document.getElementById("ExplorerAppForm");
const transaction = document.getElementById('q');


document.addEventListener('DOMContentLoaded', async () => {

    getTimeTitle();
    //@dev Focus on input and make visible to user so they can use keyboard only to paste and search. Efficiency + cool css highlight to draw attention.
    transaction.focus();

})

function getTimeTitle() {
    var x = document.getElementById("snackbar");
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    if (time >= "12:00:00" && time <= "17:00:00") {
        x.innerText = "Good Afternoon! 🚀";
    } else if (time >= "17:00:01" && time <= "23:59:59") {
        x.innerText = "Good Evening! 🌙";
    } else {
        x.innerText = "GM! 🌤️"
    }

    x.className = "show";
    // After 1.5 seconds, remove the show class from DIV
    setTimeout(function() { x.className = x.className.replace("show", ""); }, 1000);
}


const searchTransaction = async (transactionHash) => {

    labelResults.style.display = "block";
    confirmed.textContent = "Let me look that up..."
    loading.style.display = "block";
    errors.textContent = "";

    let chain = false;
  
    let hashRegexs = {
        "bitcoin": "^[0-9a-f]{64}$",
        "ethereum": "^0x[0-9a-fA-F]{64}$",
        "tezos": "^o[a-zA-Z0-9]{50}/gi"
    }

    for (let keys in hashRegexs) {
        //keys are the chains
        let chainKey = hashRegexs[keys] // Get regex
        let regex = new RegExp(chainKey, 'gi'); //formats as regex.

        if (regex.test(transactionHash)) {
            chain = keys;
        } else {
            console.log("Not the right chain", keys);
        }
    };

    try {

        let sent; 

        if (chain) {
            
            const response = await axios.get(`${api}${chain}${dashboard}${transactionHash}`);

            //@dev Parsing the data received from api. Data heirarchy defined in docs. 
            let newObj = await response.data.data;

            //@dev This var circumvents the need to de-stringify the transactionHash. Allows you to access object after hash. 
            let readableDots = await Object.values(newObj)[0];

            //@dev Data can then be pulled form the transaction dashboard information and assigned. 
            let blockId = await readableDots.transaction.block_id;
            let fee = await readableDots.transaction.fee_usd;

            if(chain === "bitcoin"){
                 sent = await readableDots.transaction.input_total_usd;
            } else if (chain === "ethereum") {
                 sent = await readableDots.transaction.value_usd;
            }

            loading.style.display = "none";

            if (blockId > 0) {
                    console.log("TX found.")
                    confirmed.textContent = " Yes, block id is: " + blockId + ", " + chain;
                    feeSpent.textContent = " $" + fee.toFixed(2);
                    sendAmount.textContent = " $" + parseFloat(sent).toFixed(2);
                console.log(readableDots);
            } else {
                confirmed.textContent = " Not confirmed."
            }
            divider.style.display = "block";
            results.style.display = "block";
            labelResults.style.display = "block";

            var x = document.getElementById("snackbar");
            x.innerText = "👈 Click me to reset content or enter new query."
            x.className = "show";
            setTimeout(function() { x.className = x.className.replace("show", ""); }, 1800);

        } else if (!transactionHash) {
            var x = document.getElementById("snackbar");
            x.innerText = "🤔 I'm listening... "
            x.className = "show";
            setTimeout(function() { x.className = x.className.replace("show", ""); }, 1800);
            divider.style.display = "none";
            labelResults.style.display = "none";
            loading.style.display = "none";
            results.style.display = "none";
            return;
        } else {
            console.log(transactionHash);
            divider.style.display = "block";
            labelResults.style.display = "none";
            loading.style.display = "none";
            results.style.display = "none";
            errors.textContent = "No data for the transaction or input you have requested.";

            var x = document.getElementById("snackbar");
            x.innerText = "😖 Sorry, no results."
            x.className = "show";
            setTimeout(function() { x.className = x.className.replace("show", ""); }, 1800);
        }

    } catch (e) {
        divider.style.display = "block";
        labelResults.style.display = "none";
        loading.style.display = "none";
        results.style.display = "none";
        errors.textContent = "No data for the transaction or input entered.";
        console.log(e);
    }
}

const handleSubmit = async e => {
    e.preventDefault();
    searchTransaction(transaction.value);
    console.log(transaction.value);
};

form.addEventListener("submit", e => handleSubmit(e));



// Regex's pulled from existing extension for reference. 

// let REGEXPS = [
//       '^0x[0-9a-fA-F]{64}$',                    // etherium tx or block
//       '^[0-9a-fA-F]{64}$',                      // tx's hash in a lot of blockhains
//       '/^[0-9a-f]{64}$/i'                       // Ada transaction and BTC (btc-like assets), XLM, XRP, XMR



//       '^0x[0-9a-fA-F]{40}$',                    // etherium address
//       '^1[a-km-zA-HJ-NP-Z1-9]{25,34}(?!\/)$',      // bitcoin address
//       '^3[a-km-zA-HJ-NP-Z1-9]{25,34}$',      // bitcoin address
//       '^bc(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})$',  // bitcoin address
//       '^([qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})|(bitcoincash:[qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})$',  // bch address
//       '^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$',   // litecoin add
//       '^[9AD][a-km-zA-HJ-NP-Z1-9]{26,33}$',  // dogecoin add
//       '^[7X][a-km-zA-HJ-NP-Z1-9]{26,33}$',   // dash add 
//       '^F[a-km-zA-HJ-NP-Z1-9]{26,33}$',      // groestl add
//       '^ltc[a-zA-Z0-9]{5,88}$',              // litecoin add
//       '^grs[a-zA-Z0-9]{5,88}$',              // groestl add
//       '^r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,35}$',  // ripple add
//       '^G[A-Z0-9]{55}$'                      // stellar add
//       '4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$'    // monero add
//       'addr1[a-z0-9]+'                       // Ada address
//       '9A-HJ-NP-Za-km-z]+'                   // Ada address

//     ];



// Need to match transaction hash or similar regex depending on chain. Push to array. Find length. 

// If match multiple (length > 1), retrieve address from each response and test against regex for addresses. Then send  

// To get address: 

// Use dashboard data for btc (outputs recipient) [ Same standard for finding address for each asset ]
// ETH use dashboard (transaction sender) [ Same standard for finding address for ERC20s and ETH native/ testnet ]
// XRP use raw (amount issuer)
// XLM use raw (transaction source_account)
// XMR use raw (data[0] should match regex)
// ADA use raw (transaction, ctsInputs, ctaAddress, unCAddress)

// Use diff. explorers: 

// XTZ does not pull. Starts with op always Use: https://api.tzstats.com/explorer/op/opSrt7oYHDTZcfGnhNt3BzGrrCQf364VuYmKo5ZQVQRfTnczjnf
// SOL use web3js
// polygon use alchemyapi


// Resend transaction call to API 


//     let hashRegexs = {
//     /^0x[0-9a-fA-F]{64}$/i : "ethereum",
//         /^[0-9a-f]{64}$/gi : "bitcoin",
//         /^[0-9a-f]{64}$/gi : "bitcoin-cash",
//         /^[0-9a-f]{64}$/gi : "litecoin",
//         /^[0-9a-f]{64}$/gi : "bitcoin-sv",
//         /^[0-9a-f]{64}$/gi : "dogecoin",
//         /^[0-9a-f]{64}$/gi : "dash",
//         /^[0-9a-f]{64}$/gi : "zcash",
//         /^[0-9a-f]{64}$/gi : "ecash",
//         /^[0-9a-f]{64}$/gi : "bitcoin/testnet",
//         /^[0-9a-f]{64}$/gi : "cardano",
//         /^[0-9a-f]{64}$/gi : "stellar",
//         /^[0-9a-f]{64}$/gi : "monero",
//    /^o[a-zA-Z0-9]{50}/gi : "tezos", //This will use tzstats endpoing. So far this regex matches txs
//        /^0x[0-9a-f]{64}$/i : "ethereum/testnet",
//                            : "solana", //This will need solana web3js. TransactionBlockhashCtor & TransactionConfirmationStatus https://solana-labs.github.io/solana-web3.js/modules.html#TransactionBlockhashCtor
//     /^0x[0-9a-fA-F]{64}$/i : "polygon", //Can use alchemy API to explore transactions. If matches regex for eth && not found blockchair, try alchecmy API


//     }

//   for (keys in hashRegexs) {

//                //keys are the regexs
//                // chain name is chain name. 

//                let chainName = hashRegexs[keys].split(':').shift(); // Chain name

//                if (keys.test(transactionHash)) {

//                     let chain = chainName

//                 }

//             };