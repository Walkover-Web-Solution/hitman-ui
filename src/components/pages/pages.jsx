import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import { connect } from 'react-redux'
import {
  approvePage,
  draftPage,
  pendingPage,
  rejectPage
} from '../publicEndpoint/redux/publicEndpointsActions'
import './page.scss'
import tabStatusTypes from '../tabs/tabStatusTypes'
import tabService from '../tabs/tabService'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'

const pagesEnum = {
  PENDING_STATE: 'Pending',
  REJECT_STATE: 'Reject',
  APPROVED_STATE: 'Approved',
  DRAFT_STATE: 'Draft'
}

const mapStateToProps = (state) => {
  return {
    tabs: state.tabs
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    pending_page: (page) => dispatch(pendingPage(page)),
    approve_page: (page) => dispatch(approvePage(page)),
    draft_page: (page) => dispatch(draftPage(page)),
    reject_page: (page) => dispatch(rejectPage(page)),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab))
  }
}

class Pages extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  handleDisplay (page, collectionId, previewMode) {
    if (isDashboardRoute(this.props, true)) {
      if (!this.props.tabs.tabs[page.id]) {
        const previewTabId = Object.keys(this.props.tabs.tabs).filter(
          (tabId) => this.props.tabs.tabs[tabId].previewMode === true
        )[0]
        if (previewTabId) this.props.close_tab(previewTabId)
        this.props.open_in_new_tab({
          id: page.id,
          type: 'page',
          status: tabStatusTypes.SAVED,
          previewMode,
          isModified: false
        })
      } else if (
        this.props.tabs.tabs[page.id].previewMode === true &&
        previewMode === false
      ) {
        tabService.disablePreviewMode(page.id)
      }

      this.props.history.push({
        pathname: `/dashboard/page/${page.id}`,
        page: page
      })
    } else {
      this.props.history.push({
        pathname: `/p/${collectionId}/pages/${page.id}/${this.props.collections[collectionId].name}`,
        page: page
      })
    }
  }

  handleDuplicate (page) {
    this.props.duplicate_page(page)
  }

  async handlePublicPageState (page) {
    if (this.isStateDraft(page.id) || this.isStateReject(page.id)) {
      this.props.pending_page(page)
    }
  }

  async handleCancelRequest (page) {
    this.props.draft_page(page)
  }

  async handleApproveRequest (page) {
    this.props.approve_page(page)
  }

  async handleRejectRequest (page) {
    this.props.reject_page(page)
  }

  displayPageName (pageId) {
    return (
      <div className='sidebar-accordion-item'>
        <i className='uil uil-file-alt' aria-hidden='true' />
        {this.props.pages[pageId].name}
      </div>
    )
  }

  displayDeleteOpt (pageId) {
    return (
      <a
        className='dropdown-item'
        onClick={() => {
          this.props.open_delete_page_modal(pageId)
        }}
      >
        Delete
      </a>
    )
  }

  displayDuplicateOpt (pageId) {
    return (
      <a
        className='dropdown-item'
        onClick={() =>
          this.handleDuplicate(this.props.pages[pageId])}
      >
        Duplicate
      </a>
    )
  }

  displayMakePublicOpt (pageId) {
    return (
      <a
        className='dropdown-item'
        onClick={() =>
          this.handlePublicPageState(
            this.props.pages[pageId]
          )}
      >
        Make Public
      </a>
    )
  }

  displayCancelRequestOpt (pageId) {
    return (
      <a
        className='dropdown-item'
        onClick={() =>
          this.handleCancelRequest(
            this.props.pages[pageId]
          )}
      >
        Cancel Request
      </a>
    )
  }

  displayApproveOpt () {
    return (
      <a className='dropdown-item' disabled>
        Approved
      </a>
    )
  }

  isStateApproved (pageId) {
    return this.props.pages[pageId].state === pagesEnum.APPROVED_STATE
  }

  isStatePending (pageId) {
    return this.props.pages[pageId].state === pagesEnum.PENDING_STATE
  }

  isStateDraft (pageId) {
    return this.props.pages[pageId].state === pagesEnum.DRAFT_STATE
  }

  isStateReject (pageId) {
    return this.props.pages[pageId].state === pagesEnum.REJECT_STATE
  }

  displayOtherOpt (pageId) {
    return (
      <>
        {
          this.isStateDraft(pageId) || this.isStateReject(pageId)
            ? this.displayMakePublicOpt(pageId)
            : null
        }
        {
          this.isStateApproved(pageId)
            ? this.displayApproveOpt()
            : null
        }

        {
          this.isStatePending(pageId)
            ? this.displayCancelRequestOpt(pageId)
            : null
        }
      </>
    )
  }

  displayPageOptions (pageId) {
    return (
      <div className='sidebar-item-action'>
        <div
          className='sidebar-item-action-btn'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
          onClick={(event) => event.stopPropagation()}
        >
          <i className='uil uil-ellipsis-v' />
        </div>
        <div className='dropdown-menu dropdown-menu-right'>
          {this.displayDeleteOpt(pageId)}
          {this.displayDuplicateOpt(pageId)}
          {
              this.props.pages[pageId]?.isPublished
                ? this.displayApproveOpt()
                : this.displayOtherOpt(pageId)
          }
        </div>
      </div>
    )
  }

  displayUserPages (pageId) {
    return (
      <div
        className='sidebar-accordion'
        id='accordion'
        key={this.props.index}
      >
        <button
          draggable
          onDragStart={(e) => this.props.onDragStart(e, pageId)}
          onDragOver={(e) => {
            e.preventDefault()
          }}
          onDrop={(e) => this.props.onDrop(e, pageId)}
          data-toggle='collapse'
          data-target={`#${pageId}`}
          aria-expanded='true'
          aria-controls={pageId}
          onClick={() => {
            const page = this.props.pages[pageId]
            this.handleDisplay(page, this.props.collection_id, true)
          }}
          onDoubleClick={() => {
            const page = this.props.pages[pageId]
            this.handleDisplay(page, this.props.collection_id, false)
          }}
        >
          {this.displayPageName(pageId)}
          {this.displayPageOptions(pageId)}
        </button>
      </div>
    )
  }

  displayPublicPages (pageId) {
    return (
      <div
        className='hm-sidebar-item'
        onClick={() => {
          const page = this.props.pages[pageId]
          this.handleDisplay(page, this.props.collection_id, true)
        }}
        onDoubleClick={() => {
          const page = this.props.pages[pageId]
          this.handleDisplay(page, this.props.collection_id, false)
        }}
      >
        <i className='uil uil-file-alt' aria-hidden='true' />
        {this.props.pages[pageId].name}
      </div>
    )
  }

  render () {
    const pageId = this.props.page_id
    return (
      <>
        {
          isDashboardRoute(this.props, true)
            ? this.displayUserPages(pageId)
            : this.displayPublicPages(pageId)
        }
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pages)
