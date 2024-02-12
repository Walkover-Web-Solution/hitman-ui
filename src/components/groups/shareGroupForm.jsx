import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Form from '../common/form'

class ShareGroupForm extends Form {
  state = {
    data: {
      shareGroupLink: ''
    },
    errors: {}
  }

  componentDidMount() {
    if (this.props.selectedGroup) {
      let data = {}
      const shareGroupLink = process.env.REACT_APP_API_URL + '/shareSubPage/' + this.props.selectedGroup
      data = { shareGroupLink }
      data.disabled = true
      this.setState({ data })
    }
  }

  schema = {
    shareVersionLink: Joi.string().required().label('Public Link')
  }

  async doSubmit(props) {}

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput('shareGroupLink', 'Public Link')}
            {<div name='shareGroupLink' label='Public Link' />}
            {
              <CopyToClipboard
                text={JSON.stringify(this.state.data.shareGroupLink).replace(/['"]+/g, '')}
                onCopy={() => this.props.onHide()}
                className='btn btn-primary btn-lg'
              >
                <button>Copy</button>
              </CopyToClipboard>
            }
            <button className='btn btn-secondary outline btn-lg ml-2' onClick={this.props.onHide}>
              Cancel
            </button>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default ShareGroupForm
