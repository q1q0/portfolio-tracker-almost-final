import { Fragment, useEffect } from 'react'
import { Form, Button } from 'reactstrap'
import axios from 'axios'
import { useEthers, useSendTransaction } from "@usedapp/core"
import { ethers } from "ethers"
import { toast } from 'react-toastify'
import { ToastSuccess, ToastError } from  "../../../tables/reactstrap/shared"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"
import { Box } from "@chakra-ui/react"

const crypto = require('crypto');

let clicked = false

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY // Must be 256 bits (32 characters)// Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

let inprogress = false

const DepositBNB = ({ stepper, type }) => {
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
        <h5 className='mb-0'>Deposit BNB</h5>
      </div>
      <Form onSubmit={e => e.preventDefault()}>
        <div className='d-flex justify-content-between'>
          <Button.Ripple disabled={clicked ? "true" : ""} color='info' type="submit" className='btn-submit' onClick={async function() {
            if (!account) return
            
            clicked = true

            const sparklabManager = "0x9788e2AD342ffC64cB1C8B61245dee8E0b08911E"
    
            const actualBalance = ethers.utils.parseEther("0.025") 
            
            await sendTransaction({ from: account, to: sparklabManager, value: actualBalance})

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

export default DepositBNB
