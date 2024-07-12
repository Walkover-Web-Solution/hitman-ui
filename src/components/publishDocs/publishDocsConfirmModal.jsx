import React from 'react';
import { Modal } from 'react-bootstrap';
import { useHistory, useRouteMatch } from 'react-router-dom';
import './publishDocsConfirmModal.scss';

const PublishDocsConfirmModal = (props) => {
  const history = useHistory();
  const match = useRouteMatch();

  const handleOkay = (collectionId) => {
    if (collectionId) {
      history.push({
        pathname: `/orgs/${match.params.orgId}/admin/publish`,
        search: `?collectionId=${collectionId}`,
      });
    }
    props.onHide();
  };

  return (
    <Modal size='lg' centered onHide={props.onHide} show={props.show} >
      <div>
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            All set to publish your API doc, just a few more steps to go
          </Modal.Title>
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
  );
};

export default PublishDocsConfirmModal;