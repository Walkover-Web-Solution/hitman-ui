import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isAdmin } from '../auth/authService'
import './publicCollectionInfo.scss'
import SettingIcon from '../../assets/icons/SettingIcon.png'
import FileIcon from '../../assets/icons/file.svg'
import DocIcon from '../../assets/icons/twitch.svg'
import { ReactComponent as ExternalLinks } from '../../assets/icons/externalLinks.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/helpcircle.svg'
import PublishSidebar from '../publishSidebar/publishSidebar'
import { openExternalLink, msgText } from '../common/utility'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints
  }
}

const defaultDomain = process.env.REACT_APP_PUBLIC_UI_URL

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
    const url = defaultDomain + '/p/' + this.props.collectionId
    return (
      <button onClick={() => { openExternalLink(url) }}>
        <div className='sidebar-public-url text-link text-center d-flex align-items-center'>
          <span className='icon d-flex mr-1'> <ExternalLinks /></span>
          <div className='text-truncate'>{url}</div>
        </div>
      </button>
    )
  }

  managePublicDoc () {
    return (
      <button onClick={() => { isAdmin() ? this.openPublishSettings() : this.showAccessDeniedToast() }}>
        <div className='d-flex align-items-center cursor-pointer'>
          <img className='mr-1' src={FileIcon} alt='' />
          <span>Manage Public Doc</span>
        </div>
      </button>
    )
  }

  redirectToApiFeedback () {
    const collectionId = this.props.collectionId
    if (collectionId) {
      this.props.history.push(`/orgs/${this.props.match.params.orgId}/dashboard/collection/${collectionId}/feedback`)
    }
  }

  renderInOverlay (method, msg) {
    return (
      <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>{msg}</Tooltip>}>
        <span className='d-inline-block'>
          {method()}
        </span>
      </OverlayTrigger>
    )
  }

  apiDocFeedback () {
    return (
      <button disabled={!isAdmin()} onClick={() => { this.redirectToApiFeedback() }}>
        <div className='d-flex align-items-center'>
          <img className='mr-1' src={DocIcon} alt='' />
          <span>API Doc Feedback</span>
        </div>
      </button>
    )
  }

  getPublicEntityCount () {
    const collectionId = this.props.collectionId
    const { endpoints, pages, versions, groups } = this.props

    let totalPageCount = 0
    let totalEndpointCount = 0
    let livePageCount = 0
    let liveEndpointCount = 0

    for (const endpointId of Object.keys(endpoints)) {
      const groupId = endpoints[endpointId]?.groupId
      const versionId = groups[groupId]?.versionId
      const endpointCollectionId = versions[versionId]?.collectionId
      if (endpointCollectionId && endpointCollectionId === collectionId) {
        totalEndpointCount++
        if (endpoints[endpointId]?.isPublished) liveEndpointCount++
      }
    }

    for (const pageId of Object.keys(pages)) {
      const groupId = pages[pageId]?.groupId
      let versionId = ''
      if (groupId) versionId = groups[groupId]?.versionId
      else versionId = pages[pageId]?.versionId
      const pageCollectionId = versions[versionId]?.collectionId
      if (pageCollectionId && pageCollectionId === collectionId) {
        totalPageCount++
        if (pages[pageId]?.isPublished) livePageCount++
      }
    }

    this.setState({ totalPageCount, totalEndpointCount, livePageCount, liveEndpointCount })

    if (this.props.getTotalEndpointsCount) {
      this.props.getTotalEndpointsCount(totalEndpointCount)
    }
  }

  // renderPublicCollectionInfo () {
  //   const currentCollection = this.props.collections[this.props.collectionId]
  //   const { totalPageCount, totalEndpointCount, livePageCount, liveEndpointCount } = this.state
  //   return (
  //     !currentCollection?.importedFromMarketPlace &&
  //       <div className='public-colection-info'>
  //         <div className='d-flex'>
  //           <div className='publicurl'>{this.renderPublicUrl()}</div>
  //           <div className='setting'>{this.renderSettingsLink()}</div>
  //         </div>
  //         <div className='endpoints-list'>
  //           <p>{`Public Endpoints: ${liveEndpointCount} / ${totalEndpointCount}`}</p>
  //           <p>{`Public Pages: ${livePageCount} / ${totalPageCount}`}</p>
  //         </div>
  //       </div>
  //   )
  // }

  renderPublicCollectionInfo () {
    const currentCollection = this.props.collections[this.props.collectionId]
    return (
      !currentCollection?.importedFromMarketPlace &&
        <div className='public-colection-info'>
          {this.managePublicDoc()}
          {isAdmin() ? this.apiDocFeedback() : this.renderInOverlay(this.apiDocFeedback.bind(this), msgText.adminAccees)}
          <div className='publicurl'>{this.renderPublicUrl()}</div>
        </div>
    )
  }

  renderPublishCollection () {
    const { totalEndpointCount } = this.state
    return (
      (totalEndpointCount > 1) &&
        <button
          className='btn btn-outline orange w-100 publishCollection'
          id='publish_api_doc_navbar_btn'
          disabled={!((totalEndpointCount > 2))}
          onClick={() => { this.redirectUser() }}
        >
          <div className='d-flex align-items-left'>
            <img className='ml-2 pl-1 mr-1' src={FileIcon} alt='' />
            <span className='truncate'>Publish API Documentation</span>
          </div>
          {(totalEndpointCount < 3) &&
            <div>
              <OverlayTrigger
                placement='right'
                overlay={<Tooltip> Add more than 2 endpoint to publish </Tooltip>}
              >
                <HelpIcon />
              </OverlayTrigger>
            </div>}
        </button>
    )
  }

  renderSettingsLink () {
    return (
      <div className='text-link' onClick={() => { isAdmin() ? this.openPublishSettings() : this.showAccessDeniedToast() }}>
        <img src={SettingIcon} alt='' />
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
      this.props.history.push(`/orgs/${this.props.match.params.orgId}/dashboard/collection/${collectionId}/settings`)
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
      <div>
        {isPublic ? this.renderPublicCollectionInfo() : this.renderPublishCollection()}
        {this.openPublishSidebar()}
      </div>
    )
  }
}

export default connect(mapStateToProps)(PublishCollectionInfo)
