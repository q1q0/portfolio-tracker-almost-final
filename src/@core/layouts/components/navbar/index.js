// ** React Imports
import { Fragment } from 'react'

// ** Dropdowns Imports
import UserDropdown from './UserDropdown'
import './style.scss'

// ** Custom Components
import NavbarBookmarks from './NavbarBookmarks'

// ** Third Party Components
import { Sun, Moon, MessageSquare } from 'react-feather'
import { NavItem, NavLink, DropdownItem } from 'reactstrap'
import { Link } from 'react-router-dom'

const ThemeNavbar = props => {
  // ** Props
  const { skin, setSkin, setMenuVisibility } = props

  // ** Function to toggle Theme (Light/Dark)
  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className='ficon' onClick={() => setSkin('light')} />
    } else {
      return <Moon className='ficon' onClick={() => setSkin('dark')} />
    }
  }

  return (
    <Fragment>

      <div className='bookmark-wrapper d-flex align-items-center'>
          <MessageSquare className='ficon' id="more" onClick={() => window.open('https://t.me/SparkLabOfficialChannel', '_blank')}/>
      </div>
      <ul className='nav navbar-nav align-items-center ml-auto'>
        <NavItem className='d-none d-lg-block'>
          <NavLink className='nav-link-style'>
            <ThemeToggler />
          </NavLink>
        </NavItem>
        <UserDropdown />
      </ul>
    </Fragment>
  )
}

export default ThemeNavbar
