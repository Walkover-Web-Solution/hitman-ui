import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { onSubmitApifeedback } from '../publishDocs/redux/publishDocsActions'
import axios from 'axios'

const apiUrl = process.env.REACT_APP_API_URL

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmitApifeedback: (review, collectionId) => dispatch(onSubmitApifeedback(review, collectionId))
  }
}

class ApiPageReviewModal extends Component {
 state = {
   parentId: '',
   parentType: '',
   vote: -1,
   name: '',
   comment: ''
 }

 callback () {
   console.log('hello')
 }

 postApi () {
   console.log(this.state)
   const collectionId = this.props.collection
   const review = { ...this.state }
   axios.post(apiUrl + `/collections/${collectionId}/feedbacks`, review)
     .then(response => {
       console.log(response)
     })
     .catch(error => {
       console.log(error)
     })
 }

    handleOnSubmit= event => {
      event.preventDefault()

      this.setState({ parentId: this.props.endpoint, parentType: this.props.endpointType }, () => { this.postApi() })

      console.log(this.state)
      console.log(this.props)
    }

    handleInput = event => {
      const { target: { name, value } } = event
      this.setState({ [name]: value })
      console.log(this.state)
    }

    render () {
      return (
        <Modal onHide={() => this.props.onHide()} show>
          <div className=''>
            <Modal.Header closeButton>
              <Modal.Title>API FeedBack</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={this.handleOnSubmit}>
                <label>
                  User Name:<br />
                  <input onChange={this.handleInput} value={this.state.name} type='text' name='name' /><br />
                </label><br />
                <label>
                  Comment<br />
                  <textarea onChange={this.handleInput} value={this.state.comment} type='text' name='comment' /><br />
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
}
export default connect(null, mapDispatchToProps)(ApiPageReviewModal)
