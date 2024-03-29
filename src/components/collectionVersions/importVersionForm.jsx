import Joi from 'joi-browser'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import Form from '../common/form'
import { onEnter } from '../common/utility'

const apiUrl = process.env.REACT_APP_API_URL

const mapDispatchToProps = (dispatch) => {
  return {}
}
class ShareVersionForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        shareVersionLink: ''
      },
      errors: {}
    }
    this.pattern = new RegExp(`^${apiUrl}/share/[\\w|-]+$`, 'g')
    this.schema = {
      shareVersionLink: Joi.string()
        .regex(this.pattern)
        .required()
        .error((errors) => {
          errors.forEach((err) => {
            switch (err.type) {
              case 'string.regex.base':
                err.message = `Link should be valid version shareable link for example ${apiUrl}/share/id`
                break
              default:
                break
            }
          })
          return errors
        })
        .label('Public Link')
    }
  }

  componentDidMount() {
    // if (this.props.location.shareIdentifier) {
    // }
  }

  async doSubmit(props) {
    if (this.props.title === 'Import Version') {
      this.props.onHide()
      const collectionId = this.props.selected_collection.id
      const importLink = this.state.data.shareVersionLink
      const shareIdentifier = importLink.split('/')[4]
      // this.props.import_version(importLink, shareIdentifier, collectionId)
    }
  }

  render() {
    return (
      <div onKeyPress={(e) => onEnter(e, this.handleKeyPress.bind(this))}>
        <Modal
          show={this.props.show}
          onHide={this.props.onHide}
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              {this.renderInput('shareVersionLink', 'Public Link', 'Enter a public link', false, false, true)}
              <div name='shareVersionLink' label='Public Link' />
              <div className='text-left mt-4 mb-2'>
                {this.renderButton('Submit', 'right')}

                <button className='btn btn-secondary outline ml-2 btn-lg' onClick={this.props.onHide}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(ShareVersionForm)
