import { useRef, useState } from 'react'
import Wizard from '@components/wizard'
import SetupVault from './steps/SetupVault'
import DepositBNB from './steps/DepositBNB'
import DepositTokens from './steps/DepositTokens'
import ApproveVault from './steps/ApproveVault'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import axios from 'axios'

const crypto = require('crypto');
const MySwal = withReactContent(Swal)
let showDisclaimer = true

const WizardModernEnable = (token) => {
  function openDisclaimer(token) {
    const nonce = crypto.randomBytes(16).toString('hex');

    axios.get(`${process.env.REACT_APP_REST_PROTOCOL}://${process.env.REACT_APP_REST_HOST}:${process.env.REACT_APP_REST_PORT}/fetchTokenTransactionTax`, {
        headers: {
          'Authorization': `Basic ${localStorage.getItem("user")}${localStorage.getItem("password")}${nonce}`
        },
        params: {
            token: token.token.token_address.toLowerCase()
        }
    })
    .then(async (response) => {
      const transactionTax = response.data
      const disclaimerText = `<span>We do not guarantee a 100% succes ratio on protecting your tokens.</span>
      <br>
      <br>
      <span>We will however lower your risk of losing money due to a rugpull.</span>
      <br>
      <br>
      <span>Scammers are extremely creative when it comes to steal investors, always make sure to do your own research before to buy a coin.</span>
      <br>
      <br>
      <span>The rugpull protector is free, but sending your tokens to the vault might trigger transaction fees coded in the tokens contract, see below:</span>
      <br>
      <br>
      <span>Token Transaction Tax (may not be always accurate): ${transactionTax}%</span>
      <br>
      <br>
      <span>Vault Setup Fees: 0.03 BNB</span>`

      MySwal.fire({
          title: 'Disclaimer',
          showCloseButton: true,
          focusConfirm: true,
          html: disclaimerText,
          icon: 'info',
          customClass: {
              confirmButton: 'btn btn-primary'
          },
          showClass: {
              popup: 'animate__animated animate__flipInX'
          },
          buttonsStyling: false
      }).then((result) => {
        showDisclaimer = false
      })
    })
  }

  const [stepper, setStepper] = useState(null)
  const ref = useRef(null)

  const steps = [
    {
      id: 'setup',
      title: 'Setup Vault',
      icon: <img width="32" height="32" src="vault.png" />,
      content: <SetupVault stepper={stepper} type={token} />
    },
    {
      id: 'deposittokens',
      title: 'Deposit Tokens',
      icon: <img width="32" height="32" src="coin.png" />,
      content: <DepositTokens stepper={stepper} type={token} />
    },
    {
      id: 'depositbnb',
      title: 'Deposit BNB',
      icon: <img width="32" height="32" src="bnb.png" />,
      content: <DepositBNB stepper={stepper} type={token} />
    },
    {
      id: 'approvevault',
      title: 'Approve Vault',
      icon: <img width="32" height="32" src="vault.png" />,
      content: <ApproveVault stepper={stepper} type={token} />
    }
  ]

  if (showDisclaimer === true) openDisclaimer(token);
  
  return (
    <div className='vertical-wizard'>
      <Wizard
        type='vertical'
        ref={ref}
        steps={steps}
        options={{
          linear: true
        }}
        instance={el => {
          setStepper(el)
        }}
      />
    </div>
  )
}

export default WizardModernEnable
