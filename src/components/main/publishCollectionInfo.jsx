import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isAdmin } from '../auth/authService'
import './publicCollectionInfo.scss'
import { ReactComponent as SettingIcon } from '../../assets/icons/SettingIcon.svg'
import { ReactComponent as ExternalLinks } from '../../assets/icons/externalLinks.svg'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints
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

  getPublicEntityCount () {
    const collectionId = this.props.collectionId
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(collectionId, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    const pages = extractCollectionInfoService.extractPagesFromVersions(versions, this.props)
    const endpoints = extractCollectionInfoService.extractEndpointsFromGroups(groups, this.props)
    const totalPageCount = Object.keys(pages).length
    const totalEndpointCount = Object.keys(endpoints).length
    let livePageCount = 0
    let liveEndpointCount = 0
    Object.values(pages).forEach(page => {
      if (page.isPublished) livePageCount++
    })
    Object.values(endpoints).forEach(endpoint => {
      if (endpoint.isPublished) liveEndpointCount++
    })
    return {
      pages: {
        live: livePageCount,
        total: totalPageCount
      },
      endpoints: {
        live: liveEndpointCount,
        total: totalEndpointCount
      }
    }
  }

  renderPublicCollectionInfo () {
    const count = this.getPublicEntityCount()
    return (
      <div className='public-colection-info'>
        <div className='d-flex'>
          <div className='publicurl'>{this.renderPublicUrl()}</div>
          <div className='setting'>{this.renderSettingsLink()}</div>
        </div>
        <div className='endpoints-list'>
          <p>{`Public Endpoints: ${count.endpoints.live} / ${count.endpoints.total}`}</p>
          <p>{`Public Pages: ${count.pages.live} / ${count.pages.total}`}</p>
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
