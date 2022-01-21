require('dotenv').config()

const abiDecoder = require('abi-decoder');
const RouterABI = require('./src/abi/UNIRouterABI.json');
const sparklabAbi = require("./src/abi/SparkLab.json").abi;
const minABI = require("./src/abi/ERC20.json");
const axios = require('axios')
var Web3 = require('web3');
var cors = require('cors');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const express = require('express');
var bodyParser = require('body-parser');

var app = express();

const corsOptions = {
    origin: 'http://portfolio-tracker-2021.herokuapp.com',
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

function decrypt(text) {
    let textParts = text.split(":")
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

app.use('*',(req,res,next) =>{
    if (req.method === "OPTIONS") {
      res.status(200);
      res.send();
    } else {
      next();
    }
});

app.use(async function (req, res, next) {
    if (req.method === "OPTIONS") {
        res.status(200);
        res.send();
    } else {
        if (req.path !== "/auth") {
            // -----------------------------------------------------------------------
            // authentication middleware

            const auth = { login: process.env.REST_USERNAME, password: process.env.REST_PASSWORD }

            console.log(req.headers.authorization)
            // parse login and password from headers
            const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
            const nonce = b64auth.slice(-32)

            const authKey = await client.get(nonce)

            if (authKey === "true") {
                res.set('WWW-Authenticate', 'Basic realm="401"') // change this
                res.status(401).send('Authentication required.') // custom message
            } else {
                const withoutNonce = b64auth.replace(nonce, "")
            
                const half1 = withoutNonce.slice(withoutNonce.length/2)
                const half2 = withoutNonce.slice(0,withoutNonce.length/2)
    
                const password = decrypt(half1.toString())
                const login = decrypt(half2.toString())

                // Verify login and password are set and correct
                if (login && password && login === auth.login && password === auth.password) {
                    // Access granted...

                    await client.set(nonce, true)

                    return next()
                }
            
                // Access denied...
                res.set('WWW-Authenticate', 'Basic realm="401"') // change this
                res.status(401).send('Authentication required.') // custom message
            
                // -----------------------------------------------------------------------
            }
        } else {
            const username = encrypt(process.env.REST_USERNAME)
            const password = encrypt(process.env.REST_PASSWORD)
            
            res.json({username: username, password: password})
        }
        
    }
})

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WSS));
const account = web3.eth.accounts.privateKeyToAccount(process.env.MANAGER_KEY)
web3.eth.accounts.wallet.add(account)
// web3.eth.default_account = account.address

const redis = require('ioredis');
const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

const sparklabManager = process.env.SPARKLAB_MANAGER;
abiDecoder.addABI(RouterABI);

// start https server
let sslOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
 };

https.createServer(sslOptions, app).listen(8000, function () {
    console.log('listening on *:8000');
});

async function pullGasFromVault(deployed_contract_address) {
    const sparkLabContract = deployed_contract_address;
    const sparkLab = new web3.eth.Contract(
        sparklabAbi,
        sparkLabContract
    );

    await sparkLab.methods.pullGas(sparklabManager, web3.utils.toWei(process.env.GAS_ADVANCE_AMOUNT.toString())).send({ from: sparklabManager, gas: "2000000" });
}

async function returnGasToUser(recipient, amount, res) {
    const amountBnb = web3.utils.fromWei(amount)
    const amountFloat = parseFloat(amountBnb) * 0.99
    const amountWei = web3.utils.toWei(amountFloat.toString())

    web3.eth.sendTransaction({
        from: account.address,
        to: recipient,
        value: amountWei,
        gas: "21000"
    }, function (err, transactionHash) {
        if (res) {
            if (err) {
                res.json('Refund failed')
            } else {
                res.send('Refund successfull', transactionHash)
            }
        }
    });
}

app.get('/getVault',  async function (req, res) {
    const token = req.query.token
    const account = req.query.account

    const items = await client.hgetall(token.toLowerCase())

    const subscribers = JSON.parse(JSON.stringify(items))

    const vault = subscribers[account.toLowerCase()]

    res.json(vault)
});

app.get('/fetchTokenTransactionTax', async function (req, res) {
    const token = req.query.token

    const tokenContract = new web3.eth.Contract(
        minABI,
        token
    )

    let totalFee = 0

    try {
        const liquidityFee = await tokenContract.methods._liquidityFee().call()
        totalFee += parseInt(liquidityFee)
    } catch (err) {
        try {
            const liquidityFee = await tokenContract.methods.liquidityFee().call()
            totalFee += parseInt(liquidityFee)
        } catch (err) {
            
        }
    }

    try {
        const taxFee = await tokenContract.methods._taxFee().call()
        totalFee += parseInt(taxFee)
    } catch (err) {
        try {
            const liquidityFee = await tokenContract.methods.taxFee().call()
            totalFee += parseInt(liquidityFee)
        } catch (err) {
            
        }
    }

    try {
        const burnFee = await tokenContract.methods._burnFee().call()
        totalFee += parseInt(burnFee)

    } catch (err) {
        try {
            const liquidityFee = await tokenContract.methods.burnFee().call()
            totalFee += parseInt(liquidityFee)
        } catch (err) {
            
        }
    }

    res.json(totalFee)
});

app.get('/getTokenBalances',  async function (req, res) {
    const apiURL = `https://deep-index.moralis.io/api/v2/${req.query.account}/erc20?chain=bsc`

    axios.get(apiURL, {
        headers:
            { 'X-API-Key': process.env.MORALIS_API_KEY }
    })
    .then(function (response) {
        res.json(response.data)
    })
});

app.post('/setVault', async function (req, res) {
    const token = req.body.data.token
    const account = req.body.data.account
    const vault = req.body.data.vault

    const response = await client.hset(token.toLowerCase(), account.toLowerCase(), vault.toLowerCase())
    res.json("success")
});

async function deleteVault(vault) {
    await client.del(vault.toLowerCase())
}

app.post('/deleteVault', async function (req, res) {
    const vault = req.body.data.vault

    await client.del(vault.toLowerCase())

    res.json("success")
});

app.post('/pullGasFromVault', async function (req, res) {
    const vault = req.body.data.vault
    pullGasFromVault(vault);
});

app.post('/returnGasToUser', async function (req, res) {
    const token = req.body.data.token
    const account = req.body.data.recipient

    const tokenContract = new web3.eth.Contract(
        minABI,
        token
    )

    const items = await client.hgetall(token.toLowerCase())

    const subscribers = JSON.parse(JSON.stringify(items))

    const vault = subscribers[account.toLowerCase()]

    const balance = await tokenContract.methods.balanceOf(vault).call()

    await client.hdel(token.toLowerCase(), account.toLowerCase(), vault.toLowerCase()) //  delete vault
    if (parseInt(vault.length) > 0 && balance === "0") returnGasToUser(account, web3.utils.toWei(process.env.GAS_ADVANCE_AMOUNT.toString()), res)
});

app.post('/setBalance', async function (req, res) {
    const token = req.body.data.token
    const balance = req.body.data.balance
    const account = req.body.data.account
    await client.hset(account.toLowerCase(), token.toLowerCase(), balance.toLowerCase())
    res.json("success")
});

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
   
    encrypted = Buffer.concat([encrypted, cipher.final()]);
   
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

app.get('/auth', async function (req, res) {
    const username = encrypt(process.env.REST_USERNAME)
    const password = encrypt(process.env.REST_PASSWORD)
    
    res.json({username: username, password: password})
});

app.get('/getBalance', async function (req, res) {
    const account = req.body.data.account
    const token = req.body.data.token
    const results = await client.hget(account.toLowerCase())

    const tokens = Object.keys(results)
    for (const t of tokens) {
        if (t.toLowerCase() === token.toLowerCase()) {
            res.json(tokens[t])
        }
    }
    res.json({})
});

const subscription = web3.eth.subscribe('pendingTransactions', (err, res) => {
    if (err) console.error(err);
});

var liquidityTokens = ["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", "0xe9e7cea3dedca5984780bafc599bd69add087d56"]

async function protectUser(tokenContract, subscriber, sparkLabContractAddress, tx, token) {
    const sparkLab = new web3.eth.Contract(
        sparklabAbi,
        sparkLabContractAddress
    )

    const originalGas = parseInt(tx.gasPrice)
    const protectionGas = originalGas * 5

    const balance = await tokenContract.methods.balanceOf(sparkLabContractAddress).call()
    if (balance === 0) return

    const sell = await sparkLab.methods.sellTokens(balance, protectionGas, token).send({ from: sparklabManager, gas: "2000000", gasPrice: protectionGas });
    let receipt = await web3.eth.getTransactionReceipt(sell);
    const gasUsed = receipt.gasUsed
    console.log(gasUsed)

    const amountToWithdraw = parseInt(web3.utils.toWei(process.env.GAS_ADVANCE_AMOUNT.toString())) - parseInt(receipt.gasUsed)
    console.log(amountToWithdraw)
    
    await client.hdel(token.toLowerCase(), account.toLowerCase(), sparkLabContractAddress.toLowerCase()) //  delete vault

    returnGasToUser(subscriber, amountToWithdraw, null)
}

subscription.on('data', async function (txHash) {
    try {
        let tx = await web3.eth.getTransaction(txHash);

        if (tx === undefined) return
        if (tx === "0x") return
        if (tx === null) return
        if (tx.input === undefined) return
        if (tx === undefined || tx.to === undefined || tx.from === undefined) return

        if (tx.input !== "0x") {
            const decodedInput = abiDecoder.decodeMethod(tx.input);
            if (decodedInput === undefined || decodedInput.params === undefined) return

            let theToken = ""
            for (let param of decodedInput.params) {
                if (param.name === "token" && liquidityTokens.includes(param.value.toLowerCase()) === false) {
                    theToken = param.value
                }
                if (param.name === "tokenA" && liquidityTokens.includes(param.value.toLowerCase()) === false) {
                    theToken = param.value
                }
                if (param.name === "tokenB" && liquidityTokens.includes(param.value.toLowerCase()) === false) {
                    theToken = param.value
                }
            }

            if (decodedInput !== undefined && decodedInput.name.indexOf("removeLiquidity") > -1) {
                console.log("incoming rugpull ---- " + theToken)
                console.log("rugpull tx ---- " + tx.hash)
                console.log("\n")

                const tokenContract = new web3.eth.Contract(
                    minABI,
                    theToken
                )
  
                client.hgetall(theToken, async function (err, items) {
                    const subscribers = JSON.parse(JSON.stringify(items))
                    if (Object.keys(subscribers).length === 0 || subscribers === null) {
                        console.log("no subscribers to be protected!")
                        console.log("\n")
                    } else {
                        console.log("protecting!")
                        console.log("\n")

                        for (let subscriber of Object.keys(subscribers)) {
                            const sparkLabContractAddress = subscribers[subscriber.toLowerCase()]
                            console.log(sparkLabContractAddress)

                            const balance = await tokenContract.methods.balanceOf(sparkLabContractAddress).call()
			                if (balance > 0) {
                                console.log("subscriber: " + subscriber)
                                console.log("vault: " + sparkLabContractAddress)
                                console.log("\n")
    	
                                protectUser(tokenContract, subscriber, sparkLabContractAddress, tx, theToken)
                            } else {
                                console.log("vault has no tokens, not proceeding")
                            }
                        }
                    }
                })
            }
        }
    } catch (err) {
        // console.log(err)
    }
});
