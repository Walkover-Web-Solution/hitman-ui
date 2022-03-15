import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import axios from 'axios'

const apiUrl = process.env.REACT_APP_API_URL

class ApiPageReviewModal extends Component {
 state = {
   parentId: '',
   parentType: '',
   vote: -1,
   user: '',
   comment: ''
 }

 callback () {
   console.log('hello')
 }

 postApi () {
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

 handleClose () {
   console.log(this.props.onHide)
   // this.setstate({showModal:false})
   // console.log(this.state.showModal)
 }

    handleOnSubmit= event => {
      event.preventDefault()
      this.setState({ parentId: this.props.endpoint, parentType: this.props.endpointType }, () => { this.postApi() })
      this.props.onHide()
    }

    handleInput = event => {
      const { target: { name, value } } = event
      this.setState({ [name]: value })
    }

    render () {
      return (
        <Modal
          backdrop='static'
          show
          onHide={this.props.onHide}
        >
          <div className=''>
            <Modal.Header closeButton>
              <Modal.Title>API FeedBack</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={this.handleOnSubmit}>
                <label>
                  Email:<br />
                  <input onChange={this.handleInput} value={this.state.user} type='text' name='user' /><br />
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
export default (ApiPageReviewModal)
