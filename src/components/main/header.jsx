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
import { ReactComponent as ProductsIcon } from '../../assets/icons/products-icon.svg'

/* Internal Login Routes */
const LOGIN_ROUTE = process.env.REACT_APP_UI_URL + '/login'
const BROWSER_LOGIN_ROUTE = process.env.REACT_APP_UI_URL + '/browser-login'

/* Other Product Urls */
const EBL_UI_URL = process.env.REACT_APP_VIASOCKET_URL
const FEEDIO_UI_URL = process.env.REACT_APP_FEEDIO_UI_URL
const SHEETASDB_UI_URL = process.env.REACT_APP_SHEETASDB_UI_URL
const COMMUNITY_URL = process.env.REACT_APP_COMMUNITY_URL

/* Other Product Logos */
const EBL_LOGO = process.env.REACT_APP_EBL_LOGO
const FEEDIO_LOGO = process.env.REACT_APP_FEEDIO_LOGO
const SHEETASDB_LOGO = process.env.REACT_APP_SHEETASDB_LOGO

/** Desktop App Download URL */
const DESKTOP_APP_DOWNLOAD_LINK = process.env.REACT_APP_DESKTOP_APP_DOWNLOAD_LINK

const HitmanBrand = () => {
  return (
    <div className='logo d-flex align-items-center'>
      <img src={socketLogo} alt='' width='30' height='30' />
      <span>Hitman</span>
    </div>
  )
}

const CommunityButton = () => {
  return (
    <div className='ml-2' onClick={() => openExternalLink(COMMUNITY_URL)}>
      <CommunityIcon />
    </div>
  )
}

const SwitchProducts = () => {
  const currentOrgId = getCurrentOrg()?.identifier

  const products = [
    {
      name: 'Feedio',
      icon: FEEDIO_LOGO,
      link: FEEDIO_UI_URL ? FEEDIO_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/` : '') : ''
    },
    {
      name: 'EBL',
      icon: EBL_LOGO,
      link: EBL_UI_URL ? EBL_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/projects` : '') : ''
    },
    {
      name: 'SheetAsDB',
      icon: SHEETASDB_LOGO,
      link: SHEETASDB_UI_URL ? SHEETASDB_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/projects` : '') : ''
    }
  ]

  const ProductItem = ({ product }) => {
    return (
      <Dropdown.Item onClick={() => openExternalLink(product.link)}>
        <img src={product.icon} alt='' height='20px' width='20px' />
        {product.name}
      </Dropdown.Item>
    )
  }

  return (
    <div className='switchPrd'>
      <Dropdown>
        <Dropdown.Toggle variant='success' id='dropdown-basic'>
          <ProductsIcon />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item disabled>
            Switch Products
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
    <button onClick={handleDownloadClick} className='btn btn-primary'>Download Desktop App</button>
  )
}

class Header extends Component {
  state = { }
  render () {
    return (
      <div className='env-wrapper header d-flex justify-space-between '>
        <HitmanBrand />
        <div className='float-right d-flex align-items-center'>
          {!isElectron() && <DownloadDesktopAppButton />}
          {getCurrentUser() ? <Environments {...this.props} /> : null}
          {/* Commenting cloud icon for now, as no requirement was given for it but was mentioned in the design. */}
          {/* <div className='mx-3'><img src={cloudImage} alt='' /></div> */}
          <CommunityButton />
          <SwitchProducts />
          <div className='ml-3'>
            {getCurrentUser() ? <UserInfo {...this.props} /> : <LoginButton />}
          </div>
        </div>
      </div>
    )
  }
}

export default Header
