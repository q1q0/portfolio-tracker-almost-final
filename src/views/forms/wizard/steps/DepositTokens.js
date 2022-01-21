import { Fragment, useEffect } from 'react'
import { Form, Button } from 'reactstrap'
import { useEthers, useSendTransaction } from "@usedapp/core"
import Web3 from 'web3'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastSuccess, ToastError } from  "../../../tables/reactstrap/shared"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"
import { Box } from "@chakra-ui/react"

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WSS));

const crypto = require('crypto');

let clicked = false

const minAbi = require("../../../tables/abi/ERC20.json")

const DepositTokens = ({stepper, type}) => {
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
        <h5 className='mb-0'>Deposit Tokens</h5>
      </div>
      <Form onSubmit={e => e.preventDefault()}>
      <div className='d-flex justify-content-between'>
        <Button.Ripple disabled={clicked ? "true" : ""} color='info' type="submit" className='btn-submit' onClick={async function() {
            if (!account) return
    
            clicked = true

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
                if (!contractAddress) return
                
                // Deposit tokens to deposit vault smart contract
                const tokenContract = new web3.eth.Contract(minAbi, type.token.token_address)
                const actualBalance = await tokenContract.methods.balanceOf(account).call()
                const balanceBN = web3.utils.toBN(actualBalance);
                const balanceInWeiMinus1 = balanceBN.add(new web3.utils.BN("-1"))

                const tokenTransferTx = tokenContract.methods.transfer(contractAddress, balanceInWeiMinus1.toString()).encodeABI()
    
                await sendTransaction({ from: account, to: type.token.token_address, data: tokenTransferTx})
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
