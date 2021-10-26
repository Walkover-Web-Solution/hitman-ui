import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import Environments from '../environments/environments'
import UserInfo from './userInfo'
import socketLogo from '../../assets/icons/socketIcon.svg'
/* Commenting cloud icon for now, as no requirement was given for it but was mentioned in the design. */
/* import cloudImage from '../../assets/icons/cloud.svg' */
import { isElectron, openExternalLink } from '../common/utility'
import { getCurrentOrg, getCurrentUser } from '../auth/authService'
import { ReactComponent as CommunityIcon } from '../../assets/icons/community-icon.svg'
import ArrowIcon from '../../assets/icons/arrow.svg'

/* Internal Login Routes */
const LOGIN_ROUTE = process.env.REACT_APP_UI_URL + '/login'
const BROWSER_LOGIN_ROUTE = process.env.REACT_APP_UI_URL + '/browser-login'

/* Other Product Urls */
const EBL_UI_URL = process.env.REACT_APP_VIASOCKET_URL
const FEEDIO_UI_URL = process.env.REACT_APP_FEEDIO_UI_URL
const SHEETASDB_UI_URL = process.env.REACT_APP_SHEETASDB_UI_URL
const COMMUNITY_URL = process.env.REACT_APP_COMMUNITY_URL

/** Desktop App Download URL */
const DESKTOP_APP_DOWNLOAD_LINK = process.env.REACT_APP_DESKTOP_APP_DOWNLOAD_LINK

const HitmanBrand = () => {
  return (
    <div className='logo black-hover transition d-flex align-items-center'>
      <SwitchProducts />
    </div>
  )
}

const CommunityButton = () => {
  return (
    <div className='d-flex align-items-center black-hover transition' onClick={() => openExternalLink(COMMUNITY_URL)}>
      <CommunityIcon />
    </div>
  )
}

const SwitchProducts = () => {
  const currentOrgId = getCurrentOrg()?.identifier

  const products = [
    {
      name: 'Feedio',
      link: FEEDIO_UI_URL ? FEEDIO_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/` : '') : ''
    },
    {
      name: 'EBL',
      link: EBL_UI_URL ? EBL_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/projects` : '') : ''
    },
    {
      name: 'SheetAsDB',
      link: SHEETASDB_UI_URL ? SHEETASDB_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/projects` : '') : ''
    }
  ]

  const ProductItem = ({ product }) => {
    return (
      <Dropdown.Item onClick={() => openExternalLink(product.link)}>
        {product.name}
      </Dropdown.Item>
    )
  }

  return (
    <div className='switchPrd'>
      <Dropdown>
        <Dropdown.Toggle variant='success' id='dropdown-basic'>
          <img src={socketLogo} alt='' width='22' height='22' />
          <span>Hitman</span>
          <img src={ArrowIcon} alt='' className='transition rotate-180 ml-1' />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item disabled>
            Switch to
          </Dropdown.Item>
          {products.map((product, index) => (<ProductItem key={index} product={product} />))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

const LoginButton = () => {
  return (
    isElectron()
      ? <div className='float-right d-flex btn btn-primary' onClick={() => openExternalLink(BROWSER_LOGIN_ROUTE)}>Login/SignUp</div>
      : <div
          id='sokt-sso'
          data-redirect-uri={LOGIN_ROUTE}
          data-source='hitman'
          data-token-key='sokt-auth-token'
          data-view='button'
          data-app-logo-url='https://hitman.app/wp-content/uploads/2020/12/123.png'
          signup_uri={LOGIN_ROUTE + '?signup=true'}
        />
  )
}

const DownloadDesktopAppButton = () => {
  const handleDownloadClick = () => {
    const link = `${DESKTOP_APP_DOWNLOAD_LINK}?source=header`
    openExternalLink(link)
  }
  return (
    <div className='d-flex align-items-center'>
      <button onClick={handleDownloadClick} className='btn btn-primary download-btn'>Download Desktop App</button>
    </div>
  )
}

class Header extends Component {
  state = { }
  render () {
    return (
      <div className='env-wrapper header d-flex justify-space-between '>
        <HitmanBrand />
        <div className='float-right d-flex'>
          {!isElectron() && <DownloadDesktopAppButton />}
          {getCurrentUser() ? <Environments {...this.props} /> : null}
          {/* Commenting cloud icon for now, as no requirement was given for it but was mentioned in the design. */}
          {/* <div className='mx-3'><img src={cloudImage} alt='' /></div> */}
          <CommunityButton />
          <div>
            {getCurrentUser() ? <UserInfo {...this.props} /> : <LoginButton />}
          </div>
        </div>
      </div>
    )
  }
}

export default Header
