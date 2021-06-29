import React, { Component } from 'react'
import store from '../../store/store'
import { connect } from 'react-redux'
import { isDashboardRoute } from '../common/utility'
import ReactHtmlParser from 'react-html-parser'
import './page.scss'
import { updatePage } from './redux/pagesActions'
import EndpointBreadCrumb from '../endpoints/endpointBreadCrumb'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (editedPage, pageId) =>
      dispatch(updatePage(ownProps.history, editedPage, pageId))
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
      page: null
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
        <div className='pageText'>
          {ReactHtmlParser(this.props.pages[this.props.pageId].publishedPage.contents)}
        </div>
      )
    } else {
      return (
        <div className='pageText'>
          {ReactHtmlParser(this.state.data.contents)}
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

  render () {
    return (
      <div className='custom-display-page'>
        {
          isDashboardRoute(this.props)
            ? (
              <button
                className='btn btn-primary btn-extra-lg'
                onClick={() => {
                  this.handleEdit(this.state.data)
                }}
              >
                Edit page
              </button>
              )
            : null
        }
        {this.renderPageName()}
        {this.checkPageRejected()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayPage)
