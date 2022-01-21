import { Fragment, useState } from 'react'
import { Check } from 'react-feather'

export const useShareableState = () => {
    const [tokens, setTokens] = useState<any[]>([])
    const [selected, setSelected] = useState<any[]>([])
  
    let [canSelect, setCanSelect] = useState(false)
    let [mustRefresh, setMustRefresh] = useState(false)

    let [showWizardEnable, setShowWizardEnable] = useState(false)
    let [showWizardDisable, setShowWizardDisable] = useState(false)

    return {
        tokens,
        setTokens,
        selected,
        setSelected,
        canSelect,
        setCanSelect,
        mustRefresh,
        setMustRefresh,
        showWizardEnable,
        setShowWizardEnable,
        showWizardDisable,
        setShowWizardDisable
    }
}

export const useShareableBalances = () => {
    const [totalTokenBalanceUSD, setTotalTokenBalanceUSD] = useState(0)
    const [totalTokenBalanceBNB, setTotalTokenBalanceBNB] = useState(0)

    return {
        totalTokenBalanceUSD,
        setTotalTokenBalanceUSD,
        totalTokenBalanceBNB,
        setTotalTokenBalanceBNB
    }
}

export const ToastSuccess = () => (
    <Fragment>
      <div className='toastify-header'>
        <div className='title-wrapper'>
          <Check size={12} />
          <h6 className='toast-title'>Congratulations!</h6>
        </div>
      </div>
      <div className='toastify-body'>
        <span role='img' aria-label='toast-text'>
            Transaction Successfull!
        </span>
      </div>
    </Fragment>
)

export const ToastCopied = () => (
  <Fragment>
    <div className='toastify-header'>
      <div className='title-wrapper'>
        <Check size={12} />
        <h6 className='toast-title'>Congratulations!</h6>
      </div>
    </div>
    <div className='toastify-body'>
      <span role='img' aria-label='toast-text'>
        Token Address Copied
      </span>
    </div>
  </Fragment>
)

export const ToastError = () => (
    <Fragment>
      <div className='toastify-header'>
        <div className='title-wrapper'>
          <h6 className='toast-title'>Oops!</h6>
        </div>
      </div>
      <div className='toastify-body'>
        <span role='img' aria-label='toast-text'>
          Transaction Failed
        </span>
      </div>
    </Fragment>
)

export const ToastInfo = () => (
    <Fragment>
      <div className='toastify-header'>
        <div className='title-wrapper'>
          <h6 className='toast-title'>Transaction Submitted</h6>
        </div>
      </div>
      <div className='toastify-body'>
        <span role='img' aria-label='toast-text'>
            Waiting Transaction Confirmation
        </span>
      </div>
    </Fragment>
  )