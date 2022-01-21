// ** React Imports
import { useEffect, useState } from 'react'

import Identicon from './Identicon'
import { Text } from "@chakra-ui/react";
import { Link } from 'react-router-dom'

// ** Utils
import { isUserLoggedIn } from '@utils'

// ** Store & Actions
import { useDispatch } from 'react-redux'
// import { handleLogout } from '@store/actions/auth'

// ** Third Party Components
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import { Power } from 'react-feather'

import { useEthers } from "@usedapp/core"

const UserDropdown = () => {
  const { account, deactivate } = useEthers()

  const [accountSliced, setAccounSliced] = useState("0x...")

  // ** Store Vars
  const dispatch = useDispatch()

  // ** State
  const [userData, setUserData] = useState(null)

  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
    if (account !== undefined) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
      setAccounSliced('0x...'.concat(account.slice(account.length - 3, account.length)))
    }
  }, [account])

  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
        <div className='user-nav d-sm-flex d-none'>
          <span>{accountSliced}</span>
          <span>Logout</span>
        </div>
        <Identicon />
      </DropdownToggle>
      <DropdownMenu right>
        <Link href='https://thesparklab.io' target='_blank'>
          <DropdownItem to='/landing' >
            <Power size={14} className='mr-75' />
            <span className='align-middle'>Logout</span>
          </DropdownItem>
        </Link>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown
