import React, { Component } from 'react'
import { store } from '../../store/store'
import { connect } from 'react-redux'
import * as _ from 'lodash'
import { toast } from 'react-toastify'
import MenuBar from '../tiptapEditor/menubar'
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
import { updateContent, updatePage } from './redux/pagesActions'
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
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { SESSION_STORAGE_KEY } from '../common/utility'
import Footer from '../main/Footer'
import moment from 'moment'
import tabService from '../tabs/tabService'
import WarningModal from '../common/warningModal'
import { updateTab } from '../tabs/redux/tabsActions'

const withQuery = (WrappedComponent) => {
  return (props) => {
    let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    const queryClient = useQueryClient()
    const pageId = !isOnPublishedPage() ? props?.match?.params?.pageId : currentIdToShow
    let { data, error, isLoading } = useQuery(['pageContent', pageId], async () => {
      return isOnPublishedPage()
        ? await getPublishedContentByIdAndType(currentIdToShow, props?.pages?.[currentIdToShow]?.type)
        : await getPageContent(props?.match?.params?.orgId, pageId)
    })
    const mutation = useMutation(updateContent, {
      onSuccess: (data) => {
        queryClient.setQueryData(['pageContent', pageId], data?.contents || '', {
          refetchOnWindowFocus: false,
          cacheTime: 5000000,
          enabled: true,
          staleTime: 600000
        })
      }
    })
    const tabId = props?.tabs?.tabs?.[pageId]
    if (tabId?.isModified && tabId?.type == 'page' && tabId?.draft) {
      data = tabId?.draft
    }
    return (
      <WrappedComponent
        {...props}
        pageContent={data}
        currentPageId={pageId}
        pageContentLoading={data?.isLoading}
        pageContentError={error}
        mutationFn={mutation}
      />
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (editedPage, pageId) => dispatch(updatePage(ownProps.history, editedPage, pageId)),
    approve_page: (page, publishPageLoaderHandler) => dispatch(approvePage(page, publishPageLoaderHandler)),
    pending_page: (page) => dispatch(pendingPage(page)),
    reject_page: (page) => dispatch(rejectPage(page)),
    draft_page: (page) => dispatch(draftPage(page)),
    update_tab: (id, data) => dispatch(updateTab(id, data))
  }
}

const mapStateToProps = (state) => {
  return {
    pages: state.pages,
    tabs: state.tabs
  }
}

class DisplayPage extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      data: { id: null, versionId: null, groupId: null, name: '', contents: '' },
      page: null,
      requestKey: null,
      showEditor: false
    }
    this.name = React.createRef()
    this.contents = React.createRef()
  }

  async fetchPage(pageId) {
    let data = {}
    const { pages } = store.getState()
    const page = pages[pageId]
    if (page) {
      const { id, versionId, groupId, name, contents, isPublished, state } = page
      data = { id, versionId, groupId, name, contents, isPublished, state }
      let updatedData = _.cloneDeep(data)
      updatedData.contents = this.props?.data

      this.setState({ data: updatedData, originalData: data, draftDataSet: true })
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
    // document.body.addEventListener('click', this.handleClickOutside)
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
    this.setPageData()
    const { save_page_flag: prevSavePageFlag } = prevProps
    const { save_page_flag: savePageFlag, tab, handle_save_page: handleSavePage } = this.props
    if (savePageFlag !== prevSavePageFlag) {
      if (savePageFlag) {
        this.handleSubmit()
        handleSavePage(false, tab.id)
      }
    }
  }
  componentWillUnmount() {
    // document.body.removeEventListener('click', this.handleClickOutside)
    this._isMounted = false
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.showEditor !== nextState.showEditor || this.props.pageContent !== nextProps.pageContent) {
      return true
    }
    return false
  }

  async setPageData() {
    const {
      tab,
      pages,
      match: {
        params: { pageId }
      }
    } = this.props
    const { draftDataSet } = this.state

    if (tab && pageId) {
      if (tab.isModified && !draftDataSet) {
        let data = this.state.data
        data.contents = this.props.pageContent
        this.setState({ ...tab.state, draftDataSet: true, data: data })
      } else if (pageId !== 'new' && pages[tab.id] && !this.state.originalData?.id) {
        await this.fetchPage(tab.id)
      }
    }
  }

  // handleClickOutside = (event) => {
  //   if (this.editorRef && !this.editorRef.contains(event.target)) {
  //     this.setState({ showEditor: false })
  //   }
  // }

  extractPageName() {
    if (!isDashboardRoute(this.props, true) && this.props.pages) {
      const pageName = this.props?.pages?.[this.props?.match?.params?.pageId]?.name
      if (pageName) this.props.fetch_entity_name(pageName)
      else this.props.fetch_entity_name()
    }
  }

  checkPageRejected(index) {
    if (this.props.rejected) {
      return <div className='pageText doc-view mt-2'>{this.renderTiptapEditor(this.props.pageContent)}</div>
    } else {
      return (
        <div
          className='pt-3 px-1'
          ref={(node) => {
            this.editorRef = node
          }}
        >
          {isOnPublishedPage() && (
            <h2 className='page-header'>{this.props?.pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name}</h2>
          )}
          {!isOnPublishedPage() && this.state.showEditor ? (
            <div className='pageText doc-view'>
              {this.renderEditor(this.props.pageContent === null ? '' : this.props.pageContent, index)}
            </div>
          ) : (
            <div
              className='pageText doc-view'
              onClick={() => {
                this.setState({ showEditor: true })
              }}
            >
              {this.renderTiptapEditor(this.props.pageContent === null ? '' : this.props.pageContent)}
            </div>
          )}
          {isOnPublishedPage() && (
            <div className='pageText doc-view'>
              {this.renderTiptapEditor(this.props.pageContent === null ? '' : this.props.pageContent)}
            </div>
          )}
          <span>
            {isOnPublishedPage() &&
              this.props?.pages?.[this.props?.currentPageId]?.updatedAt &&
              `Modified at ${moment(this.props?.pages?.[this.props?.currentPageId]?.updatedAt).fromNow()}`}
          </span>
        </div>
      )
    }
  }
  isModified() {
    let tabId = this.props.tab.id
    return this.props.tabs[tabId]?.activeTabId
  }
  handleSubmit = (e) => {
    e.preventDefault()
    const editedPage = { ...this.state.data }
    if (editedPage.contents !== this.props.pageContent) {
      editedPage.contents = this.props.pageContent
    }

    if (editedPage.name.trim() === '') {
      toast.error('Page name cannot be empty.')
      return
    }
    delete editedPage['isPublished']
    this.props.mutationFn.mutate({ pageData: editedPage, id: editedPage.id })
    this.setState({ data: editedPage, showEditor: false }, () => {
      tabService.markTabAsSaved(this.props.tab.id)
      tabService.updateDraftData(editedPage.id, editedPage.contents)
    })
  }

  renderPageName() {
    const pageId = this.props?.match?.params.pageId
    if (!this.state.page && pageId) {
      this.fetchPage(pageId)
    }
    return isOnPublishedPage() ? (
      <>{this.state.data?.name && <h3 className='page-heading-pub'>{this.state.data?.name}</h3>}</>
    ) : (
      <EndpointBreadCrumb {...this.props} page={this.state.page} pageId={pageId} isEndpoint={false} />
    )
  }

  renderTiptapEditor(contents) {
    return <Tiptap onChange={() => {}} initial={contents} match={this.props.match} isInlineEditor disabled key={Math.random()} />
  }
  renderEditor(contents, index) {
    return (
      <Tiptap
        onChange={this.handleChange}
        initial={contents}
        match={this.props.match}
        isInlineEditor={false}
        disabled={false}
        minHeight
        key={index}
      />
    )
  }
  handleChange = (value) => {
    const data = { ...this.state.data }
    data.contents = value
    let tabId = this.props.tab.id

    this.setState({ data }, () => {
      if (!this.props.tabs[tabId]?.activeTabId) {
        tabService.markTabAsModified(this.props.tab.id)
      }
      this.updateTabDraftData(value)
    })
  }
  handleCancel() {
    const pageId = this.props.match.params.pageId
    if (pageId) {
      // Redirect to displayPage Route Component
      tabService.unmarkTabAsModified(this.props.tab.id)
      this.setState({ showEditor: false })
    }
  }
  updateTabDraftData(value) {
    if (this.props.tab.id === this.props.tabs.activeTabId) {
      clearTimeout(this.saveTimeOut)
      this.saveTimeOut = setTimeout(() => {
        tabService.updateDraftData(this.props.tab.id, _.cloneDeep(value))
      }, 1000)
    }
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
          <button onClick={this.handleSubmit} className='btn btn-primary btn-sm fs-4 '>
            Save
          </button>
        </div>
      )
    }
  }

  setUnsavedTabDataInIDB() {
    if (this.props.tab.id === this.props.tabs.activeTabId) {
      clearTimeout(this.saveTimeOut)
      this.saveTimeOut = setTimeout(() => {
        this.props.update_tab(this.props.tab.id, { state: _.cloneDeep(this.state) })
      }, 1000)
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
          <div className='container-loading p-4'>
            {!isOnPublishedPage() && (
              <>
                <div className='d-flex justify-content-end gap-5 mb-5 1806'>
                  <div className='edit bg rounded-1 ms-5'></div>
                  <div className='unpublish bg rounded-1 ms-5'></div>
                  <div className='publish bg rounded-1 ms-5'></div>
                </div>
              </>
            )}
            <div className='page bg rounded-1'></div>
            <div className='details d-flex flex-column justify-content-between align-items-center mt-5'>
              <div className='page-box bg'></div>
              <div className='page-footer text-center bg'></div>
            </div>
          </div>
        </>
      )
    }
    return (
      <div className='custom-display-page'>
        <WarningModal
          show={this.state.warningModalFlag}
          onHide={() => {
            this.setState({ warningModalFlag: false })
          }}
          ignoreButtonCallback={() => {
            this.handleCancel()
          }}
          message='Your unsaved changes will be lost.'
        />
        {this.renderPublishConfirmationModal()}
        {this.renderUnPublishConfirmationModal()}
        {this.renderPublishPageOperations()}
        {this.renderPageName()}
        {this.checkPageRejected()}
        {isOnPublishedPage() && <Footer />}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withQuery(DisplayPage))
