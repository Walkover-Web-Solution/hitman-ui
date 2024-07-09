import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import './publishDocsConfirmModal.scss'
import withRouter from '../common/withRouter'

class PublishDocsConfirmModal extends Component {
  state = {}

  handleOkay(collectionId) {
    const { orgId } = this.props.params
    if (collectionId) {
      this.props.navigate(`/orgs/${orgId}/admin/publish?collectionId=${collectionId}`)
    }
    this.props.onHide()
  }

  render() {
    return (
      <Modal
        size='lg'
        // dialogClassName={"publish-doc-confirm-modal"}
        centered
        onHide={this.props.onHide}
        show={this.props.show}
      >
        <div>
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>All set to publish your API doc, just a few more steps to go</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              <li>Publish the endpoints you wish to make public.</li>
              <li>{' Publish the collection, once you are finished with the above step.'}</li>
            </ul>

            <button
              className='btn btn-primary'
              onClick={(e) => {
                this.handleOkay(this.props.collection_id)
              }}
            >
              Okay
            </button>
          </Modal.Body>
        </div>
      </Modal>
    )
  }
}

export default withRouter(PublishDocsConfirmModal)
