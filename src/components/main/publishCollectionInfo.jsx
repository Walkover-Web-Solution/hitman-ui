import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isAdmin } from '../auth/authService'
import './publicCollectionInfo.scss'
import { ReactComponent as SettingIcon } from '../../assets/icons/SettingIcon.svg'
import { ReactComponent as ExternalLinks } from '../../assets/icons/externalLinks.svg'
import PublishSidebar from '../publishSidebar/publishSidebar'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'
import { openExternalLink } from '../common/utility'

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
  constructor (props) {
    super(props)
    this.state = {
      openPublishSidebar: false,
      totalPageCount: 0,
      totalEndpointCount: 0,
      livePageCount: 0,
      liveEndpointCount: 0
    }
  }

  componentDidMount () {
    this.getPublicEntityCount()
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      this.props.endpoints !== prevProps.endpoints ||
      this.props.pages !== prevProps.pages ||
      this.props.versions !== prevProps.versions ||
      this.props.groups !== prevProps.groups
    ) {
      this.getPublicEntityCount()
    }
  }

  renderPublicUrl () {
    // build default url
    const url = defaultDomain + '/p/' + this.props.collectionId
    return (
      <div className='sidebar-public-url text-link text-center d-flex' onClick={() => { openExternalLink(url) }}>
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
    this.setState({ totalPageCount, totalEndpointCount, livePageCount, liveEndpointCount })
    if (this.props.getTotalEndpointsCount) {
      this.props.getTotalEndpointsCount(totalEndpointCount)
    }
  }

  renderPublicCollectionInfo () {
    const currentCollection = this.props.collections[this.props.collectionId]
    const { totalPageCount, totalEndpointCount, livePageCount, liveEndpointCount } = this.state
    return (
      !currentCollection?.importedFromMarketPlace &&
        <div className='public-colection-info'>
          <div className='d-flex'>
            <div className='publicurl'>{this.renderPublicUrl()}</div>
            <div className='setting'>{this.renderSettingsLink()}</div>
          </div>
          <div className='endpoints-list'>
            <p>{`Public Endpoints: ${liveEndpointCount} / ${totalEndpointCount}`}</p>
            <p>{`Public Pages: ${livePageCount} / ${totalPageCount}`}</p>
          </div>
        </div>
    )
  }

  renderPublishCollection () {
    return (
      (this.state.totalEndpointCount > 2) &&
        <button
          className='btn btn-outline orange w-100 publishCollection'
          id='publish_api_doc_navbar_btn'
          onClick={() => { this.redirectUser() }}
        >
          Publish API Documentation
        </button>
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

  redirectUser () {
    this.setState({ openPublishSidebar: true })
  }

  openPublishSettings () {
    const collectionId = this.props.collectionId
    if (collectionId) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collectionId}`
      })
    }
  }

  closePublishSidebar () {
    this.setState({ openPublishSidebar: false })
  }

  openPublishSidebar () {
    return (
      <>
        {this.state.openPublishSidebar &&
          <PublishSidebar
            {...this.props}
            closePublishSidebar={this.closePublishSidebar.bind(this)}
          />}
      </>
    )
  }

  render () {
    const isPublic = this.props.collections[this.props.collectionId]?.isPublic || false
    return (
      <div className='my-3'>
        {isPublic ? this.renderPublicCollectionInfo() : this.renderPublishCollection()}
        {this.openPublishSidebar()}
      </div>
    )
  }
}

export default connect(mapStateToProps)(PublishCollectionInfo)
