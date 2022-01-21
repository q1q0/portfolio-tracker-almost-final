import { useBetween } from 'use-between';
import { useShareableState } from './shared';
import { useEthers } from "@usedapp/core";
import { useEffect, useState, Fragment } from "react";
import { Button } from 'reactstrap'
import Web3 from 'web3';
import './SellButton.scss'
import { toast } from 'react-toastify'
import { ToastSuccess } from './shared'

const pancakeSwapRouterAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
const pancakeSwapRouterAbi = require("../abi/UNIRouterABI.json");

export default function SellButton() {

    let { selected, canSelect, setCanSelect } = useBetween(useShareableState);
    const { account, library } = useEthers();
    const initialText = "Sell Token(s)"
    const [ buttonText, setButtonText ] = useState(initialText)

    const deactivateMultipleSelect = () => {
        setButtonText(initialText)
        setCanSelect(false)
    }

    const sellAllTokens = async () => {
        if (buttonText === initialText) {
            setButtonText("Confirm Sell")
            setCanSelect(true)
        } else {
            if (selected.length > 0) {
                var web3 = new Web3(library.provider);

                var batch = new web3.BatchRequest();
    
                for (let token of selected) {
                    const { token_address, name, balance } = token
    
                    const amountIn = balance
                    const amountOut = 0
                    const path = [token_address, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"]
                    const to = account
                    const deadline = Math.floor(Date.now() / 1000) + 60 * 50
    
                    const pcsContract = new web3.eth.Contract(pancakeSwapRouterAbi, pancakeSwapRouterAddress)
    
                    let txData = pcsContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOut, path, to, deadline).encodeABI()
    
                    batch.add(pcsContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOut, path, to, deadline).send.request({
                        to: pancakeSwapRouterAddress,
                        from: account,
                        value: web3.utils.toHex(web3.utils.toWei('0', 'ether')),
                        gasLimit: web3.utils.toHex("2000000"),
                        gasPrice: web3.utils.toHex(web3.utils.toWei('5', 'gwei')),
                        data: txData
                    }, (err, res) => console.log(err, res)));
                }
    
                await batch.execute()
            }
        }
    }

    return (
        <Fragment>
            { canSelect === true ? 
                <Button.Ripple color='danger'
                    onClick={() => deactivateMultipleSelect()}
                >
                    {`Cancel`}
                </Button.Ripple>
            : null}
            &nbsp;
            &nbsp;
            <Button.Ripple color='info'
                onClick={() => sellAllTokens()}
            >
                {buttonText}
            </Button.Ripple>
        </Fragment>
    )
}
