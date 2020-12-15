import React from 'react'
import { Modal } from 'react-bootstrap'
import Form from '../common/form'

class TagManagerModal extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: { gtmId: '' },
      errors: {}
    }
  }

  componentDidMount () {
    const data = { gtmId: '' }
    if (this.props.collection_id) {
      data.gtmId = this.props.collections[this.props.collection_id].gtmId
    }
    this.setState({ data })
  }

  async doSubmit () {
    const updatedCollection = this.props.collections[this.props.collection_id]
    updatedCollection.gtmId = this.state.data.gtmId
    this.props.update_collection(updatedCollection)
    this.props.onHide()
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
        <div>
          <Modal.Header
            className='custom-collection-modal-container'
            closeButton
          >
            <Modal.Title id='contained-modal-title-vcenter'>
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              {this.renderInput('gtmId', 'GTM-ID', '')}
              <div className='text-right mt-2 mb-2'>
                <button
                  className='btn btn-secondary outline btn-lg mr-2'
                  onClick={this.props.onHide}
                >
                  Cancel
                </button>
                <button
                  className='btn btn-primary btn-lg'
                  type='button'
                  onClick={() => this.doSubmit()}
                >
                  Submit
                </button>
              </div>
            </form>
          </Modal.Body>
        </div>
      </Modal>
    )
  }
}

export default TagManagerModal
