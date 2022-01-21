import {Fragment} from 'react'
import styled from 'styled-components'

// ** Custom Components
import NavbarBookmarks from '../../../@core/layouts/components/navbar/NavbarBookmarks'
import UserDropdown from '../../../@core/layouts/components/navbar/UserDropdown'

// ** Third Party Components
import { Sun, Moon } from 'react-feather'
import { NavItem, NavLink } from 'reactstrap'

const HeaderBar = styled.header`
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-flow: row nowrap;
    width: 100%;
    padding: 0.5em 1em;
    height: 64px;
    position: fixed;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.25);
    z-index: 1;
`

const Header = (props: { skin: any; setSkin: any; setMenuVisibility: any }) => {
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
            <HeaderBar>
                <div className='bookmark-wrapper d-flex align-items-center'>
                    <NavbarBookmarks setMenuVisibility={setMenuVisibility} />
                </div>
                <ul className='nav navbar-nav align-items-center ml-auto'>
                    <NavItem className='d-none d-lg-block'>
                    <NavLink className='nav-link-style'>
                        <ThemeToggler />
                    </NavLink>
                    </NavItem>
                    <UserDropdown />
                </ul>
            </HeaderBar>
        </Fragment>
    )
}

export default Header