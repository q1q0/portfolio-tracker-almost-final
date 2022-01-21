import { useRef, useState } from 'react'
import Wizard from '@components/wizard'
import WithdrawBNB from './steps/WithdrawBNB'
import WithdrawTokens from './steps/WithdrawTokens'
import { useBetween } from 'use-between';
import { useShareableState} from  "../../tables/reactstrap/shared"

const WizardModernDisable = (token) => {
  const [stepper, setStepper] = useState(null)

  let { setShowWizardDisable } = useBetween(useShareableState)

  const ref = useRef(null)

  const steps = [
    {
      id: 'withdrawtokens',
      title: 'Withdraw Tokens',
      icon: <img width="32" height="32" src="coin.png" />,
      content: <WithdrawTokens stepper={stepper} type={token} />
    },
    {
      id: 'withdrawbnb',
      title: 'Withdraw BNB',
      icon: <img width="32" height="32" src="bnb.png" />,
      content: <WithdrawBNB stepper={stepper} type={token} />
    }
  ]

  setShowWizardDisable(true)
  
  return (
    <div className='vertical-wizard'>
      <Wizard
        type='vertical'
        ref={ref}
        token={token}
        steps={steps}
        options={{
          linear: true
        }}
        instance={el => setStepper(el)}
      />
    </div>
  )
}

export default WizardModernDisable
