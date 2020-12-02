import Joi from 'joi-browser'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { importVersion } from '../collectionVersions/redux/collectionVersionsActions'
import Form from '../common/form'

const mapDispatchToProps = (dispatch) => {
  return {
    import_version: (importLink, shareIdentifier, collectionId) =>
      dispatch(importVersion(importLink, shareIdentifier, collectionId))
  }
}
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
    // if (this.props.location.shareIdentifier) {
    // }
  }

  async doSubmit (props) {
    if (this.props.title === 'Import Version') {
      this.props.onHide()
      const collectionId = this.props.selected_collection.id
      const importLink = this.state.data.shareVersionLink
      const shareIdentifier = importLink.split('/')[4]
      this.props.import_version(importLink, shareIdentifier, collectionId)
    }
  }

  render () {
    return (
      <Modal
        {...this.props}
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
            {this.renderInput(
              'shareVersionLink',
              'Public Link',
              'Enter a public link'
            )}
            <div name='shareVersionLink' label='Public Link' />
            <div className='text-right mt-4 mb-2'>
              {this.renderButton('Submit', 'right')}
              <button
                className='btn btn-secondary ml-2 btn-lg'
                onClick={this.props.onHide}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default connect(null, mapDispatchToProps)(ShareVersionForm)
