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
class VersionPages extends Component {
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
        'versionPages'
      )
      this.filteredVersionPages = versionIdsAndFilteredPages[0]
      versionIds = versionIdsAndFilteredPages[1]
      this.setState({ filter: this.props.filter })
      if (versionIds.length !== 0) {
        this.props.show_filter_version(versionIds, 'versionPages')
      } else {
        this.props.show_filter_version(null, 'versionPages')
      }
    }
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
        {this.props.pagesToRender
          .map((pageId, index) => (
            <div key={index} className='linkWith'>
              {
                  isDashboardRoute(this.props)
                    ? (
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
                          open_delete_page_modal={this.openDeletePageModal.bind(
                            this
                          )}
                          close_delete_page_modal={this.closeDeletePageModal.bind(
                            this
                          )}
                        />
                      </div>
                      )
                    : (
                      <Pages
                        {...this.props}
                        page_id={pageId}
                        index={index}
                        open_delete_page_modal={this.openDeletePageModal.bind(this)}
                        close_delete_page_modal={this.closeDeletePageModal.bind(
                          this
                        )}
                      />
                      )
                }
            </div>
          ))}
      </>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VersionPages)
