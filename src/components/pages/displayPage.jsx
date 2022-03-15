import React, { Component } from 'react'
import store from '../../store/store'
import { connect } from 'react-redux'
import { isDashboardRoute } from '../common/utility'
import ReactHtmlParser from 'react-html-parser'
import './page.scss'
import { updatePage } from './redux/pagesActions'
import EndpointBreadCrumb from '../endpoints/endpointBreadCrumb'
import ApiPageReviewModal from '../publishDocs/apiPageReviewModal'

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
      Comment: ''
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

  showApiPageReviewModal= () => <ApiPageReviewModal
    onHide={() => this.setState({ openReviewModal: false })}
    collection={this.props.match.params.collectionId}
    endpoint={this.props.match.params.pageId}
    endpointType='page'
                                />

  toggleReviewModal = () => this.setState({ openReviewModal: !this.state.openReviewModal });

  savelocalstorage (key2, value) {
    const key = {}
    const key1 = key2
    key[key1] = value
    this.setState({ keyState: key }, () => {
      window.localStorage.setItem('review', JSON.stringify(key))
      // this.setState(prevState => ({ ...prevState, key }))
      // this.setState(prevState => ({ keyState: [...prevState.keyState, keystate2] }))
      console.log(this.state.keyState)
    })

    // let prevReview = window.localStorage.getItem('review')
    // let newReview = prevReview

    // const temp = window.localStorage.getItem('review')
    // this.setState(prevState => ({ key: [...prevState.key, newKey] }))
  }

  setDislike () {
    this.setState({ dislikeActive: !this.state.dislikeActive }, () => {
      const endpoint = this.props.match.params.endpointId
      this.savelocalstorage(endpoint, 'dislike')
      // window.localStorage.setItem('review', JSON.stringify(review))
      //   this.setState({ endpoint: endpoint })
      //   const review = { ...this.state.review.endpoint }
      //   review.endpoint = endpoint[4]
      //   if (this.state.dislikeActive) { review.feedback = 'disliked' }
      //   //window.localStorage.setItem('review', JSON.stringify(review))
      // this.savelocalstorage(endpoint,'dislike')
      // const review = '{}';
      // const key = JSON.parse(review);
      // this.setState(prevState => ({ key: [...prevState.key, key] }))
    })
  }

  setLike () {
    this.setState({ likeActive: !this.state.likeActive })
    const endpoint = this.props.match.params.endpointId
    this.savelocalstorage(endpoint, 'like')
    // const review = '{}';
    // if(this.state.likeActive){ this.setState({feedback'liked'}) }
    // const key = JSON.parse(review);
    // const key1 = endpoint[4]
    // key[key1] = 'like'
    // let newReview = {endpoint,feedback}
    // this.state.review.endpoint = endpoint[4]
    // this.state.review.feedback = this.state.likeActive
    // window.localStorage.setItem('review', JSON.stringify(this.state.key))
    // console.log(this.state.key)
    // this.setState(prevState => ({ key: [...prevState.key, key] }))
  }

  handleLike () {
    // this.setState({ hideReviewbutton:!this.state.hideReviewbutton })
    if (this.state.dislikeActive) {
      // this.setLike();
      // this.setDislike();
    }
    this.setLike()
  }

  handleDislike () {
    // this.setState({ hideReviewbutton:!this.state.hideReviewbutton })
    if (this.state.likeActive) {
      // this.setDislike();
      // this.setLike();
    }
    this.setDislike()
    this.toggleReviewModal()
  }

  // handletemp () {
  //   this.state.keyState.num = 'tkd'
  //   const keyState = {}
  //   keyState.num = 'tkd'
  //   this.setState(keyState)
  //   console.log(this.props.match.params.endpointId)
  // }

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
        <button>hii</button>
        {
          <div>
            <button onClick={() => { this.handleLike() }}>like</button>
            <span>'    '</span>
            <button onClick={() => { this.handleDislike() }}> dislike </button>
          </div>
        }
        {this.state.openReviewModal && this.showApiPageReviewModal()}
        <button onClick={() => { this.handletemp() }}> temp </button>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayPage)
