import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isAdmin } from '../auth/authService'
import './publicCollectionInfo.scss'
import { ReactComponent as SettingIcon } from '../../assets/icons/SettingIcon.svg'
import { ReactComponent as ExternalLinks } from '../../assets/icons/externalLinks.svg'
import PublishSidebar from '../publishSidebar/publishSidebar'
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
    const customDomains = this.props.collections[this.props.collectionId]?.customDomain
    // build default url
    let url = defaultDomain + '/p/' + this.props.collectionId
    // handle multiple domains
    if (customDomains) {
      const domains = customDomains.split(',')
      // get first domain to show and redirect to
      for (let i = 0; i < domains.length; i++) {
        let domain = domains[i].trim()
        if (domain) {
          // check for protocol
          if (!domain.match(/^https?:\/\//)) domain = 'http://' + domain
          // check for a trailing slash
          if (domain.charAt(domain.length - 1) === '/') domain = domain.substr(0, domain.length - 2)
          // build custom url
          url = domain + '/p/' + this.props.collectionId
          break
        }
      }
    }
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
    this.setState({ totalPageCount, totalEndpointCount, livePageCount, liveEndpointCount })
  }

  renderPublicCollectionInfo () {
    const { totalPageCount, totalEndpointCount, livePageCount, liveEndpointCount } = this.state
    return (
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
      (this.state.totalEndpointCount !== 0 || this.state.totalPageCount !== 0) && <button className='btn btn-outline orange w-100 publishCollection' onClick={() => { this.openPublishSettings() }}>Publish API Documentation</button>
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
    // const collectionId = this.props.collectionId
    // if (collectionId) {
    //   this.props.history.push({
    //     pathname: '/admin/publish',
    //     search: `?collectionId=${collectionId}`
    //   })
    // }
    this.setState({ openPublishSidebar: true })
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
