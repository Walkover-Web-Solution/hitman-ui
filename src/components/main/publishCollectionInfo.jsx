import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isAdmin } from '../auth/authService'
import './publicCollectionInfo.scss'
import { ReactComponent as SettingIcon } from '../../assets/icons/SettingIcon.svg'
import { ReactComponent as ExternalLinks } from '../../assets/icons/externalLinks.svg'

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

const defaultDomain = process.env.REACT_APP_UI_URL

class PublishCollectionInfo extends Component {
  renderPublicUrl () {
    const customDomain = this.props.collections[this.props.collectionId]?.customDomain || defaultDomain
    const url = customDomain + '/p/' + this.props.collectionId
    return (
      <div className='sidebar-public-url text-link text-center d-flex' onClick={() => { window.open(url, '_blank') }}>
        <div className='text-truncate'>{url}</div> <span className='icon'> <ExternalLinks /></span>
      </div>
    )
  }

  renderPublicCollectionInfo () {
    return (
      <div className='public-colection-info'>
        <div className='d-flex'>
          <div className='publicurl'>{this.renderPublicUrl()}</div>
          <div className='setting'>{this.renderSettingsLink()}</div>
        </div>
        <div className='endpoints-list'>
          <p>Public Endpoints: 12 /20</p>
          <p>Public Pages: 1 /13</p>
        </div>
      </div>
    )
  }

  renderPublishCollection () {
    return (
      isAdmin() && <button className='btn btn-outline orange w-100 publishCollection' onClick={() => { this.openPublishSettings() }}>Publish API Documentation</button>
    )
  }

  renderSettingsLink () {
    return (
      <div className='text-link' onClick={() => { isAdmin() ? this.openPublishSettings() : this.showAccessDeniedToast() }}>
        <SettingIcon />
      </div>
    )
  }

  showAccessDeniedToast () {
    const message = 'You do not have access to the Public API Doc Settings, please contact workplace Admin'
    toast.error(message)
  }

  openPublishSettings () {
    const collectionId = this.props.collectionId
    if (collectionId) {
      this.props.history.push({
        pathname: '/admin/publish',
        search: `?collectionId=${collectionId}`
      })
    }
  }

  render () {
    const isPublic = this.props.collections[this.props.collectionId]?.isPublic || false
    return (
      <div className='my-3'>
        {isPublic ? this.renderPublicCollectionInfo() : this.renderPublishCollection()}
      </div>
    )
  }
}

export default connect(mapStateToProps)(PublishCollectionInfo)
