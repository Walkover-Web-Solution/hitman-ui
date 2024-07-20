import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import Joi from 'joi-browser';
import {
  handleBlurInUrlField,
  handleChangeInUrlField,
  onEnter,
  validate,
} from '../common/utility';   
import shortid from 'shortid';
import { useDispatch } from 'react-redux';
import { addCollection, updateCollection } from './redux/collectionsActions';
import { moveToNextStep } from '../../services/widgetService';
import { defaultViewTypes } from './defaultViewModal/defaultViewModal';
import withRouter from '../common/withRouter';
import RenderInput from '../common/formComponents/renderInput';
import RenderSaveButton from '../common/formComponents/renderSaveButton';


const CollectionForm = (props) => {
  const dataRef = useRef({
    name : '',
    description : '',
    defaultView : defaultViewTypes.TESTING
  })

  const dispatch = useDispatch();
  const [collectionId, setCollectionId] = useState('');
  const [errors, setErrors] = useState({});
  const inputRef = useRef();
  const step = 1;


  const schema = {
    name: Joi.string().min(3).max(50).trim().required().label('Collection Name'),
    description: Joi.string().allow(null, '').label('Description'),
    defaultView: Joi.string().allow(null, '').label('Default View'),
  };

  useEffect(() => {
    if (!props.show || props.title === 'Add new Collection') return;
  }, []);

  const redirectToCollection = (collection) => {
    if (!collection.data) {
      console.error('collection.data is undefined');
      return;
    }
    const { id: collectionId } = collection.data;
    if (collection.success) {
      const { orgId } = props.params;
      props.navigate(`/orgs/${orgId}/dashboard/collection/${collectionId}/settings`);
    }
    if (props.setDropdownList) props.setDropdownList(collection.data);
    props.onHide();
  };

  const onEditCollectionSubmit = async (defaultView) => {

    dispatch(updateCollection({
      ...dataRef.current,
      id: collectionId,
      defaultView,
    }, null, redirectToCollection))
  };

  const onAddCollectionSubmit = async (defaultView) => {
    const requestId = shortid.generate();
    const defaultDocProperties = {
      defaultLogoUrl: '',
      defaultTitle: dataRef.current.name,
    };

    dispatch(addCollection({ ...dataRef.current, docProperties: defaultDocProperties, requestId, defaultView }, null, redirectToCollection))

    dataRef.current = {
      name: '',
      description: '',
      defaultView: defaultViewTypes.TESTING,
    };
    moveToNextStep(1);
  };

  const doSubmit = async (defaultView) => {
    const errors = validate({ name: dataRef.current.name }, schema);
    if (errors) {
      setErrors(errors);
      return null;
    }
    if (props.title === 'Edit Collection') {
      onEditCollectionSubmit(defaultView);
    }
    if (props.title === 'Add new Collection') {
      onAddCollectionSubmit(defaultView);
      if (props.setDropdownList) props.onHide();
    }
  };

  const handleBlur = (e, isURLInput = false) => {
    const updatedData = { ...dataRef.current };
    if (isURLInput) {
      updatedData[e.currentTarget.name] = handleBlurInUrlField(updatedData[e.currentTarget.name]);
    }
    dataRef.current = updatedData
    setErrors({});
  };

  // use useRef
  const handleChange = (e, isURLInput = false) => {
    const updatedData = { ...dataRef.current };
    updatedData[e.currentTarget.name] = e.currentTarget.value;
    if (isURLInput) {
      updatedData[e.currentTarget.name] = handleChangeInUrlField(updatedData[e.currentTarget.name]);
    }
    dataRef.current = updatedData
    setErrors({});
  };

  const validateForm = () => {
    return null;
  };

  const handleKeyPress = () => {
    const errors = validateForm();
    setErrors(errors || {});
    if (errors) return;
    doSubmit();
  };

  return (
    <div
      onKeyPress={(e) => {
        onEnter(e, handleKeyPress);
      }}
    >
      <Modal
        size="sm"
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        onHide={props.onHide}
        show={props.show}
      >
        <div>
          <Modal.Header className="custom-collection-modal-container" closeButton>
            <Modal.Title id="contained-modal-title-vcenter">{props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {step === 1 && (
              <>
                <RenderInput
                  name="name"
                  urlName="Name"
                  label="Collection Name"
                  placeholder="Collection Name"
                  mandatory={true}
                  isURLInput={true}
                  note="*collection name accepts min 3 and max 50 characters"
                  inputRef={inputRef}
                  data={dataRef.current}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />

                <RenderSaveButton saveCollection={doSubmit} defaultViewTypes={defaultViewTypes.TESTING} />
              </>
            )}
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

export default withRouter(CollectionForm)