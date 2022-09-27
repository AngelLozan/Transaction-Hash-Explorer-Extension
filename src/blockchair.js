class Blockchair {

  constructor() {

    this.BROWSER = 'chrome';

    //firefox https://stackoverflow.com/a/9851769
    if(typeof InstallTrigger !== 'undefined') {
      this.BROWSER = 'firefox';
    }
    // safari
    else if(/apple/i.test(navigator.vendor)) {
      this.BROWSER = 'safari';
    }

    this.REGEXPS = [
      '^0x[0-9a-fA-F]{64}$',                    // etherium tx or block
      '^0x[0-9a-fA-F]{40}$',                    // etherium address
      '^[0-9a-fA-F]{64}$',                      // tx's hash in a lot of blockhains
      // '^1[a-km-zA-HJ-NP-Z1-9]{25,34}$',      // bitcoin address
      '^1[a-km-zA-HJ-NP-Z1-9]{25,34}(?!\/)$',      // bitcoin address
      '^3[a-km-zA-HJ-NP-Z1-9]{25,34}$',      // bitcoin address
      '^bc(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})$',  // bitcoin address
      '^([qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})|(bitcoincash:[qp][qpzry9x8gf2tvdw0s3jn54khce6mua7l]{40,120})$',  // bch address
      '^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$',   // litecoin
      '^[9AD][a-km-zA-HJ-NP-Z1-9]{26,33}$',  // dogecoin
      '^[7X][a-km-zA-HJ-NP-Z1-9]{26,33}$',   // dash
      '^F[a-km-zA-HJ-NP-Z1-9]{26,33}$',      // groestl
      '^ltc[a-zA-Z0-9]{5,88}$',              // litecoin
      '^grs[a-zA-Z0-9]{5,88}$',              // groestl
      '^r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,35}$',  // ripple
      '^G[A-Z0-9]{55}$'                      // stellar
    ];

    this.API_HOST = 'https://api.blockchair.com';
    this.SEARCH_URL = 'https://blockchair.com/search?q=';
    this.MARKET_URL = 'https://loutre.blockchair.io/internal/markets?limit=999';
    this.PORTFOLIO_URL = 'https://api.blockchair.com/internal/portfolio';
    this.MARKET_SITE_URL = 'https://blockchair.com/markets?utm_source=extension&utm_term=portfolio&utm_content='+this.BROWSER;


    this.market = new Array;
    this.listeners = new Object;

    this.is_init = false;

    this._badgeSource = 'bitcoin';
    this._portfolio = new Array;
    this._portfolioTotals = {current_value: null, change_24h: null};
    this._viewState = 'top'; // top | portfolio

    this._settings = {
      addressbar: false,
      highlight: false
    };

    // this.init();
  }

  //End of constructor, start functions 

  updateStat() {

    this.fetchStat().then((response)=>{

      this.market = response ? response.data : {};

      if(!this.is_init) {
        this.is_init = true;
        this.emit('init');
      }

      this.emit('marketUpdated');

      // this.timeoutStat();
    });

    if(this._badgeSource == 'portfolio') {
      this.updatePortfolioTotals();
    }
  }

  

  timeoutStat() {

    let self = this;
    setTimeout(()=>{
      self.updateStat();
    }, 60000);
  }

  on(event, callback) {

    if(!this.listeners[event]) {
      this.listeners[event] = new Array;
    }

    if(!~this.listeners[event].indexOf(callback)) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {

    if(this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if(~index) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  emit(event) {

     if(this.listeners[event] && this.listeners[event].length > 0) {
        this.listeners[event].forEach((listener)=>{
          listener(this.stat);
        })
     }
  }

  fetchStat() {

    return new Promise((resolve, reject)=>{

      const xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = (event)=>{

        if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {

          const data = xmlHttp.responseText ? JSON.parse(xmlHttp.responseText) : null;

          resolve(data);
        }
      }

      xmlHttp.open("GET", this.MARKET_URL, true);
      xmlHttp.send(null);
    });
  }

 
  

  getTime() {

    const date = new Date;

    return `${date.getFullYear()}-${this.paddedTimeItem(date.getMonth()+1)}-${this.paddedTimeItem(date.getDate())} ${this.paddedTimeItem(date.getHours())}:${this.paddedTimeItem(date.getMinutes())}:${this.paddedTimeItem(date.getSeconds())}`;
  }

  getViewState() {

    return this._viewState;
  }

  getSetting(setting) {

    return this._settings[setting];
  }



  paddedTimeItem(value) {

    if(value < 10) return "0" + value;

    return value;
  }



  setViewState(value) {

    chrome.storage.sync.set({'viewState': value});
  }

  setSetting(setting, value) {

    chrome.storage.sync.set({[setting]: value});
  }

  setTransactionNotifyAlarm() {

    chrome.alarms.get('monitorTransactionNotify', function(alarm){
      if(!alarm) {
        chrome.alarms.create('monitorTransactionNotify', { periodInMinutes: 1 });
      }
    });
  }

  addTransactionNotify(data) {

    var _this = this;

    let { chain, hash,  blocks_to_complete, url, block_field } = data

    chrome.storage.sync.get(['transactionNotifiers'], function(result){

      let txs = result['transactionNotifiers'];
      if(!txs) txs = {};

      txs[`${chain}---${hash}`] = { chain, hash,  blocks_to_complete, url, block_field }

      chrome.storage.sync.set({transactionNotifiers: txs}, function(result){

        _this.showTransactionNotificationAdded(chain, hash);

        _this.setTransactionNotifyAlarm();

        _this.updateExtensionIcon();

      });

    });


  }

  removeTransactionNotify(chain, hash) {

    var _this = this;

    chrome.storage.sync.get(['transactionNotifiers'], function(result){

      let txs = result['transactionNotifiers'];
      if(!txs) txs = {};

      delete txs[`${chain}---${hash}`];

      chrome.storage.sync.set({transactionNotifiers: txs});

      if(Object.keys(txs).length === 0) {
        chrome.alarms.clear('monitorTransactionNotify');
      }


      _this.updateExtensionIcon();

    });
  }

  checkTransactionNotifiers() {

    var _this = this;

    chrome.storage.sync.get(['transactionNotifiers'], function(result){

      let txs = result['transactionNotifiers'];
      if(!txs) txs = {};

      Object.values(txs).forEach(function(item){

        _this.fetchTransactionInfo(item.url)
            .then((response)=>{

              if(response.data) {

                let position = response.data[item.hash]?.priority?.position

                // console.log('checkTransactionNotifiers', item.hash, position)

                if(position && position === "confirmed") {

                  _this.showTransactionNotification(item.chain, item.hash);
                  _this.removeTransactionNotify(item.chain, item.hash);

                }
              }
            })
            .catch((error)=>{

              _this.removeTransactionNotify(item.chain, item.hash)
              console.log(error)
            });

      });

    });
  }

  fetchTransactionInfo(url) {

    return new Promise((resolve, reject)=>{

      const xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = (event)=>{

        if(xmlHttp.readyState === 4 && xmlHttp.status === 200) {

          const data = xmlHttp.responseText ? JSON.parse(xmlHttp.responseText) : null;
          resolve(data);
        }
        else {

          reject();
        }
      }

      xmlHttp.open("GET", url, true);
      xmlHttp.send(null);
    });
  }

  showTransactionNotification(chain, hash) {

    chrome.notifications.create(`${chain}---${hash}`, {
      title: `Transaction ${hash.substring(0,4)}···${hash.substr(-5)} is confirmed`,
      message: `Click here to check the transaction details at blockchair.com`,
      iconUrl: "EXODUSblockchair.png",
      type: "basic",
      requireInteraction: true
    }, function(){
      // console.log('notification sent', chrome.runtime.lastError);
    });

  }

  showTransactionNotificationAdded(chain, hash) {

    chrome.notifications.create(`${chain}---${hash}`, {
      title: `Monitoring Transaction Status`,
      message: `We will notify you when ${chain} transaction ${hash.substring(0,4)}···${hash.substr(-5)} is confirmed`,
      iconUrl: "EXODUSblockchair.png",
      type: "basic",
      requireInteraction: true
    }, function(){
      // console.log('notification sent', chrome.runtime.lastError);
    });


  }



}