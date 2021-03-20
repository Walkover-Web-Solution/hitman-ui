import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Form from '../common/form'

class ShareVersionForm extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        shareVersionLink: ''
      },
      errors: {}
    }

    this.schema = {
      shareVersionLink: Joi.string().required().label('Public Link')
    }
  }

  componentDidMount () {
    if (this.props.selectedVersion) {
      let data = {}
      const shareVersionLink =
        process.env.REACT_APP_API_URL +
        '/share/' +
        this.props.selectedVersion.shareIdentifier
      data = { shareVersionLink }
      data.disabled = true
      this.setState({ data })
    }
  }

  async doSubmit (props) { }

  render () {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput('shareVersionLink', 'Public Link')}
            <div name='shareVersionLink' label='Public Link' />
            <CopyToClipboard
              text={JSON.stringify(this.state.data.shareVersionLink).replace(
                /['"]+/g,
                ''
              )}
              onCopy={() => this.props.onHide()}
              className='btn btn-primary btn-lg'
            >
              <button>Copy</button>
            </CopyToClipboard>
            <button
              className='btn btn-secondary outline btn-lg ml-2'
              onClick={this.props.onHide}
            >
              Cancel
            </button>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default ShareVersionForm
