import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { isAdmin } from '../auth/authServiceV2'
import './publicCollectionInfo.scss'
import SettingIcon from '../../assets/icons/SettingIcon.png'
import FileIcon from '../../assets/icons/file.svg'
import DocIcon from '../../assets/icons/twitch.svg'
import { ReactComponent as ExternalLinks } from '../../assets/icons/externalLinks.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/helpcircle.svg'
import PublishSidebar from '../publishSidebar/publishSidebar'
import { openExternalLink, msgText } from '../common/utility'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { store } from '../../store/store'
import { updateTab } from '../tabs/redux/tabsActions'
import _ from 'lodash'
import { publishData } from '../modals/redux/modalsActions'
import { updateCollectionIdForPublish } from '../../store/clientData/clientDataActions'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints,
    modals: state.endpoints,
    isPublishSliderOpen: state.modals.publishData,
    tabs: state.tabs
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ON_PUBLISH_DOC: (data) => dispatch(publishData(data)),
    setCollectionIdForPublish: (data) => dispatch(updateCollectionIdForPublish(data))
  }
}

const defaultDomain = process.env.REACT_APP_PUBLIC_UI_URL

class PublishCollectionInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openPublishSidebar: false,
      totalPageCount: 0,
      totalEndpointCount: 0,
      livePageCount: 0,
      liveEndpointCount: 0
    }
  }

  componentDidMount() {
    this.getPublicEntityCount()
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.endpoints !== prevProps.endpoints ||
      this.props.pages !== prevProps.pages ||
      this.props.versions !== prevProps.versions ||
      this.props.groups !== prevProps.groups
    ) {
      this.getPublicEntityCount()
    }
  }

  renderPublicUrl() {
    const url = defaultDomain + '/p/' + this.props.collectionId
    const { versions, groups, endpoints, collectionId } = this.props
    const targetVersionIds = _.values(versions)
      .filter((version) => version.collectionId === collectionId)
      .map((version) => version.id)
    const targetGroupIds = _.values(groups)
      .filter((group) => targetVersionIds.includes(group.versionId))
      .map((group) => group.id)
    const publishedEndpoints = _.values(endpoints).filter((endpoint) => targetGroupIds.includes(endpoint.groupId) && endpoint.isPublished)
    const isDisabled = _.isEmpty(publishedEndpoints)
    return (
      <OverlayTrigger
        overlay={
          <Tooltip id='tooltip-unpublished-endpoint' className={!isDisabled && 'd-none'}>
            Atleast one endpoint/page is to be published to enable this link.
          </Tooltip>
        }
      >
        {/* <button onClick={() => !isDisabled && openExternalLink(url)}> */}
        <button onClick={() => openExternalLink(url)}>
          <div className={`sidebar-public-url text-center d-flex align-items-center${!isDisabled && ' text-link'}`}>
            <span className='icon d-flex mr-1'>
              {' '}
              <ExternalLinks />
            </span>
            <div className='text-truncate'>{url}</div>
          </div>
        </button>
      </OverlayTrigger>
    )
  }

  managePublicDoc() {
    const { totalEndpointCount } = this.state
    return (
      <button
        className='btn'
        // disabled={!totalEndpointCount}
        onClick={() => {
          isAdmin() ? this.openPublishSettings() : this.showAccessDeniedToast()
        }}
      >
        <div className='d-flex align-items-center cursor-pointer'>
          <img className='mr-1' src={SettingIcon} alt='' />
          <span>Manage Public Doc</span>
        </div>
        {this.renderInfoText('Add an endpoint first')}
      </button>
    )
  }

  async redirectToApiFeedback() {
    const collectionId = this.props.collectionId
    if (collectionId) {
      this.props.history.push(`/orgs/${this.props.match.params.orgId}/dashboard/collection/${collectionId}/feedback`)
    }
    const activeTab = this.props.tabs.activeTabId
    store.dispatch(updateTab(activeTab, { state: { pageType: 'FEEDBACK' } }))
  }

  renderInOverlay(method, msg) {
    return (
      <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>{msg}</Tooltip>}>
        <span className='d-inline-block'>{method()}</span>
      </OverlayTrigger>
    )
  }

  apiDocFeedback() {
    return (
      <button
        disabled={!isAdmin()}
        onClick={() => {
          this.redirectToApiFeedback()
        }}
      >
        <div className='d-flex align-items-center'>
          <img className='mr-1' src={DocIcon} alt='' />
          <span>API Doc Feedback</span>
        </div>
      </button>
    )
  }

  getPublicEntityCount() {
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

  renderPublicCollectionInfo(isPublic) {
    const currentCollection = this.props.collections[this.props.collectionId]
    return (
      !currentCollection?.importedFromMarketPlace && (
        <div className='public-colection-info'>
          {this.managePublicDoc()}
          {isPublic && (isAdmin() ? this.apiDocFeedback() : this.renderInOverlay(this.apiDocFeedback.bind(this), msgText.adminAccees))}
          {isPublic && <div className='publicurl'>{this.renderPublicUrl()}</div>}
        </div>
      )
    )
  }

  renderInfoText(info) {
    const { totalEndpointCount } = this.state
    return (
      totalEndpointCount < 1 && (
        <div>
          <OverlayTrigger placement='right' overlay={<Tooltip> {info} </Tooltip>}>
            <HelpIcon />
          </OverlayTrigger>
        </div>
      )
    )
  }

  renderPublishCollection() {
    const { totalEndpointCount } = this.state
    return (
      <button
        className='btn btn-outline orange w-100 publishCollection'
        id='publish_api_doc_navbar_btn'
        // disabled={!totalEndpointCount}
        onClick={() => {
          this.redirectUser()
        }}
      >
        <div className='d-flex align-items-left'>
          <img className='ml-2 pl-1 mr-1' src={FileIcon} alt='' />
          <span className='truncate'>Publish API Documentation2</span>
        </div>
        {this.renderInfoText('Add an endpoint to publish')}
      </button>
    )
  }

  renderSettingsLink() {
    return (
      <div
        className='text-link'
        onClick={() => {
          isAdmin() ? this.openPublishSettings() : this.showAccessDeniedToast()
        }}
      >
        <img src={SettingIcon} alt='' />
      </div>
    )
  }

  showAccessDeniedToast() {
    const message = 'You do not have access to the Public API Doc Settings, please contact workplace Admin'
    toast.error(message)
  }

  redirectUser() {
    this.setState({ openPublishSidebar: true })
    this.props.ON_PUBLISH_DOC(true)
    this.props.setCollectionIdForPublish({ collectionId: this.props.collectionId })
  }

  async openPublishSettings() {
    const collectionId = this.props.collectionId
    if (collectionId) {
      this.props.history.push(`/orgs/${this.props.match.params.orgId}/dashboard/collection/${collectionId}/settings`)
    }
    const activeTab = this.props.tabs.activeTabId
    store.dispatch(updateTab(activeTab, { state: { pageType: 'SETTINGS' } }))
  }

  closePublishSidebar() {
    this.setState({ openPublishSidebar: false })
    this.props.ON_PUBLISH_DOC(false)
  }

  openPublishSidebar() {
    return (
      <>
        {this.props.isPublishSliderOpen && (
          <PublishSidebar
            {...this.props}
            closePublishSidebar={this.closePublishSidebar.bind(this)}
            openPublishSettings={this.openPublishSettings.bind(this)}
          />
        )}
      </>
    )
  }

  render() {
    const isPublic = this.props.collections[this.props.collectionId]?.isPublic || false
    return (
      <div>
        {this.renderPublishCollection()}
        {this.renderPublicCollectionInfo(isPublic)}
        {this.openPublishSidebar()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishCollectionInfo)
