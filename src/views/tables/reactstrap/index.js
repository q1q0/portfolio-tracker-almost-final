import { Fragment, useEffect } from 'react'
import prism from 'prismjs'
import TokenList from './TokenList'
import Web3 from 'web3'
import env from "react-dotenv"

import { useEthers } from "@usedapp/core"

import { useSkin } from '@hooks/useSkin'

import { Sun, Moon } from 'react-feather'

import { Row, Card, Col, CardHeader, CardBody, Form, FormGroup, Label, Input, Button, Navbar, Collapse, Nav, NavItem, NavLink } from 'reactstrap'

import { useBetween } from 'use-between'
import { useShareableBalances, useShareableState } from './shared'

import Breadcrumbs from '../../../@core/components/breadcrumbs/index.js'
import SellButton from './SellButton'
import RefreshButton from './RefreshButton'

import millify from "millify";

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WSS));

const Tables = props => {
  useEffect(() => {
    prism.highlightAll()
  })

  const [skin, setSkin] = useSkin()

  useEffect(() => {
    console.log(totalTokenBalanceUSD)
    console.log(totalTokenBalanceBNB)

  }, [totalTokenBalanceUSD, totalTokenBalanceBNB])

  const { account } = useEthers()
  const { tokens, setTokens } = useBetween(useShareableState)
  // eslint-disable-next-line prefer-const
  let { totalTokenBalanceUSD, setTotalTokenBalanceUSD, totalTokenBalanceBNB, setTotalTokenBalanceBNB } = useBetween(useShareableBalances)

  const { setMenuVisibility } = props

  const breadCrumb = 'Wallet Value: '.concat(millify(totalTokenBalanceBNB)).concat(' BNB')

  
  return (
    <Fragment>
      <Row >
        <Col>
          <Breadcrumbs breadCrumbActive={null} breadCrumbTitle={breadCrumb} breadCrumbParent={'$'.concat(millify(totalTokenBalanceUSD))} />
        </Col>


        <Col >
          <SellButton />
        </Col>
      </Row>
      <Row>
        <Col md='12'>
        <div className="card">
            <div className="card-header">
                <h4 className="card-title">{account}</h4>
            </div>
            <TokenList />
          </div>
        </Col>
      </Row>
    </Fragment>
  )
}

export default Tables