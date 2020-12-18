import React, { Component } from 'react'
import store from '../../store/store'
import { isDashboardRoute } from '../common/utility'
import ReactHtmlParser from 'react-html-parser'
import './page.scss'

class DisplayPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: { id: null, versionId: null, groupId: null, name: '', contents: '' }
    }
  }

  fetchPage (pageId) {
    let data = {}
    const { pages } = store.getState()
    const page = pages[pageId]
    if (page) {
      const { id, versionId, groupId, name, contents } = page
      data = { id, versionId, groupId, name, contents }
      this.setState({ data })
    }
  }

  async componentDidMount () {
    if (!this.props.location.page) {
      let pageId = ''
      if (isDashboardRoute(this.props)) { pageId = this.props.location.pathname.split('/')[3] } else pageId = this.props.location.pathname.split('/')[4]
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
    if (this.props.pageId && prevProps !== this.props) {
      this.setState({ data: this.props.pages[this.props.pageId] })
    }
  }

  handleEdit (page) {
    this.props.history.push({
      pathname: `/dashboard/page/${page.id}/edit`,
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
    const pageHeading = {
      color: this.props.publicCollectionTheme
    }
    return (
      !isDashboardRoute(this.props, true) ? <h3 className='' style={pageHeading}>{this.state.data.name}</h3> : <h3 className=''>{this.state.data.name}</h3>
    )
  }

  render () {
    if (this.props.location.page) {
      const data = { ...this.props.location.page }
      this.setState({ data })
      this.props.history.push({ page: null })
    }
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

export default DisplayPage
