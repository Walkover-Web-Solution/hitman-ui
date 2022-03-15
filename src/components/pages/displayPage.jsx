import React, { Component } from 'react'
import store from '../../store/store'
import { connect } from 'react-redux'
import { isDashboardRoute, isReviewed } from '../common/utility'
import ReactHtmlParser from 'react-html-parser'
import './page.scss'
import { updatePage } from './redux/pagesActions'
import EndpointBreadCrumb from '../endpoints/endpointBreadCrumb'
import ApiPageReviewModal from '../publishDocs/apiPageReviewModal'
import axios from 'axios'

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
      page: null,
      requestKey: null,
      openReviewModal: false,
      hideReviewbutton: true,
      name: '',
      comment: ''
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

  postApi () {
    const feedback = {
      parentId: '',
      parentType: 'page',
      vote: 1,
      user: '',
      comment: ''
    }
    const apiUrl = process.env.REACT_APP_API_URL
    feedback.parentId = this.props.match.params.pageId
    const collectionId = this.props.match.params.collectionId
    axios.post(apiUrl + `/collections/${collectionId}/feedbacks`, feedback)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
  }

  showApiPageReviewModal= () => <ApiPageReviewModal
    onHide={() => this.setState({ openReviewModal: false })}
    collection={this.props.match.params.collectionId}
    endpoint={this.props.match.params.pageId}
    endpointType='page'
                                />

  toggleReviewModal = () => this.setState({ openReviewModal: !this.state.openReviewModal });

  savelocalstorage (key, value) {
    if (window.localStorage.getItem('review') !== null) {
      const item = window.localStorage.getItem('review')
      const objList = JSON.parse(item)
      objList[key] = value
      window.localStorage.setItem('review', JSON.stringify(objList))
    } else {
      const objList = {}
      objList[key] = value
      window.localStorage.setItem('review', JSON.stringify(objList))
    }
  }

  setDislike () {
    this.setState({ dislikeActive: !this.state.dislikeActive }, () => {
      const endpoint = this.props.match.params.pageId
      this.savelocalstorage(endpoint, 'dislike')
    })
  }

  setLike () {
    this.setState({ likeActive: !this.state.likeActive })
    const endpoint = this.props.match.params.pageId
    this.savelocalstorage(endpoint, 'like')
    this.postApi()
  }

  handleLike () {
    this.setLike()
  }

  handleDislike () {
    this.setDislike()
    this.toggleReviewModal()
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
        {!isReviewed(this.props.match.params.pageId) &&
          <div>
            <button onClick={() => { this.handleLike() }}>like</button>
            <button onClick={() => { this.handleDislike() }}> dislike </button>
          </div>}
        {this.state.openReviewModal && this.showApiPageReviewModal()}
        {!isDashboardRoute(this.props) && isReviewed(this.props.match.params.pageId) &&
          <div>
            <span>Thank you for reviewing</span>
          </div>}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayPage)
