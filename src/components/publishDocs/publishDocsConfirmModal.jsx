import React from 'react'
import { Modal } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import './publishDocsConfirmModal.scss'
import withRouter from '../common/withRouter'

const PublishDocsConfirmModal = (props) => {
  const params = useParams()

  function handleOkay(collectionId) {
    const { orgId } = params
    if (collectionId) {
      this.props.navigate(`/orgs/${orgId}/admin/publish?collectionId=${collectionId}`)
    }
    props.onHide()
  }

  return (
    <Modal size='lg' centered onHide={props.onHide} show={props.show}>
      <div>
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>All set to publish your API doc, just a few more steps to go</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>Publish the endpoints you wish to make public.</li>
            <li>{' Publish the collection, once you are finished with the above step.'}</li>
          </ul>
          <button className='btn btn-primary' onClick={() => handleOkay(props.collection_id)}>
            Okay
          </button>
        </Modal.Body>
      </div>
    </Modal>
  )
}

export default withRouter(PublishDocsConfirmModal)
