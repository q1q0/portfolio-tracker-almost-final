import { Fragment, useEffect } from 'react'
import { Form, Button } from 'reactstrap'
import { useEthers, useSendTransaction } from "@usedapp/core"
import { ethers } from "ethers"
import Web3 from 'web3'
import { toast } from 'react-toastify'
import { ToastSuccess, ToastError } from "../../../tables/reactstrap/shared"
import axios from 'axios'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"
import { Box } from "@chakra-ui/react"

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WSS));
const contractFile = require("../../../tables/abi/SparkLab.json")

const crypto = require('crypto');

let clicked = false

const SetupVault = ({ stepper, type }) => {
  const { sendTransaction, state } = useSendTransaction()

  const { account } = useEthers()

  useEffect(() => {
    if (state) {
      if (state.status === "Success") {
        if (state.receipt) {
          if (state.receipt.contractAddress) {
            const vault = state.receipt.contractAddress.toLowerCase()

            const nonce = crypto.randomBytes(16).toString('hex');

            axios.post(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/setVault`, {
              data: {
                token: type.token.token_address.toLowerCase(),
                account: state.receipt.from.toLowerCase(),
                vault: vault.toLowerCase()
              }
            }, {
              headers: {
                'Authorization': `Basic ${localStorage.getItem("user")}${localStorage.getItem("password")}${nonce}`
              }
            })
              .then(async (response) => {
                toast.success(<ToastSuccess />, {
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeButton: true
                })

                stepper.next()
              })
          }
        }
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
        <h5 className='mb-0'>Setup Vault</h5>
      </div>
      <Form onSubmit={e => e.preventDefault()}>
        <div className='d-flex justify-content-between'>
          <Button.Ripple disabled={clicked ? "true" : ""} color='info' type="submit" className='btn-submit' onClick={async function() {
            if (!account) return
            
            clicked = true

            // Deploy deposit vault contract and deposit BNB for gas

            const bytecode = contractFile.bytecode
            const abi = contractFile.abi

            console.log(`Attempting to deploy from account ${account}`)

            const sparklab = new web3.eth.Contract(abi)

            const sparklabTx = sparklab.deploy({
              data: bytecode
            })

            await sendTransaction({ from: account, data: sparklabTx.encodeABI(), value: ethers.utils.parseEther("0") })
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
    </Fragment >
  )
}

export default SetupVault
