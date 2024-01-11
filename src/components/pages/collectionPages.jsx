import React, { Component } from 'react'
import { connect } from 'react-redux'
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
    duplicate_page: (page) => dispatch(duplicatePage(page))
  }
}
class CollectionPages extends Component {
  constructor (props) {
    super(props)
    this.state = {}
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

  extractPages () {
    const pages = {}
    for (let i = 0; i < Object.keys(this.props.pages).length; i++) {
      if (
        this.props.pages[Object.keys(this.props.pages)[i]].versionId ===
        this.props.version_id &&
        this.props.pages[Object.keys(this.props.pages)[i]].groupId === null
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

  filterVersionPages () {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== '' &&
      this.filterFlag === false
    ) {
      this.filterFlag = true
      let versionIds = []
      let versionIdsAndFilteredPages = []
      versionIdsAndFilteredPages = filterService.filter(
        this.props.pages,
        this.props.filter,
        'collectionPages'
      )
      this.filteredVersionPages = versionIdsAndFilteredPages[0]
      versionIds = versionIdsAndFilteredPages[1]
      this.setState({ filter: this.props.filter })
      if (versionIds.length !== 0) {
        this.props.show_filter_pages(versionIds, 'collectionPages')
      } else {
        this.props.show_filter_pages(null, 'collectionPages')
      }
    }
  }

  renderPublicPages () {
    const collectionPageIds = Object.keys(this.props.pages).filter(
      (pId) =>
        this.props.pages[pId].parentId === '-1' &&
        this.props.pages[pId].parentId === this.props.parent_id
    )
    let collectionPagesArray = []
    for (let index = 0; index < collectionPageIds.length; index++) {
      const id = collectionPageIds[index]
      const groupPage = this.props.pages[id]
      collectionPagesArray = [...collectionPagesArray, groupPage]
    }

    collectionPagesArray.sort(function (a, b) {
      if (a.position < b.position) { return -1 }
      if (a.position > b.position) { return 1 }
      return 0
    })

    const collectionPages = {}
    for (let index = 0; index < collectionPagesArray.length; index++) {
      const id = collectionPagesArray[index].id
      collectionPages[id] = this.props.pages[id]
    }
    return (
      collectionPages &&
        Object.keys(collectionPages)
          .map((pageId, index) => (
            <div key={index} className='linkWith'>
              <Pages
                {...this.props}
                page_id={pageId}
                index={index}
                open_delete_page_modal={this.openDeletePageModal.bind(this)}
                close_delete_page_modal={this.closeDeletePageModal.bind(
                  this
                )}
              />
            </div>
          )
          )
    )
  }

  renderDashboardPages () {
    // return (
      // this.props.pagesToRender
      //   .map((pageId, index) => (
      //     <div key={index} className='linkWith'>
      //       <div key={index} className={isDashboardRoute(this.props) ? this.props.pages[pageId].state : null}>
      //         <Pages
      //           {...this.props}
      //           page_id={pageId}
      //           index={index}
      //           open_delete_page_modal={this.openDeletePageModal.bind(   
      //             this
      //           )}
      //           close_delete_page_modal={this.closeDeletePageModal.bind(
      //             this
      //           )}
      //         />
      //       </div>
      //     </div>
      //   )))
  }

  render () {
    return (
      <>
        {this.state.showDeleteModal &&
            pageService.showDeletePageModal(
              this.props,
              this.closeDeletePageModal.bind(this),
              'Delete Page',
              ' Are you sure you wish to delete this page? ',
              this.state.selectedPage
            )}
        {isDashboardRoute(this.props, true) ? this.renderDashboardPages() : this.renderPublicPages()}

      </>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CollectionPages)
