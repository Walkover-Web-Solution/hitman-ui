import React, { useState, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Joi from 'joi-browser';
import { onEnter, validate } from '../common/utility';
import { useDispatch } from 'react-redux';
import { addCollection } from './redux/collectionsActions';
import { defaultViewTypes } from './defaultViewModal/defaultViewModal';
import RenderSaveButton from '../common/formComponents/renderSaveButton';
import Input from '../common/input';

const CollectionForm = (props) => {

  const inputRef = useRef(null);
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});

  const schema = { name: Joi.string().min(3).max(50).trim().required().label('Collection Name') };

  const redirectToCollection = (collection) => {
    if (!collection.data) {
      console.error('collection.data is undefined');
      return;
    }
    if (collection.success) navigate(`/orgs/${params.orgId}/dashboard/collection/${collection.data.id}/settings`);
    props.onHide();
  };

  const doSubmit = async () => {
    const errors = validate({ name: inputRef.current.value }, schema);
    if (errors) return setErrors(errors)
    dispatch(addCollection({ name: inputRef.current.value }, null, redirectToCollection))
  }

  return (
    <div onKeyDown={(e) => { onEnter(e, doSubmit) }}>
      <Modal.Header className="custom-collection-modal-container" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Input name="name" urlName="Name" label="Collection Name" placeholder="Collection Name" mandatory={true} isURLInput={true} note="*collection name accepts min 3 and max 50 characters" ref={inputRef} errors={errors} />
        <RenderSaveButton saveCollection={doSubmit} defaultViewTypes={defaultViewTypes.TESTING} />
      </Modal.Body>
    </div>
  );
};

export default CollectionForm