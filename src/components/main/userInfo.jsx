import React, { Component } from 'react'
import authService from '../auth/authService'
import { Dropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getProfileName } from '../common/utility'
import { ReactComponent as TeamIcon } from '../../assets/icons/teamIcon.svg'
import { ReactComponent as HostedApiIcon } from '../../assets/icons/hostedApiIcon.svg'
import { ReactComponent as SignOutIcon } from '../../assets/icons/signOutIcon.svg'

class UserInfo extends Component {
  state = {}

  componentDidMount () {
    if (authService.getCurrentUser()) {
      const user = {}
      const currentUser = authService.getCurrentUser()
      user.name = getProfileName(currentUser)
      user.email = currentUser.email
      this.setState({ user })
    }
  }

  getFirstPublicCollection () {
    const allCollections = this.props.get_public_collections()
    let firstCollection = {}
    const collectionId = allCollections[0]
    const collection = this.props.collections[collectionId]
    firstCollection = collection
    return firstCollection
  }

  navigateToPublishDocs () {
    const collection = this.getFirstPublicCollection()
    this.props.open_publish_docs(collection)
  }

  navigateToViaSocket () {
    const viaSocketUrl = `${process.env.REACT_APP_VIASOCKET_URL}/manage`
    window.open(viaSocketUrl, '_blank')
  }

  userDropdown () {
    return (
      <Dropdown bsPrefix='dropdown user-info-dropdown'>
        <Dropdown.Toggle variant=''>
          <div className='text-truncate'>{this.state.user?.name || this.state.user?.email || ''}</div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <div className='dropdown-item' style={{ cursor: 'pointer' }} onClick={() => this.navigateToViaSocket()}>
            <TeamIcon />Organization
          </div>
          {authService.isAdmin() &&
            <Dropdown.Item onClick={() => { this.navigateToPublishDocs() }}>
              <HostedApiIcon />Hosted API
            </Dropdown.Item>}
          <Link to='/logout' className='dropdown-item'><SignOutIcon />Sign out</Link>
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  render () {
    return (
      <div className='d-flex'>
        {this.userDropdown()}
      </div>
    )
  }
}

export default UserInfo
