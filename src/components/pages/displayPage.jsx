import React, { Component } from 'react'
import store from '../../store/store'
import { connect } from 'react-redux'
import { isDashboardRoute, isStateDraft, isStateReject, msgText, isStatePending, isStateApproved, getEntityState } from '../common/utility'
import './page.scss'
import { updatePage } from './redux/pagesActions'
import EndpointBreadCrumb from '../endpoints/endpointBreadCrumb'
import ApiDocReview from '../apiDocReview/apiDocReview'
import TinyEditor from '../tinyEditor/tinyEditor'
import { isAdmin } from '../auth/authService'
import { approvePage, pendingPage, rejectPage } from '../publicEndpoint/redux/publicEndpointsActions'
import ConfirmationModal from '../common/confirmationModal'
import { ApproveRejectEntity, PublishEntityButton } from '../common/docViewOperations'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

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
  constructor (props) {
    super(props)
    this.state = {
      data: { id: null, versionId: null, groupId: null, name: '', contents: '' },
      page: null,
      requestKey: null
    }
  }

  fetchPage (pageId) {
    let data = {}
    const { pages } = store.getState()
    const page = pages[pageId]
    if (page) {
      const { id, versionId, groupId, name, contents } = page
      data = { id, versionId, groupId, name, contents }
      this.setState({ data, page })
    }
  }

  async componentDidMount () {
    this.extractPageName()
    if (!this.props.location.page) {
      let pageId = ''
      if (isDashboardRoute(this.props)) { pageId = this.props.location.pathname.split('/')[5] } else pageId = this.props.location.pathname.split('/')[4]
      this.fetchPage(pageId)
      store.subscribe(() => {
        this.fetchPage(pageId)
      })
    }
    if (this.props.pageId) {
      this.setState({ data: this.props.pages[this.props.pageId] })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.extractPageName()
    }
    if (this.props.pageId && prevProps !== this.props) {
      this.setState({ data: this.props.pages[this.props.pageId] || { id: null, versionId: null, groupId: null, name: '', contents: '' } })
    }
    if (this.props.match.params.pageId !== prevProps.match.params.pageId) {
      this.fetchPage(this.props.match.params.pageId)
    }
  }

  extractPageName () {
    if (!isDashboardRoute(this.props, true) && this.props.pages) {
      const pageName = this.props.pages[this.props.match.params.pageId]?.name
      if (pageName) this.props.fetch_entity_name(pageName)
      else this.props.fetch_entity_name()
    }
  }

  handleEdit (page) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${page.id}/edit`,
      page: page
    })
  }

  checkPageRejected () {
    if (this.props.rejected) {
      return (
        <div className='pageText doc-view'>
          {this.renderTinyEditor(this.props.pages[this.props.pageId].publishedPage.contents)}
        </div>
      )
    } else {
      return (
        <div className='pageText doc-view'>
          {this.renderTinyEditor(this.state.data.contents)}
        </div>
      )
    }
  }

  renderPageName () {
    const pageId = this.props?.match?.params.pageId
    if (!this.state.page && pageId) {
      this.fetchPage(pageId)
    }
    return (
      !isDashboardRoute(this.props, true)
        ? <h3 className='page-heading-pub'>{this.state.data?.name || ''}</h3>
        : <EndpointBreadCrumb
            {...this.props}
            page={this.state.page}
            pageId={this.state.data.id}
            isEndpoint={false}
          />

    )
  }

  renderTinyEditor (contents) {
    return (
      <TinyEditor
        onChange={() => {}}
        data={contents}
        match={this.props.match}
        isInlineEditor
        disabled
      />
    )
  }

  renderPublishPageOperations () {
    if (isDashboardRoute(this.props)) {
      const pages = { ...this.props.pages }
      const pageId = this.props.match.params?.pageId
      const approvedOrRejected = isStateApproved(pageId, pages) || isStateReject(pageId, pages)
      return (
        <div>
          {isStatePending(pageId, pages) && isAdmin() &&
            <ApproveRejectEntity
              {...this.props}
              entity={pages}
              entityId={pageId}
              entityName='page'
            />}
          {(isAdmin() && !isStatePending(pageId, pages)) && <span> {approvedOrRejected ? this.renderInOverlay(this.renderPublishPage.bind(this), pageId) : this.renderPublishPage(pageId, pages)}</span>}
          {!isAdmin() &&
            <button
              className={'ml-2 ' + (isStateDraft(pageId, pages) ? 'btn btn-outline orange' : 'btn text-link')}
              type='button'
              onClick={() => isStateDraft(pageId, pages) ? this.handlePublicPageState(pages[pageId]) : null}
            >
              {getEntityState(pageId, pages)}
            </button>}
          <button
            className='ml-2 btn btn-outline orange'
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

  renderInOverlay (method, pageId) {
    const pages = { ...this.props.pages }
    return (
      <OverlayTrigger overlay={<Tooltip id='tooltip-disabled'>Nothing to publish</Tooltip>}>
        <span className='d-inline-block float-right'>
          {method(pageId, pages)}
        </span>
      </OverlayTrigger>
    )
  }

  renderPublishPage (pageId, pages) {
    return (
      <PublishEntityButton
        entity={pages}
        entityId={pageId}
        open_publish_confirmation_modal={() => this.setState({ openPublishConfirmationModal: true })}
        entityName='Page'
      />
    )
  }

  async handlePublicPageState (page) {
    if (isStateDraft(page.id, this.props.pages) || isStateReject(page.id, this.props.pages)) this.props.pending_page(page)
  }

  renderPublishConfirmationModal () {
    return this.state.openPublishConfirmationModal &&
      <ConfirmationModal
        show={this.state.openPublishConfirmationModal}
        onHide={() => this.setState({ openPublishConfirmationModal: false })}
        proceed_button_callback={this.handleApprovePageRequest.bind(this)}
        title={msgText.publishPage}
        submitButton='Publish'
        rejectButton='Discard'
      />
  }

  async handleApprovePageRequest () {
    const pageId = this.props.match.params?.pageId
    this.setState({ publishLoader: true })
    this.props.approve_page(this.props.pages[pageId], () => { this.setState({ publishLoader: false }) })
  }

  render () {
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

export default connect(mapStateToProps, mapDispatchToProps)(DisplayPage)
