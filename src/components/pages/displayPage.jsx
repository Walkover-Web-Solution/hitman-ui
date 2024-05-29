import React, { Component } from 'react'
import { store } from '../../store/store'
import { connect } from 'react-redux'
import {
  isDashboardRoute,
  isStateDraft,
  isStateReject,
  msgText,
  isStatePending,
  isStateApproved,
  getEntityState,
  isOnPublishedPage
} from '../common/utility'
import './page.scss'
import { updatePage } from './redux/pagesActions'
import EndpointBreadCrumb from '../endpoints/endpointBreadCrumb'
import ApiDocReview from '../apiDocReview/apiDocReview'
import { isAdmin } from '../auth/authServiceV2'
import { approvePage, pendingPage, rejectPage, draftPage } from '../publicEndpoint/redux/publicEndpointsActions'
import ConfirmationModal from '../common/confirmationModal'
import { ApproveRejectEntity, PublishEntityButton, UnPublishEntityButton } from '../common/docViewOperations'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Tiptap from '../tiptapEditor/tiptap'
import { getPageContent } from '../../services/pageServices'
import { getPublishedContentByIdAndType } from '../../services/generalApiService'
import { useQuery } from 'react-query'
import { SESSION_STORAGE_KEY } from '../common/utility'
import Footer from '../main/Footer'
import moment from 'moment'

const withQuery = (WrappedComponent) => {
  return (props) => {
    let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    const pageId = !isOnPublishedPage() ? props?.match?.params?.pageId : currentIdToShow
    let { data, error } = useQuery(
      ['pageContent', pageId],
      async () => {
        return isOnPublishedPage()
          ? await getPublishedContentByIdAndType(currentIdToShow, props?.pages?.[currentIdToShow]?.type)
          : await getPageContent(props?.match?.params?.orgId, pageId)
      },
      {
        refetchOnWindowFocus: false,
        cacheTime: 5000000,
        enabled: true,
        staleTime: 600000,
        retry: 2
      }
    )
    const tabId = props?.tabs?.tabs?.[pageId]
    if (tabId?.isModified && tabId?.type == 'page' && tabId?.draft) {
      data = tabId?.draft
    }
    return <WrappedComponent {...props} pageContent={data} currentPageId={pageId} pageContentLoading={data?.isLoading} pageContentError={error} />
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (editedPage, pageId) => dispatch(updatePage(ownProps.history, editedPage, pageId)),
    approve_page: (page, publishPageLoaderHandler) => dispatch(approvePage(page, publishPageLoaderHandler)),
    pending_page: (page) => dispatch(pendingPage(page)),
    reject_page: (page) => dispatch(rejectPage(page)),
    draft_page: (page) => dispatch(draftPage(page))
  }
}

const mapStateToProps = (state) => {
  return {
    pages: state.pages,
    tabs: state.tabs,
    users: state.users
  }
}

class DisplayPage extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      data: { id: null, versionId: null, groupId: null, name: '', contents: '' },
      page: null,
      requestKey: null
    }
  }

  fetchPage(pageId) {
    let data = {}
    const { pages } = store.getState()
    const page = pages[pageId]
    if (page) {
      const { id, versionId, groupId, name, contents } = page
      data = { id, versionId, groupId, name, contents }
      if (this._isMounted) {
        this.setState({ data, page })
      }
    }
  }

  async componentDidMount() {
    this._isMounted = true
    this.extractPageName()
    if (!this.props?.location?.page) {
      let pageId = ''
      if (isDashboardRoute(this.props)) {
        pageId = this.props?.location?.pathname.split('/')[5]
      } else pageId = this.props?.location?.pathname.split('/')[4]
      this.fetchPage(pageId)
      store.subscribe(() => {
        this.fetchPage(pageId)
      })
    }
    if (this.props.pageId) {
      if (this._isMounted) {
        this.setState({ data: this.props.pages[this.props.pageId] })
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props?.location?.pathname !== prevProps?.location?.pathname) {
      this.extractPageName()
    }
    if (this.props.pageId && prevProps !== this.props) {
      if (this._isMounted) {
        this.setState({ data: this.props.pages[this.props.pageId] || { id: null, versionId: null, groupId: null, name: '', contents: '' } })
      }
    }
    // if (this.props.match.params.pageId !== prevProps.match.params.pageId) {
    //   this.fetchPageContent(this.props.match.params.pageId)
    // }
  }

  extractPageName() {
    if (!isDashboardRoute(this.props, true) && this.props.pages) {
      const pageName = this.props?.pages?.[this.props?.match?.params?.pageId]?.name
      if (pageName) this.props.fetch_entity_name(pageName)
      else this.props.fetch_entity_name()
    }
  }

  handleEdit(page) {
    this.props.history.push({
      pathname: `/orgs/${this.props?.match?.params.orgId}/dashboard/page/${this.props?.match?.params.pageId}/edit`,
      page: page
    })
  }

  checkPageRejected() {
    if (this.props.rejected) {
      return <div className='pageText doc-view mt-2'>{this.renderTiptapEditor(this.props.pageContent)}</div>
    } else {
      return (
        <div className='pt-3 px-1'> 
          {isOnPublishedPage() && <h2 className='page-header'>{this.props?.pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name}</h2>}
          <div className='pageText doc-view'>{this.renderTiptapEditor(this.props.pageContent === null ? '' : this.props.pageContent)}</div>
          <span className='mb-2 d-inline-block'>{isOnPublishedPage() ? this.renderPageUserData(true) : this.renderPageUserData(false)}</span>
        </div>
      )
    }
  }

  
renderPageUserData(isOnPublishedPage) {
  const { pages, currentPageId, users } = this.props;
  const updatedById = pages?.[currentPageId]?.updatedBy;  
  const lastModified = pages?.[currentPageId]?.updatedAt 
                       ? moment(pages[currentPageId].updatedAt).fromNow()
                       : null;

  const user = users?.users?.find(user => user.id === updatedById);

  if (isOnPublishedPage) {
      return (
          <div>
              {lastModified && <>Modified At <span>{lastModified}</span></>}
          </div>
      );
  } else {
      return (
          <div className='page-user-data mt-2'>
            {lastModified ? (
              <div>
                Updated by:<span> </span>
                {user?.name}
                <br />
                Modified At:<span> </span>
                {lastModified}
              </div>
            ) : (
              <span></span>
            )}
          </div>
      );
  }
}

  renderPageName() {
    const pageId = this.props?.match?.params.pageId
    if (!this.state.page && pageId) {
      this.fetchPage(pageId)
    }
    return isOnPublishedPage() ? (
      <>
      { this.state.data?.name && <h3 className='page-heading-pub'>{this.state.data?.name}</h3>}
      </>
    ) : (
      <EndpointBreadCrumb {...this.props} page={this.state.page} pageId={pageId} isEndpoint={false} />
    )
  }

  renderTiptapEditor(contents) {
    return <Tiptap onChange={() => { }} initial={contents} match={this.props.match} isInlineEditor disabled key={Math.random()} />
  }

  handleRemovePublicPage(page) {
    page.isPublished = false
    page.publishedEndpoint = {}
    page.state = 1
    page.position = null
    this.props.draft_page(page)
  }

  renderUnPublishPage(pageId, pages) {
    return (
      <UnPublishEntityButton
        // {...this.props}
        entity={pages}
        entityId={pageId}
        entityName='Page'
        open_unpublish_confirmation_modal={() => {
          if (this._isMounted) this.setState({ openUnPublishConfirmationModal: true })
        }}
      />
    )
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  renderPublishPage(pageId, pages) {
    const page = this.props.pages[pageId]
    return (
      <PublishEntityButton
        entity={page}
        entityId={pageId}
        open_publish_confirmation_modal={() => {
          if (this._isMounted) this.setState({ openPublishConfirmationModal: true })
        }}
        entityName='Page'
      />
    )
  }

  renderPublishPageOperations() {
    if (isDashboardRoute(this.props)) {
      let pages = { ...this.props.pages }
      const pageId = this.props?.match.params?.pageId
      pages = pages[pageId]
      const isPublicPage = pages?.isPublished

      const approvedOrRejected = isStateApproved(pageId, pages) || isStateReject(pageId, pages)
      return (
        <div>
          {isStatePending(pageId, pages) && isAdmin() && (
            <ApproveRejectEntity {...this.props} entity={pages} entityId={pageId} entityName='page' />
          )}
          {isAdmin() && !isStatePending(pageId, pages) && (
            <span>
              {' '}
              {approvedOrRejected ? this.renderInOverlay(this.renderPublishPage.bind(this), pageId) : this.renderPublishPage(pageId, pages)}
            </span>
          )}
          {isAdmin() && isPublicPage && (
            <span>
              {' '}
              {isStateApproved(pageId, pages)
                ? this.renderInOverlay(this.renderUnPublishPage.bind(this), pageId)
                : this.renderUnPublishPage(pageId, pages)}
            </span>
          )}
          {!isAdmin() && (
            <button
              className={'ml-2 ' + (isStateDraft(pageId, pages) ? 'btn btn-outline orange' : 'btn text-link')}
              type='button'
              onClick={() => (isStateDraft(pageId, pages) ? this.handlePublicPageState(pages[pageId]) : null)}
            >
              {getEntityState(pageId, pages)}
            </button>
          )}
          <button
            className='btn btn-primary btn-sm fs-4'
            onClick={() => {
              this.handleEdit(this.state.data)
            }}
          >
            Edit
          </button>
        </div>
      )
    }
  }

  renderInOverlay(method, pageId) {
    const pages = { ...this.props.pages }
    return (
      // <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>Nothing to publish</Tooltip>}>
      <span className='d-inline-block float-right'>{method(pageId, pages)}</span>
      // </OverlayTrigger>
    )
  }

  async handlePublicPageState(page) {
    if (isStateDraft(page.id, this.props.pages) || isStateReject(page.id, this.props.pages)) this.props.pending_page(page)
  }

  renderPublishConfirmationModal() {
    return (
      this.state.openPublishConfirmationModal && (
        <ConfirmationModal
          show={this.state.openPublishConfirmationModal}
          onHide={() => {
            if (this._isMounted) this.setState({ openPublishConfirmationModal: false })
          }}
          proceed_button_callback={this.handleApprovePageRequest.bind(this)}
          title={msgText.publishPage}
          submitButton='Publish'
          rejectButton='Discard'
        />
      )
    )
  }

  renderUnPublishConfirmationModal() {
    return (
      this.state.openUnPublishConfirmationModal && (
        <ConfirmationModal
          show={this.state.openUnPublishConfirmationModal}
          onHide={() => {
            if (this._isMounted) this.setState({ openUnPublishConfirmationModal: false })
          }}
          proceed_button_callback={this.handleDraftPageRequest.bind(this)}
          title={msgText.unpublishPage}
          submitButton='UnPublish'
          rejectButton='Discard'
        />
      )
    )
  }

  async handleApprovePageRequest() {
    const pageId = this.props?.match?.params?.pageId

    // Check if the component is still mounted before updating the state
    if (this._isMounted) {
      this.setState({ publishLoader: true })
    }

    try {
      await this.props.approve_page(this.props.pages[pageId], () => {
        // Callback after approval
        // Check if the component is still mounted before updating the state
        if (this._isMounted) {
          this.setState({ publishLoader: false })
        }
      })
    } catch (error) {
      // Handle errors if necessary
      console.error('Error during approve_page:', error)
    }
  }

  async handleDraftPageRequest() {
    const pageId = this.props?.match?.params?.pageId
    if (this._isMounted) {
      this.setState({ publishLoader: true })
    }

    try {
      this.handleRemovePublicPage(this.props.pages[pageId], () => {
        if (this._isMounted) {
          this.setState({ publishLoader: false })
        }
      })
    } catch (error) {
      console.error('Error during draft_page:', error)
    }
  }

  render() {
    if (this.props?.pageContentLoading) {
      return (
        <>
        <div className="container-loading p-4">
                {!isOnPublishedPage() && (
                <>
                <div className="d-flex justify-content-end gap-5 mb-5 1806">
                <div className="edit bg rounded-1 ms-5"></div>
                  <div className="unpublish bg rounded-1 ms-5"></div>
                <div className="publish bg rounded-1 ms-5"></div>
            </div>
                </>
                )}
            <div className="page bg rounded-1"></div>
          <div className="details d-flex flex-column justify-content-between align-items-center mt-5">
            <div className="page-box bg"></div>
            <div className="page-footer text-center bg"></div>

          </div>
        </div>
        </>
      )
    }
    return (
      <div className='custom-display-page'>
        {this.renderPublishConfirmationModal()}
        {this.renderUnPublishConfirmationModal()}
        {this.renderPublishPageOperations()}
        {this.renderPageName()}
        {this.checkPageRejected()}
        <ApiDocReview {...this.props} />
        {isOnPublishedPage() && <Footer />}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withQuery(DisplayPage))
