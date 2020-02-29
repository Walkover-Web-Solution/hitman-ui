import React from 'react'
import Form from './common/form'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { apiUrl } from "../config.json";

class ShareVersionForm extends Form {
  state = {
    data: {
      shareVersionLink:''
    },  
    errors: {}
  }

  componentDidMount() {
      if(this.props.location.shareIdentifier){
      }
  }

  schema = {
    shareVersionLink: Joi.string()
      .required()
      .label('Public Link')
  }

  async doSubmit (props) {
    if (this.props.title === 'Import Version') {
        this.props.history.push({
            pathname: `/dashboard/collections`,
            importVersionLink:{...this.state.data},
           collectionId:this.props.location.pathname.split('/')[2]
        })
    }
  }


  render () {
    return (
     <Modal
        {...this.props}
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput('shareVersionLink', 'Public Link') }
            {<div name='shareVersionLink' label='Public Link'>
                </div>}
            {this.renderButton('Submit','right')}
            <Link to={`/dashboard/collections`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default ShareVersionForm