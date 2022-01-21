import { Fragment, useEffect } from 'react'
import { Form, Button } from 'reactstrap'
import axios from 'axios'
import { useEthers, useSendTransaction } from "@usedapp/core"
import { ethers } from "ethers"
import Web3 from 'web3'
import { toast } from 'react-toastify'
import { ToastSuccess, ToastError, useShareableState} from  "../../../tables/reactstrap/shared"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"
import { useBetween } from 'use-between';

let clicked = false
let done = false

const crypto = require('crypto');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WSS));
const contractFile = require("../../../tables/abi/SparkLab.json")

const ApproveVault = ({ stepper, type }) => {
  const { sendTransaction, state } = useSendTransaction()

  useEffect(() => {
    if (state) {
      if (state.status === "Success") {
        toast.success(<ToastSuccess />, {
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: true
        })

        done = true

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

  const { account } = useEthers()    

  let { setShowWizardEnable } = useBetween(useShareableState)

  return (
    <Fragment>
      <div className='content-header'>
        <h5 className='mb-0'>Approve Vault</h5>
      </div>
      <Form onSubmit={e => e.preventDefault()}>
        <div className='d-flex justify-content-between'>
          <Button.Ripple disabled={clicked && done === false ? "true" : ""} color='info' type="submit" className='btn-submit' onClick={async function() {
              if (clicked === true && done === true) setShowWizardEnable(false)

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
            
                  const sparklab = new web3.eth.Contract(contractFile.abi, contractAddress)
            
                  const sparklabTx = sparklab.methods.approve(type.token.token_address, "0x10ed43c718714eb63d5aa57b78b54704e256024e").encodeABI()
            
                  await sendTransaction({ to: contractAddress, data: sparklabTx, value: ethers.utils.parseEther("0"), gasLimit: web3.utils.toHex(800000) })

              })
            }}>
            { clicked === false ? <span className='align-middle d-sm-inline-block d-none'>Confirm</span> :
              done === false ?
                <Loader
                  type="Puff"
                  color="#00BFFF"
                  height={50}
                  width={50}
                />
              : <span className='align-middle d-sm-inline-block d-none'>Done</span>
            }
          </Button.Ripple>
        </div>
      </Form>
    </Fragment>
  )
}

export default ApproveVault
