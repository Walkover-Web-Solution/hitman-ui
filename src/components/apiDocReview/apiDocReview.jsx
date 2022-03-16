import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import Axios from 'axios'
import _ from 'lodash'
import { Modal } from 'react-bootstrap'

const LIKE = 'like'
const DISLIKE = 'dislike'

class ApiDocReview extends Component {
  state = {
    parentId: '',
    parentType: '',
    vote: null,
    user: '',
    comment: '',
    showFeedbackModal: false,
    currentReviews: {}
  }

  componentDidMount () {
    this.setParent()
    this.setLocalStorageReviews()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.match.params !== this.props.match.params) {
      this.setParent()
    }
  }

  setLocalStorageReviews () {
    try {
      this.setState({ currentReviews: JSON.parse(window.localStorage.getItem('review')) || {} })
    } catch {
      this.setState({ currentReviews: {} })
    }
  }

  setParent () {
    const { pageId, endpointId } = this.props.match.params

    const parentId = endpointId || pageId
    const parentType = endpointId ? 'endpoint' : 'page'

    this.setState({ parentId, parentType })
  }

  toggleReviewModal = () => this.setState({ showFeedbackModal: !this.state.showFeedbackModal });

  handleOnClick (value, callback) {
    const { pageId, endpointId } = this.props.match.params

    const entityId = endpointId || pageId

    if (entityId) {
      this.setState({ vote: this.getVoteValue(value) }, () => {
        if (callback) callback()
      })
    }
  }

  savelocalstorage (key, value) {
    let objList = {}
    try {
      objList = JSON.parse(window.localStorage.getItem('review')) || {}
    } catch {
      objList = {}
    }
    objList[key] = value
    this.setState({ currentReviews: objList }, () => {
      window.localStorage.setItem('review', JSON.stringify(objList))
    })
  }

  postApi () {
    const feedback = _.pick(_.cloneDeep(this.state), 'parentId', 'parentType', 'user', 'vote', 'comment')

    const apiUrl = process.env.REACT_APP_API_URL
    const collectionId = this.props.match.params.collectionId
    Axios.post(apiUrl + `/collections/${collectionId}/feedbacks`, feedback)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
    this.savelocalstorage(this.state.parentId, this.getVoteKey(this.state.vote))
    this.setState({ user: '', comment: '', vote: null }, () => {
      this.closeFeedbackModal()
    })
  }

  getVoteValue (value) {
    return value === LIKE ? 1 : -1
  }

  getVoteKey (value) {
    return value === 1 ? LIKE : DISLIKE
  }

  closeFeedbackModal () {
    this.state.showFeedbackModal && this.setState({ showFeedbackModal: false })
  }

  handleOnSubmit (event) {
    event.preventDefault()
    this.postApi()
  }

  handleInput (event) {
    event.preventDefault()
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }

  renderUserFeedbackModal () {
    return (
      <Modal
        backdrop='static'
        show
        onHide={this.closeFeedbackModal.bind(this)}
      >
        <div className=''>
          <Modal.Header closeButton>
            <Modal.Title>Would you like to leave a comment?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleOnSubmit.bind(this)}>
              <label>
                Email:<br />
                <input onChange={this.handleInput.bind(this)} value={this.state.user} type='text' name='user' /><br />
              </label><br />
              <label>
                Comment<br />
                <textarea onChange={this.handleInput.bind(this)} value={this.state.comment} type='text' name='comment' /><br />
              </label>
              <br />
              <input type='submit' value='Submit' />
            </form>
          </Modal.Body>

          <Modal.Footer />
        </div>
      </Modal>
    )
  }

  render () {
    const isAlreadyReviewd = this.state.currentReviews[this.state.parentId]
    return !isDashboardRoute(this.props) &&
      (
        <>
          {this.state.showFeedbackModal && this.renderUserFeedbackModal()}
          {!isAlreadyReviewd &&
            (
              <div>
                <button onClick={() => { this.handleOnClick(LIKE, this.postApi.bind(this)) }}>like</button>
                <button onClick={() => { this.handleOnClick(DISLIKE, this.toggleReviewModal.bind(this)) }}> dislike </button>
              </div>
            )}
          {isAlreadyReviewd &&
            (
              <div>
                <span>Thank you for reviewing</span>
              </div>
            )}
        </>
      )
  }
}

export default (ApiDocReview)
