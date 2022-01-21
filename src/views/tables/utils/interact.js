import { ethers } from "ethers"
import env from "react-dotenv"

const Web3 = require('web3')
const pancakeSwapRouterAbi = require("../abi/UNIRouterABI.json")
const axios = require('axios')

const redis = require('ioredis')
const client = redis.createClient({
  host: '65.21.121.78',
  port: "6379",
  password: process.env.REDIS_PASSWORD,
});

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WSS));

const sparkLabAbi = require("../abi/SparkLab.json").abi
const provider = new ethers.providers.Web3Provider(window.ethereum)

export const connectWallet = async () => {
  if (window.ethereum) {
    // Prompt user for account connections
    const addressArray = await window.ethereum.request({
      method: "eth_requestAccounts"
    })

    return addressArray
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts"
      })
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above."
        }
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button."
        }
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 ".concat(err.message)
      }
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser
            </a>
          </p>
        </span>
      )
    }
  }
}