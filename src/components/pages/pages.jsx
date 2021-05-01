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

import PageIcon from '../../assets/icons/page-icon.svg'
import GlobeIcon from '../../assets/icons/globe-icon.svg'

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
    this.state = {
      theme: ''
    }
  }

  componentDidMount () {
    if (this.props.theme) {
      this.setState({ theme: this.props.theme })
    }
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
      <div className='sidebar-accordion-item page-name-icon-container text-truncate'>
        <img src={PageIcon} alt='page-icon' className='page-icon' />
        {this.props.pages[pageId].name}
      </div>
    )
  }

  displayDeleteOpt (pageId) {
    return (
      <div
        className='dropdown-item'
        onClick={() => {
          this.props.open_delete_page_modal(pageId)
        }}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M7.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M10.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg>
        Delete
      </div>
    )
  }

  displayDuplicateOpt (pageId) {
    return (
      <div
        className='dropdown-item'
        onClick={() =>
          this.handleDuplicate(this.props.pages[pageId])}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg>
        Duplicate
      </div>
    )
  }

  displayMakePublicOpt (pageId) {
    return (
      <div
        className='dropdown-item'
        id = 'make_public_btn'
        onClick={() =>
          this.handlePublicPageState(
            this.props.pages[pageId]
          )}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM8.25 14.9475C5.2875 14.58 3 12.06 3 9C3 8.535 3.06 8.0925 3.1575 7.6575L6.75 11.25V12C6.75 12.825 7.425 13.5 8.25 13.5V14.9475ZM13.425 13.0425C13.23 12.435 12.675 12 12 12H11.25V9.75C11.25 9.3375 10.9125 9 10.5 9H6V7.5H7.5C7.9125 7.5 8.25 7.1625 8.25 6.75V5.25H9.75C10.575 5.25 11.25 4.575 11.25 3.75V3.4425C13.4475 4.335 15 6.4875 15 9C15 10.56 14.4 11.9775 13.425 13.0425Z' fill='#E98A36' />
        </svg>
        Make Public
      </div>
    )
  }

  displayCancelRequestOpt (pageId) {
    return (
      <div
        className='dropdown-item'
        onClick={() =>
          this.handleCancelRequest(
            this.props.pages[pageId]
          )}
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M15.2222 1H2.77778C1.79594 1 1 1.79594 1 2.77778V15.2222C1 16.2041 1.79594 17 2.77778 17H15.2222C16.2041 17 17 16.2041 17 15.2222V2.77778C17 1.79594 16.2041 1 15.2222 1Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M6 6L12 12' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M12 6L6 12' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg>
        Cancel Request
      </div>
    )
  }

  displayApproveOpt () {
    return (
      <div className='dropdown-item' disabled>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M15.2222 1H2.77778C1.79594 1 1 1.79594 1 2.77778V15.2222C1 16.2041 1.79594 17 2.77778 17H15.2222C16.2041 17 17 16.2041 17 15.2222V2.77778C17 1.79594 16.2041 1 15.2222 1Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M5.44444 9.37305L7.4364 11.2339' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M12.268 6.63057L7.58466 11.3713' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
        </svg> Approved
      </div>
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
    const idToCheck = this.props.location.pathname.split('/')[2] === 'page' ? this.props.location.pathname.split('/')[3] : null
    return (
      <div
        className={idToCheck === pageId ? 'sidebar-accordion pagesWrapper active' : 'sidebar-accordion pagesWrapper'}
        id='accordion'
        key={this.props.index}
      >
        <button
          // draggable
          // onDragStart={(e) => this.props.onDragStart(e, pageId)}
          // onDragOver={(e) => {
          //   e.preventDefault()
          // }}
          // onDrop={(e) => this.props.onDrop(e, pageId)}
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
          <div className='d-flex align-items-center'>
            <div className='mr-2'>
              {this.props.pages[pageId].isPublished && <img src={GlobeIcon} alt='globe' />}
            </div>
            {!this.props.collections[this.props.collection_id]?.importedFromMarketPlace && this.displayPageOptions(pageId)}
          </div>
        </button>
      </div>
    )
  }

  displayPublicPages (pageId) {
    const idToCheck = this.props.location.pathname.split('/')[3] === 'pages' ? this.props.location.pathname.split('/')[4] : null
    return (
      <div
        className={idToCheck === pageId ? 'hm-sidebar-item active' : 'hm-sidebar-item'}
        onClick={() => {
          const page = this.props.pages[pageId]
          this.handleDisplay(page, this.props.collection_id, true)
        }}
        onDoubleClick={() => {
          const page = this.props.pages[pageId]
          this.handleDisplay(page, this.props.collection_id, false)
        }}
      >
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
