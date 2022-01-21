import { useEthers, useSendTransaction, useTransactions } from "@usedapp/core"
import React, { Fragment, useRef, useState, useEffect } from 'react'
import 'animate.css/animate.css'
import '@styles/base/plugins/extensions/ext-component-sweet-alerts.scss'
import { Copy } from 'react-feather'
import { Table, Row, Badge } from 'reactstrap'
import { useBetween } from 'use-between'
import { useShareableBalances, useShareableState } from './shared'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"
import { ethers } from "ethers"
import Web3 from 'web3'
import ImageFallback from './ImageFallback'
import {
    Box,
    Text,
    Link
} from "@chakra-ui/react"
import axios from 'axios'
import Image from "react-graceful-image"
import WizardModernEnable from '../../forms/wizard/WizardModernEnable.js'
import WizardModernDisable from '../../forms/wizard/WizardModernDisable.js'
import { Token, Fetcher, Route, WETH } from "@pancakeswap-libs/sdk-v2";

import { toast } from 'react-toastify'
import { ToastCopied } from "./shared"

import { CopyToClipboard } from 'react-copy-to-clipboard'

import Popup from 'reactjs-popup';
import './TokenList.scss'

import millify from "millify";

require('dotenv').config()

const contractFile = require("../abi/SparkLab.json")
const minAbi = require("../abi/ERC20.json")
const crypto = require("crypto")

const pancakeSwapRouterAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
const pancakeSwapRouterAbi = require("../abi/UNIRouterABI.json")

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WSS));

const { JsonRpcProvider } = require("@ethersproject/providers");
const provider = new JsonRpcProvider(process.env.REACT_APP_WSS)

const addresses = {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
}

export default function TokenList() {
    const [gasAmount, setGasAmount] = useState("800000")
    const [setupRugProtection, setSetupRugProtection] = useState(false)
    const ref = useRef(null)
    const [ imageLoadError, setImageLoadError] = useState(true)

    const { activateBrowserWallet, account } = useEthers()
    let previousAccount = null
    let firstLoad = true

    const [isLoading, setLoading] = useState(true)
    let { tokens, setTokens, selected, setSelected, canSelect, setCanSelect, mustRefresh, setMustRefresh, showWizardEnable, showWizardDisable, setShowWizardEnable, setShowWizardDisable } = useBetween(useShareableState)

    // eslint-disable-next-line prefer-const
    let { totalTokenBalanceUSD, setTotalTokenBalanceUSD, totalTokenBalanceBNB, setTotalTokenBalanceBNB } = useBetween(useShareableBalances)

    const [checkedState, setCheckedState] = useState(
        new Array(tokens.length).fill(false)
    );

    const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(
        new Array(tokens.length).fill(false)
    );
    
    const handleOnChange = (position) => {
        if (selected.includes(tokens[position])) {
            selected.splice(tokens[position])
        } else {
            selected.push(tokens[position])
        }

        const updatedCheckedState = checkedState.map((item, index) => index === position ? !item : item );

        setCheckedState(updatedCheckedState);
    };

    const handleAcceptedDisclaimer = (position) => {
        const updatedAcceptedDisclaimer = acceptedDisclaimer.map((item, index) => index === position ? !item : item );

        setAcceptedDisclaimer(updatedAcceptedDisclaimer);
    };

    const { sendTransaction } = useSendTransaction()

    function handleConnectWallet() {
        activateBrowserWallet();
        addWalletListener();
    }

    //State variables
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");

    function addWalletListener() {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    tokens.forEach(element => {
                        tokens.pop()
                    })
                    
                    setTokens(tokens)
                    setLoading(true)
                } else {
                    setWallet("");
                }
            });
        } else {
            // no metamask installed!
        }
    }

    function toFixed(x) {
        if (Math.abs(x) < 1.0) {
            var e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
            }
        } else {
            var e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += (new Array(e + 1)).join('0');
            }
        }
        return x;
    }


    let unprocessedTokens = 0

    async function getTokenBalances(account) {
        const USDC = new Token(56, "0x55d398326f99059ff775485246999027b3197955", 18);
        const BNB = new Token(56, addresses.WBNB, 18);
        const BNBUSDC = await Fetcher.fetchPairData(BNB, USDC, provider)
        const routeBNB = new Route([BNBUSDC], BNB)
    
        const binanceCoinPrice = routeBNB.midPrice.toFixed(4)

        axios.get(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/auth`)
        .then(async (response) => {
            const username = response.data.username
            const password = response.data.password

            localStorage.setItem("user", username)
            localStorage.setItem("password", password)

            const nonce = crypto.randomBytes(16).toString('hex');
            axios.get(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/getTokenBalances`, {
                headers: {
                    'Authorization': `Basic ${localStorage.getItem("user")}${localStorage.getItem("password")}${nonce}`
                },
                params: {
                    account: account.toLowerCase()
                }
            })
            .then(function (r) {
                const response = r.data
                unprocessedTokens = 0
                if (response.length === 0) {
                    loadingText = "No tokens"
                }
                response.map(async function (result, index) {
                    const { token_address, decimals } = result

                    try {
                        const tokenContract = new web3.eth.Contract(minAbi, token_address)

                        const TOKEN = new Token(56, token_address, decimals);

                        // note that you may want/need to handle this async code differently,
                        // for example if top-level await is not an option
                        const TOKENWBNBPair = await Fetcher.fetchPairData(TOKEN, BNB, provider)

                        const routeNative = new Route([TOKENWBNBPair], BNB)

                        // const totalSupply = web3.utils.fromWei(await tokenContract.methods.totalSupply().call())
                        const vault = await isVaultExisting(token_address, account)

                        // result.balance = balance
                        result.nativePrice = routeNative.midPrice.invert().toSignificant(3)
                        result.usdPrice = result.nativePrice * binanceCoinPrice

                        // result.totalSupply = totalSupply
                        result.hasVault = vault.data.length > 0
                        result.isHidden = false

                        if (result.isHidden === false) {
                            tokens.push(result)
                        } else {
                            unprocessedTokens += 1
                        }
                        if (tokens.length === response.length - unprocessedTokens - 1) {
                            const bnbBalance = await web3.eth.getBalance(account)
                            
                            let BNBItem = {}
                            BNBItem.nativePrice = "1"
                            BNBItem.usdPrice = binanceCoinPrice
                            BNBItem.hasVault = false
                            BNBItem.isHidden = false
                            BNBItem.balance = bnbBalance
                            BNBItem.token_address = addresses.WBNB
                            BNBItem.name = "Binance Coin"
                            BNBItem.totalSupply = "0"
                            BNBItem.symbol = "BNB"

                            totalTokenBalanceBNB += web3.utils.fromWei(BNBItem.balance) * parseFloat(BNBItem.nativePrice)
                            totalTokenBalanceUSD += web3.utils.fromWei(BNBItem.balance) * parseFloat(BNBItem.usdPrice)

                            tokens.push(BNBItem)

                            setAcceptedDisclaimer(new Array(tokens.length).fill(false));
                            setCheckedState(new Array(tokens.length).fill(false));

                            updateCurrentBalance(account)
                            
                            setLoading(false)
                        }
                    } catch (err) {
                        unprocessedTokens += 1
                        console.log(err)
                    }
                })
            })
        })
    }

    function updateCurrentBalance() {
        let bnb = 0
        let usd = 0

        tokens.forEach((token, index) => {
            bnb += web3.utils.fromWei(token.balance) * parseFloat(token.nativePrice)
            usd += web3.utils.fromWei(token.balance) * parseFloat(token.usdPrice)

            if (tokens.length-1 === index) {
                console.log(bnb)
                console.log(usd)

                setTotalTokenBalanceBNB(bnb)
                setTotalTokenBalanceUSD(usd)
            }
        })
    }

    useEffect(() => {
        if (account) {
            if (tokens.length > 0) updateCurrentBalance(account)
        } else {
            handleConnectWallet()
        }

        if (tokens.length === 0) {
            setLoading(true)
            getTokenBalances(account)
        }

        if (mustRefresh === true) {
            setMustRefresh(false)

            tokens.forEach(element => {
                tokens.pop()
            })
            
            setTokens(tokens)

            setLoading(true)
            getTokenBalances(account)
        }
    }, [tokens, account, canSelect, totalTokenBalanceUSD, totalTokenBalanceBNB, mustRefresh, setMustRefresh])

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [stepper, setStepper] = useState(null)

    const renderDisclaimer = (token) => {
        setShowWizardEnable(true)
        
        return (
            <Popup
                modal
                nexted
                trigger={
                    token.token_address !== addresses.WBNB ?
                    <Badge pill id="more" color='light-primary' >
                        Protect Token
                    </Badge>
                    : null
                } position="middle center">
                {close => (
                    <div className="modal">
                        <div className="actions">
                            <button
                                className="button"
                                onClick={() => {
                                    console.log('modal closed ');
                                    close();
                                }}
                            >
                                close modal
                            </button>
                        </div>
                    </div>
                )}
                { showWizardEnable ? <WizardModernEnable token={token} /> : null}
                
            </Popup>
        )
    }

    function renderRugpullProtectionStatus(token) {
        return (
            <Badge pill color='light-success' >
                Protected
            </Badge>
        )
    }

    function isVaultExisting(token, account) {
        const nonce = crypto.randomBytes(16).toString('hex');
        return axios.get(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/getVault`, {
            headers: {
                'Authorization': `Basic ${localStorage.getItem("user")}${localStorage.getItem("password")}${nonce}`
            },
            params: {
                token: token.toLowerCase(),
                account: account.toLowerCase()
            }
        })
    }

    function hideToken(token_address) {
        let tokensFiltered = []

        tokens.map((token) => {
            if (token.token_address !== token_address) {
                tokensFiltered.push(token)
            }
        });

        setTokens(tokensFiltered)
        updateCurrentBalance()
    }

    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    function renderTableData() {
        return tokens.map((token, index) => {
            const { token_address, name, hasVault, balance, isHidden, symbol, nativePrice, usdPrice, totalSupply } = token

            const checksumTokenAddress = web3.utils.toChecksumAddress(token_address)
            const logo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/${checksumTokenAddress}/logo.png`
            const emptyLogo = 'https://i.ibb.co/vk3bgz1/notoken.png'

            const link = `https://bscscan.com/token/${checksumTokenAddress}`
            const checkboxType = (hasVault || canSelect === false) ? "hidden" : "checkbox"

            if (isHidden === true) {
                return null;
            }

            const onCopy = () => {
                toast.success(<ToastCopied />, {
                  autoClose: 3000,
                  hideProgressBar: true,
                  closeButton: false
                })
            }

            return (
                    <tr key={token_address} >
                        <td>
                            <input
                                type={checkboxType}
                                id={`custom-checkbox-${index}`}
                                name={name}
                                value={name}
                                checked={checkedState[index]}
                                onChange={() => handleOnChange(index)}
                            />
                            &nbsp;
                            &nbsp;
                            {!hasVault ? <Badge id="more" pill color='light-info' onClick={() => hideToken(token_address, balance, nativePrice, usdPrice)}>
                                Hide
                            </Badge> : null}
                            &nbsp;
                            &nbsp;
                            <CopyToClipboard onCopy={onCopy} text={token_address}>
                                <Badge id="more" pill title="Copy Contract" color='light-info'>
                                    <Copy size={14} />
                                </Badge>
                            </CopyToClipboard>
                        </td>
                        <td
                            onClick={() => window.open(link, "_blank")}>
                                <ImageFallback
                                    id="more"
                                    src={logo}
                                    fallbackSrc={emptyLogo}
                                    width="32"
                                    height="32"
                                />
                            &nbsp;
                            &nbsp;
                            {name}
                        </td>
                        <td>
                            ${millify(parseFloat(usdPrice), {
                                precision: 6
                            })}
                        </td>
                        {/* <td>
                            ${millify(totalSupply * parseFloat(usdPrice), {
                                precision: 6
                            })}
                        </td> */}
                        <td>
                            {hasVault ? renderRugpullProtectionStatus(token) : renderDisclaimer(token) }
                            &nbsp;
                            &nbsp;
                            {hasVault ? (
                                <Popup
                                    modal
                                    nested
                                    trigger={
                                        <Badge pill id="more" color='light-warning' >
                                            Turn off protection
                                        </Badge>
                                    } position="middle center">
                                    {close => (
                                        <div className="modal">
                                            <div className="actions">
                                                <button
                                                    className="button"
                                                    onClick={() => {
                                                        console.log('modal closed ');
                                                        close();
                                                    }}
                                                >
                                                    close modal
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <WizardModernDisable token={token} />
                                </Popup>
                            ) : null}
                        </td>
                        <td>
                            {millify(web3.utils.fromWei(balance) * parseFloat(nativePrice), {
                                precision: 3
                            })} BNB
                        </td>
                        <td>
                            ${millify(web3.utils.fromWei(balance) * parseFloat(usdPrice), {
                                precision: 6
                            })}
                        </td>
                         
                    </tr>
            )
        })
    }

    let loadingText = account ? "Loading your tokens... (this operation may take up to a few minutes)" : "Connect your wallet"

    return isLoading ? (
        <Box
            alignItems="center"
            verticalAlign="middle"
            width="100%"
            py="10%"
        >
            <Box
                width="50%"
                mx="50%"
            >

                <Loader
                    type="Puff"
                    color="#00BFFF"
                    height={50}
                    width={50}
                />
            </Box>
            <br />
            <Text
                textAlign="center"
                my="2%"
            >
                {loadingText}
            </Text>

        </Box >
    ) : (
        <Row>
            <Table size='sm' responsive>
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Price</th>
                        {/* <th>Marketcap</th> */}
                        <th>Rug Protector</th>
                        <th>Balance</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {renderTableData()}
                </tbody>
            </Table>
        </Row>
    )
}

