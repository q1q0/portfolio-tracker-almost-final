import { Fragment, useEffect } from 'react'
import { Form, Button } from 'reactstrap'
import axios from 'axios'
import { useEthers, useSendTransaction } from "@usedapp/core"
import { ethers } from "ethers"
import { toast } from 'react-toastify'
import { ToastSuccess, ToastError } from  "../../../tables/reactstrap/shared"
import Web3 from 'web3'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"

const crypto = require('crypto');

const minABI = require("../../../tables/abi/ERC20.json");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WSS));

const contractFile = require("../../../tables/abi/SparkLab.json")

let clicked = false
let done = false

const DepositTokens = ({ stepper, type }) => {
  const { sendTransaction, state } = useSendTransaction()

  const { account } = useEthers()

  useEffect(() => {
    if (state) {
      if (state.status === "Success") {
        toast.success(<ToastSuccess />, {
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: true
        })

        stepper.next()
      }

      if (state.status === "Exception") {
        clicked = false
        
        toast.error(<ToastError />, {
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: true
        })
      }
    }
  }, [state])

  return (
    <Fragment>
      <div className='content-header'>
        <h5 className='mb-0'>Withdraw Tokens</h5>
      </div>
      <Form onSubmit={e => e.preventDefault()}>
        <div className='d-flex justify-content-between'>
        <Button.Ripple disabled={clicked ? "true" : ""} color='info' type="submit" className='btn-submit' onClick={async function() {
              if (!account) return

              clicked = true

              const abi = contractFile.abi
              
              const nonce = crypto.randomBytes(16).toString('hex');

              axios.get(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/getVault`, {
                headers: {
                  'Authorization': `Basic ${localStorage.getItem("user")}${localStorage.getItem("password")}${nonce}`
                },
                params: {
                      token: type.token.token_address,
                      account: account
                  }
              })
              .then(async (response) => {
                  const contractAddress = response.data
      
                  const sparklab = new web3.eth.Contract(abi, contractAddress)
      
                  const tokenContract = new web3.eth.Contract(
                    minABI,
                    type.token.token_address
                  )
  
                  const balance = await tokenContract.methods.balanceOf(contractAddress).call()
                  
                  if (balance > 0) {
                    const sparklabTx = sparklab.methods.withdrawTokens(type.token.token_address).encodeABI()

                    await sendTransaction({ to: contractAddress, data: sparklabTx, value: ethers.utils.parseEther("0"), gasLimit: web3.utils.toHex(800000) })

                    const nonce = crypto.randomBytes(16).toString('hex');

                    axios.post(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/deleteVault`, {
                      data: {
                        vault: contractAddress.toLowerCase()
                      }
                    }, {
                      headers: {
                        'Authorization': `Basic ${localStorage.getItem("user")}${localStorage.getItem("password")}${nonce}`
                      }
                    })
                    .then((response) => {
                    })
                  } else {
                    stepper.next()                    
                  }
              })
            }}>
            { clicked === false ? <span className='align-middle d-sm-inline-block d-none'>Confirm</span> : 
                      <Loader
                          type="Puff"
                          color="#00BFFF"
                          height={50}
                          width={50}
                      />
              }
          </Button.Ripple>
        </div>
      </Form>
    </Fragment>
  )
}

export default DepositTokens
