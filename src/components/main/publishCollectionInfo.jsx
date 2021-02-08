import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isAdmin } from '../auth/authService'
import './publicCollectionInfo.scss'

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
        <div className='text-truncate'>{url}</div>
      </div>
    )
  }

  renderPublicCollectionInfo () {
    return (
      <div className='public-colection-info'>
        <div>{this.renderPublicUrl()}</div>
        <div>{this.renderSettingsLink()}</div>
      </div>
    )
  }

  renderPublishCollection () {
    return (
      isAdmin() && <button className='btn btn-primary' onClick={() => { this.openPublishSettings() }}>Publish Collection</button>
    )
  }

  renderSettingsLink () {
    return (
      <div className='text-link' onClick={() => { isAdmin() ? this.openPublishSettings() : this.showAccessDiniedToast() }}>Settings</div>
    )
  }

  showAccessDiniedToast () {
    const message = 'You do not have access to the Public API Doc Settings, please contact workplace admin'
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
