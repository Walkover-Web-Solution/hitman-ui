import React, { Component } from 'react'
import { store } from '../../store/store'
import { connect } from 'react-redux'
import { isDashboardRoute, isStateDraft, isStateReject, msgText, isStatePending, isStateApproved, getEntityState } from '../common/utility'
import './page.scss'
import { updatePage } from './redux/pagesActions'
import EndpointBreadCrumb from '../endpoints/endpointBreadCrumb'
import ApiDocReview from '../apiDocReview/apiDocReview'
import { isAdmin } from '../auth/authServiceV2'
import { approvePage, pendingPage, rejectPage } from '../publicEndpoint/redux/publicEndpointsActions'
import ConfirmationModal from '../common/confirmationModal'
import { ApproveRejectEntity, PublishEntityButton, UnPublishEntityButton } from '../common/docViewOperations'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Tiptap from '../tiptapEditor/tiptap'
import { getPageContent } from '../../services/pageServices'
import { useQuery } from 'react-query'

const withQuery = (WrappedComponent) => {
  return (props) => {
    const { data, error } = useQuery(
      ['pageContent', props.match.params.pageId],
      () => getPageContent(props.match.params.orgId, props.match.params.pageId),
      {
        refetchOnWindowFocus: false,
        cacheTime: 5000000,
        enabled: true,
        staleTime: 600000
      }
    )
    return <WrappedComponent {...props} pageContent={data} pageContentError={error} />
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (editedPage, pageId) => dispatch(updatePage(ownProps.history, editedPage, pageId)),
    approve_page: (page, publishPageLoaderHandler) => dispatch(approvePage(page, publishPageLoaderHandler)),
    pending_page: (page) => dispatch(pendingPage(page)),
    reject_page: (page) => dispatch(rejectPage(page))
  }
}

const mapStateToProps = (state) => {
  return {
    pages: state.pages
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
    if (!this.props.location.page) {
      let pageId = ''
      if (isDashboardRoute(this.props)) {
        pageId = this.props.location.pathname.split('/')[5]
      } else pageId = this.props.location.pathname.split('/')[4]
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
    if (this.props.location.pathname !== prevProps.location.pathname) {
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
      const pageName = this.props.pages[this.props.match.params.pageId]?.name
      if (pageName) this.props.fetch_entity_name(pageName)
      else this.props.fetch_entity_name()
    }
  }

  handleEdit(page) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${this.props.match.params.pageId}/edit`,
      page: page
    })
  }

  checkPageRejected() {
    if (this.props.rejected) {
      return <div className='pageText doc-view mt-2'>{this.renderTiptapEditor(this.props.pageContent)}</div>
    } else {
      return (
        <div className='pageText doc-view'>{this.renderTiptapEditor(this.props.pageContent === null ? '' : this.props.pageContent)}</div>
      )
    }
  }

  renderPageName() {
    const pageId = this.props?.match?.params.pageId
    if (!this.state.page && pageId) {
      this.fetchPage(pageId)
    }
    return !isDashboardRoute(this.props, true) ? (
      <h3 className='page-heading-pub'>{this.state.data?.name || ''}</h3>
    ) : (
      <EndpointBreadCrumb {...this.props} page={this.state.page} pageId={pageId} isEndpoint={false} />
    )
  }

  renderTiptapEditor(contents) {
    return <Tiptap onChange={() => {}} initial={contents} match={this.props.match} isInlineEditor disabled key={Math.random()} />
  }

  handleRemovePublicPage(pageId) {
    const page = { ...this.props.pages[pageId] }
    page.isPublished = false
    page.publishedEndpoint = {}
    page.state = 'Draft'
    page.position = null
    this.props.update_page(page)
  }

  renderUnPublishPage(pageId, pages) {
    return (
      <UnPublishEntityButton
        {...this.props}
        entity={pages}
        entityId={pageId}
        entityName='Page'
        onUnpublish={() => this.handleRemovePublicPage(pageId)}
      />
    )
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  renderPublishPage(pageId, pages) {
    return (
      <PublishEntityButton
        entity={pages}
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
      const pages = { ...this.props.pages }
      const pageId = this.props.match.params?.pageId
      const isPublicPage = pages[pageId]?.isPublished
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
            className='btn btn-secondary outline ml-2 orange'
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
      <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>Nothing to publish</Tooltip>}>
        <span className='d-inline-block float-right'>{method(pageId, pages)}</span>
      </OverlayTrigger>
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

  async handleApprovePageRequest() {
    const pageId = this.props.match.params?.pageId

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

  render() {
    return (
      <div className='custom-display-page'>
        {this.renderPublishConfirmationModal()}
        {this.renderPublishPageOperations()}
        {this.renderPageName()}
        {this.checkPageRejected()}
        <div>
          <ApiDocReview {...this.props} />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withQuery(DisplayPage))
