const regeneratorRuntime = require("regenerator-runtime"); //@dev Use this package or update babelrc with plugin-transform-runtime
const axios = require('axios').default;
//@dev Test string, just for bitcoin. Use commented regexs at bottom to develop further. 
const btcTxApi = 'https://api.blockchair.com/bitcoin/dashboards/transaction/';
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".results");
const confirmed = document.querySelector(".confirmed");
const labelResults = document.querySelector(".labelResults");
const feeSpent = document.querySelector('.feeSpent'); // in USD
const sendAmount = document.querySelector('.sendAmount'); // in USD
let divider = document.querySelector(".extension__divider");


const form = document.getElementById("ExplorerAppFormAwesomeSauce");

const transaction = document.getElementById('q');


document.addEventListener('DOMContentLoaded', async () => {

    getTimeTitle();
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
	confirmed.textContent ="Let me look that up..."
    loading.style.display = "block";
    errors.textContent = "";

    let btcHashRegex = /^[0-9a-f]{64}$/gi;

    try {



        if (btcHashRegex.test(transactionHash)) {

            const response = await axios.get(`${btcTxApi}${transactionHash}`);

            //@dev Parsing the data received from api. Data heirarchy defined in docs. 
            let newObj = await response.data.data;

            //@dev This var circumvents the need to de-stringify the transactionHash. Allows you to access object after hash. 
            let readableDots = await Object.values(newObj)[0];

            //@dev Data can then be pulled form the transaction dashboard information and assigned. 
            let blockId = await readableDots.transaction.block_id;
            let fee = await readableDots.transaction.fee_usd;
            let sent = await readableDots.transaction.input_total_usd;


            loading.style.display = "none";


            if (blockId > 0) {
                confirmed.textContent = " Yes, block id is: " + blockId;
                feeSpent.textContent = " $" + fee.toFixed(2);
                sendAmount.textContent = " $" + sent.toFixed(2);

                console.log(readableDots);
            } else {
                confirmed.textContent = "Not confirmed."
            }
            divider.style.display = "block";
            results.style.display = "block";
            labelResults.style.display = "block";

            var x = document.getElementById("snackbar");
	    	x.innerText = "👈 Click me to reset content or enter new query."
	        x.className = "show";
	        setTimeout(function() { x.className = x.className.replace("show", ""); }, 1800);

        } else if(!transactionHash){
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
	    	x.innerText = "😖 Sorry, I didn't find anything."
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
//     ];

