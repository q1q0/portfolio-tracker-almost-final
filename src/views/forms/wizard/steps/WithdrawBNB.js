import { Fragment, useEffect } from 'react'
import { Form, Button } from 'reactstrap'
import { useEthers, useSendTransaction } from "@usedapp/core"
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastSuccess, ToastError, useShareableState} from  "../../../tables/reactstrap/shared"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"
import { useBetween } from 'use-between';

let clicked = false
let done = false

require('dotenv').config()
const crypto = require('crypto');

const DepositBNB = ({ stepper, type }) => {
  const { sendTransaction, state } = useSendTransaction()

  const { account } = useEthers()    
  let { setShowWizardDisable } = useBetween(useShareableState)

  return (
    <Fragment>
      <div className='content-header'>
        <h5 className='mb-0'>Withdraw BNB</h5>
      </div>
      <Form onSubmit={e => e.preventDefault()}>
        <div className='d-flex justify-content-between'>
          <Button.Ripple disabled={clicked && done === false ? "true" : ""} color='info' type="submit" className='btn-submit' onClick={async function() {
              if (clicked === true && done === true) setShowWizardDisable(false)
              
              if (!account) return
              
              clicked = true

              const nonce = crypto.randomBytes(16).toString('hex');

              axios.post(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/returnGasToUser`, {
                data: {
                    recipient: account,
                    token: type.token.token_address
                }
              }, {
                headers: {
                  'Authorization': `Basic ${localStorage.getItem("user")}${localStorage.getItem("password")}${nonce}`
                }
              })
              .then((response) => {
                toast.success(<ToastSuccess />, {
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeButton: true
                })
        
                done = true
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

export default DepositBNB
