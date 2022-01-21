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

export default function RefreshButton() {

    let { mustRefresh, setMustRefresh } = useBetween(useShareableState);

    const refresh = () => {
       setMustRefresh(true)
    }

    return (
        <Fragment>
            <Button.Ripple color='info'
                onClick={() => refresh()}
            >
                Refresh
            </Button.Ripple>
        </Fragment>
    )
}
