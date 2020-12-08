import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  approvePage,
  draftPage,
  pendingPage,
  rejectPage
} from '../publicEndpoint/redux/publicEndpointsActions'
import Pages from './pages'
import {
  deletePage,
  duplicatePage,
  updatePageOrder
} from './redux/pagesActions'
import pageService from './pageService'
import { isDashboardRoute } from '../common/utility'
import filterService from '../../services/filterService'

const mapStateToProps = (state) => {
  return {
    pages: state.pages
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    set_page_ids: (pageIds) => dispatch(updatePageOrder(pageIds)),
    delete_page: (page) => dispatch(deletePage(page)),
    duplicate_page: (page) => dispatch(duplicatePage(page)),
    pending_page: (page) => dispatch(pendingPage(page)),
    approve_page: (page) => dispatch(approvePage(page)),
    draft_page: (page) => dispatch(draftPage(page)),
    reject_page: (page) => dispatch(rejectPage(page))
  }
}

class GroupPages extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  handleUpdate (page) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.versionId}/pages/${page.id}/edit`,
      editPage: page
    })
  }

  openDeletePageModal (pageId) {
    this.setState({
      showDeleteModal: true,
      selectedPage: {
        ...this.props.pages[pageId]
      }
    })
  }

  closeDeletePageModal () {
    this.setState({ showDeleteModal: false })
  }

  filterGroupPages () {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== '' &&
      this.filterFlag === false
    ) {
      this.filterFlag = true
      let groupIds = []
      let groupIdsAndFilteredPages = []
      groupIdsAndFilteredPages = filterService.filter(
        this.props.pages,
        this.props.filter,
        'groupPages'
      )
      this.filteredGroupPages = groupIdsAndFilteredPages[0]
      groupIds = groupIdsAndFilteredPages[1]
      this.setState({ filter: this.props.filter })
      if (groupIds.length !== 0) {
        this.props.show_filter_groups(groupIds, 'pages')
      } else {
        this.props.show_filter_groups(null, 'pages')
      }
    }
  }

  onDragStart = (e, gId) => {
    this.draggedItem = gId
  };

  onDrop (e, destinationPageId) {
    e.preventDefault()

    if (!this.draggedItem) {
      //
    } else {
      if (this.draggedItem === destinationPageId) {
        this.draggedItem = null
        return
      }
      const pages = this.extractPages()
      const positionWisePages = this.makePositionWisePages({ ...pages })
      const index = positionWisePages.findIndex(
        (pId) => pId === destinationPageId
      )
      const pageIds = positionWisePages.filter(
        (item) => item !== this.draggedItem
      )
      pageIds.splice(index, 0, this.draggedItem)

      this.props.set_page_ids(pageIds, this.props.group_id)
      this.draggedItem = null
    }
  }

  extractPages () {
    const pages = {}
    for (let i = 0; i < Object.keys(this.props.pages).length; i++) {
      if (
        this.props.pages[Object.keys(this.props.pages)[i]].groupId &&
        this.props.pages[Object.keys(this.props.pages)[i]].groupId ===
        this.props.group_id
      ) {
        pages[Object.keys(this.props.pages)[i]] = this.props.pages[
          Object.keys(this.props.pages)[i]
        ]
      }
    }

    return pages
  }

  makePositionWisePages (pages) {
    const positionWisePages = []
    for (let i = 0; i < Object.keys(pages).length; i++) {
      positionWisePages[pages[Object.keys(pages)[i]].position] = Object.keys(
        pages
      )[i]
    }
    return positionWisePages
  }

  render () {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false
    }
    if (!this.props.filter || this.props.filter === '') {
      this.filteredGroupPages = { ...this.props.pages }
    }
    const groupPageIds = Object.keys(this.props.pages).filter(
      (pId) =>
        this.props.pages[pId].groupId &&
        this.props.pages[pId].groupId === this.props.group_id
    )

    let groupPagesArray = []
    for (let index = 0; index < groupPageIds.length; index++) {
      const id = groupPageIds[index]
      const groupPage = this.props.pages[id]
      groupPagesArray = [...groupPagesArray, groupPage]
    }

    groupPagesArray.sort(function (a, b) {
      if (a.name < b.name) { return -1 }
      if (a.name > b.name) { return 1 }
      return 0
    })

    const groupPages = {}
    for (let index = 0; index < groupPagesArray.length; index++) {
      const id = groupPagesArray[index].id
      groupPages[id] = this.props.pages[id]
    }

    return (
      <div>
        {this.filterGroupPages()}
        <div>
          {this.state.showDeleteModal &&
            pageService.showDeletePageModal(
              this.props,
              this.closeDeletePageModal.bind(this),
              'Delete Page',
              ' Are you sure you wish to delete this page? ',
              this.state.selectedPage
            )}
        </div>

        {groupPages &&
          Object.keys(groupPages)
            .filter(
              (pageId) =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === this.props.group_id
            )
            .map((pageId, index) => (
              <div
                key={index}
                className={
                  isDashboardRoute(this.props)
                    ? this.props.pages[pageId].state
                    : null
                }
              >
                <Pages
                  {...this.props}
                  page_id={pageId}
                  index={index}
                  onDragStart={this.onDragStart.bind(this)}
                  // onDragOver={(e) => {
                  //   e.preventDefault();
                  // }}
                  onDrop={this.onDrop.bind(this)}
                  open_delete_page_modal={this.openDeletePageModal.bind(this)}
                  close_delete_page_modal={this.closeDeletePageModal.bind(this)}
                />
              </div>
            ))}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupPages)
